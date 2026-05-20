"use client";

import { useRef, useState } from "react";
import * as tus from "tus-js-client";
import { UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";

export interface StreamUploadResult {
  uid: string;
  embedUrl: string;
  thumbnailUrl: string;
  durationSec: number | null;
}

interface StreamUploaderProps {
  onComplete: (r: StreamUploadResult) => void;
}

const CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB

interface InitResponse {
  guid: string;
  libraryId: string;
  authorizationSignature: string;
  authorizationExpire: number;
  tusEndpoint: string;
}

export default function StreamUploader({ onComplete }: StreamUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setDone(false);
    setProgress(0);
    setStatus("Requesting upload URL…");

    const init = await fetch("/api/admin/stream/create-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: file.size, name: file.name }),
    });
    if (!init.ok) {
      const j = (await init.json().catch(() => ({}))) as { error?: string };
      setError(j.error || "Failed to start upload.");
      setProgress(null);
      return;
    }
    const upload = (await init.json()) as InitResponse;

    setStatus("Uploading to Bunny Stream…");

    const tusUpload = new tus.Upload(file, {
      endpoint: upload.tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: CHUNK_SIZE,
      headers: {
        AuthorizationSignature: upload.authorizationSignature,
        AuthorizationExpire: String(upload.authorizationExpire),
        VideoId: upload.guid,
        LibraryId: upload.libraryId,
      },
      metadata: {
        filetype: file.type || "video/mp4",
        title: file.name,
      },
      onError(err) {
        setError(err.message || "Upload failed.");
        setProgress(null);
      },
      onProgress(sent, total) {
        setProgress(Math.round((sent / total) * 100));
      },
      async onSuccess() {
        setStatus("Finalizing on Bunny…");
        type StreamInfo = {
          uid: string;
          embedUrl: string;
          thumbnail: string;
          duration?: number;
          readyToStream?: boolean;
          error?: string;
        };
        let info: StreamInfo | null = null;
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, i === 0 ? 800 : 2500));
          const r = await fetch(`/api/admin/stream/${upload.guid}`);
          if (r.ok) {
            const j = (await r.json()) as StreamInfo;
            // Bunny populates duration + thumbnail name within a few seconds
            // even before encoding completes. Keep polling until we have a
            // duration > 0 so the form auto-fills meaningful values.
            if (j.duration && j.duration > 0) {
              info = j;
              break;
            }
            info = j; // capture latest in case poll loop exits
          }
        }

        const result: StreamUploadResult = {
          uid: upload.guid,
          embedUrl:
            info?.embedUrl ||
            `https://iframe.mediadelivery.net/embed/${upload.libraryId}/${upload.guid}`,
          thumbnailUrl: info?.thumbnail || "",
          durationSec:
            info?.duration && info.duration > 0
              ? Math.round(info.duration)
              : null,
        };
        onComplete(result);
        setStatus(
          info?.readyToStream
            ? "Upload complete and ready to play."
            : "Upload complete. Bunny is still encoding — playback ready in ~1 min."
        );
        setDone(true);
        setProgress(100);
      },
    });

    tusUpload.start();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null && progress < 100}
        className="inline-flex items-center gap-2 bg-deama-surface hover:bg-deama-border border border-deama-border rounded px-3 py-2 text-sm disabled:opacity-60"
      >
        <UploadCloud size={14} />
        {progress === null
          ? "Upload video to Bunny Stream"
          : progress < 100
          ? `Uploading… ${progress}%`
          : "Re-upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {progress !== null && (
        <div className="h-1.5 w-full bg-deama-border rounded overflow-hidden">
          <div
            className="h-full bg-deama-red transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {status && (
        <p className="text-xs text-deama-muted inline-flex items-center gap-1">
          {done ? (
            <CheckCircle2 size={12} className="text-green-400" />
          ) : null}
          {status}
        </p>
      )}
      {error && (
        <p className="text-xs text-deama-red inline-flex items-center gap-1">
          <AlertTriangle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

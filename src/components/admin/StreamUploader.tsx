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

const CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB — multiple of 256 KB, >= 5 MB

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
    const { uploadUrl, uid } = (await init.json()) as {
      uploadUrl: string;
      uid: string;
    };

    setStatus("Uploading to Cloudflare Stream…");

    const upload = new tus.Upload(file, {
      uploadUrl,
      chunkSize: CHUNK_SIZE,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError(err) {
        setError(err.message || "Upload failed.");
        setProgress(null);
      },
      onProgress(sent, total) {
        setProgress(Math.round((sent / total) * 100));
      },
      async onSuccess() {
        setStatus("Finalizing on Cloudflare…");
        // Poll the video record briefly so we can grab the auto-thumbnail
        // and duration. CF returns these even before encoding completes.
        type StreamInfo = {
          uid: string;
          embedUrl: string;
          thumbnail: string;
          duration?: number;
          error?: string;
        };
        let info: StreamInfo | null = null;
        for (let i = 0; i < 8; i++) {
          await new Promise((r) => setTimeout(r, i === 0 ? 500 : 2000));
          const r = await fetch(`/api/admin/stream/${uid}`);
          if (r.ok) {
            const j = (await r.json()) as StreamInfo;
            if (j.thumbnail) {
              info = j;
              break;
            }
          }
        }

        const result: StreamUploadResult = {
          uid,
          embedUrl:
            info?.embedUrl || `https://iframe.cloudflarestream.com/${uid}`,
          thumbnailUrl: info?.thumbnail || "",
          durationSec:
            info?.duration && info.duration > 0
              ? Math.round(info.duration)
              : null,
        };
        onComplete(result);
        setStatus("Upload complete. CF is still encoding — playback ready in ~1 min.");
        setDone(true);
        setProgress(100);
      },
    });

    upload.start();
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
          ? "Upload video to Cloudflare Stream"
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

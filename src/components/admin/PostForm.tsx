"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Save, Trash2 } from "lucide-react";
import StreamUploader, {
  type StreamUploadResult,
} from "./StreamUploader";

interface CategoryOpt {
  id: string;
  name: string;
}

export interface PostInitial {
  id?: string;
  title: string;
  slug: string;
  description: string;
  embedUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSec: number | "";
  categoryId: string;
  published: boolean;
  trending: boolean;
}

export default function PostForm({
  initial,
  categories,
}: {
  initial: PostInitial;
  categories: CategoryOpt[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<PostInitial>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial.id);

  function update<K extends keyof PostInitial>(key: K, value: PostInitial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadThumb(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      setError("Thumbnail upload failed.");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    update("thumbnailUrl", url);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        ...form,
        durationSec: form.durationSec === "" ? null : Number(form.durationSec),
      };
      const res = await fetch(
        isEdit ? `/api/admin/posts/${initial.id}` : "/api/admin/posts",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => ({ error: "Save failed" }))) as {
          error?: string;
        };
        setError(j.error || "Save failed.");
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    });
  }

  async function remove() {
    if (!initial.id) return;
    if (!confirm("Delete this post for good?")) return;
    const res = await fetch(`/api/admin/posts/${initial.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/posts");
      router.refresh();
    } else {
      setError("Delete failed.");
    }
  }

  const inputCls =
    "w-full bg-deama-black border border-deama-border focus:border-deama-red rounded px-3 py-2 text-sm focus:outline-none";
  const labelCls =
    "block text-xs uppercase tracking-wider text-deama-muted mb-1";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={labelCls}>Title</label>
        <input
          required
          maxLength={200}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Slug</label>
          <input
            required
            maxLength={120}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className={inputCls}
            placeholder="auto from title if empty"
          />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className={inputCls}
          >
            <option value="">— Select —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          rows={4}
          maxLength={4000}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputCls} resize-y`}
        />
      </div>

      <fieldset className="bg-deama-ink border border-deama-border rounded p-4 space-y-3">
        <legend className="px-2 text-xs uppercase tracking-wider text-deama-gold">
          Video source
        </legend>
        <div>
          <label className={labelCls}>Upload video file</label>
          <StreamUploader
            onComplete={(r: StreamUploadResult) => {
              update("embedUrl", r.embedUrl);
              if (r.thumbnailUrl) update("thumbnailUrl", r.thumbnailUrl);
              if (r.durationSec) update("durationSec", r.durationSec);
              update("videoUrl", "");
            }}
          />
          <p className="text-[10px] text-deama-muted mt-1">
            Resumable upload to Bunny Stream via TUS. Needs
            <code className="mx-1">BUNNY_STREAM_LIBRARY_ID</code>,
            <code className="mx-1">BUNNY_STREAM_API_KEY</code>, and
            <code className="mx-1">BUNNY_STREAM_PULL_ZONE</code> set.
          </p>
        </div>
        <div className="border-t border-deama-border pt-3">
          <label className={labelCls}>
            Embed URL (YouTube, Rumble, Bunny iframe, etc.)
          </label>
          <input
            value={form.embedUrl}
            onChange={(e) => update("embedUrl", e.target.value)}
            className={inputCls}
            placeholder="https://rumble.com/embed/<id>/  ·  https://www.youtube.com/embed/<id>  ·  https://iframe.mediadelivery.net/embed/<lib>/<guid>"
          />
        </div>
        <div>
          <label className={labelCls}>
            …OR direct video file URL (mp4 / hls)
          </label>
          <input
            value={form.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            className={inputCls}
            placeholder="https://videodelivery.net/<uid>/manifest/video.m3u8"
          />
        </div>
        <div>
          <label className={labelCls}>Duration (seconds, optional)</label>
          <input
            type="number"
            min={0}
            value={form.durationSec}
            onChange={(e) =>
              update(
                "durationSec",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className={inputCls}
          />
        </div>
      </fieldset>

      <fieldset className="bg-deama-ink border border-deama-border rounded p-4 space-y-3">
        <legend className="px-2 text-xs uppercase tracking-wider text-deama-gold">
          Thumbnail
        </legend>
        <div>
          <label className={labelCls}>Thumbnail URL</label>
          <input
            value={form.thumbnailUrl}
            onChange={(e) => update("thumbnailUrl", e.target.value)}
            className={inputCls}
            placeholder="https://imagedelivery.net/..."
          />
        </div>
        <div>
          <label className={labelCls}>…or upload image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadThumb(f);
            }}
            className="text-sm"
          />
        </div>
        {form.thumbnailUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={form.thumbnailUrl}
            alt="thumbnail preview"
            className="max-h-40 rounded border border-deama-border"
          />
        )}
      </fieldset>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Published
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.trending}
            onChange={(e) => update("trending", e.target.checked)}
          />
          Mark as trending
        </label>
      </div>

      {error && (
        <p className="text-sm text-deama-red border border-deama-red/40 bg-deama-red/10 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-deama-red hover:bg-deama-red-hover disabled:opacity-60 text-white text-sm uppercase tracking-wider font-bold px-4 py-2 rounded"
        >
          <Save size={14} />
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-2 text-deama-muted hover:text-deama-red text-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </form>
  );
}

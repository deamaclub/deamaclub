"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Save, Trash2, Image as ImageIcon, Loader } from "lucide-react";
import StreamUploader, {
  type StreamUploadResult,
} from "./StreamUploader";
import {
  resolveMetaDescription,
  resolveMetaTitle,
  resolveKeywords,
} from "@/lib/seo";

interface CategoryOpt {
  id: string;
  name: string;
}

export interface PostInitial {
  id?: string;
  title: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string;
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

  // Inline image upload for the description (blog-style images).
  const descRef = useRef<HTMLTextAreaElement | null>(null);
  const inlineImageInput = useRef<HTMLInputElement | null>(null);
  const [inlineUploading, setInlineUploading] = useState(false);

  async function uploadInlineImage(file: File) {
    setError(null);
    setInlineUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error || "Inline image upload failed.");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      // Insert markdown image at the cursor inside the description textarea.
      const ta = descRef.current;
      const md = `![](${url})`;
      if (!ta) {
        update("description", (form.description || "") + "\n\n" + md + "\n\n");
        return;
      }
      const start = ta.selectionStart ?? ta.value.length;
      const end = ta.selectionEnd ?? ta.value.length;
      const before = ta.value.slice(0, start);
      const after = ta.value.slice(end);
      // Pad with blank lines so the image lands on its own paragraph.
      const needsLeadingBreak =
        before.length > 0 && !/\n\n$/.test(before) ? "\n\n" : "";
      const needsTrailingBreak =
        after.length > 0 && !/^\n\n/.test(after) ? "\n\n" : "";
      const insertion = `${needsLeadingBreak}${md}${needsTrailingBreak}`;
      const newValue = before + insertion + after;
      update("description", newValue);
      // Restore cursor right after the inserted image
      setTimeout(() => {
        ta.focus();
        const pos = before.length + insertion.length;
        ta.setSelectionRange(pos, pos);
      }, 0);
    } finally {
      setInlineUploading(false);
    }
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
        <div className="flex items-baseline justify-between mb-1">
          <label className={labelCls}>Description</label>
          <span className="text-[10px] text-deama-muted">
            {form.description.length.toLocaleString()} / 20,000 chars
            {form.description.trim().length > 0 && (
              <>
                {" · "}
                {form.description.trim().split(/\s+/).length.toLocaleString()}{" "}
                words
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => inlineImageInput.current?.click()}
            disabled={inlineUploading}
            className="inline-flex items-center gap-1.5 bg-deama-surface hover:bg-deama-border border border-deama-border rounded px-2.5 py-1.5 text-xs disabled:opacity-60"
          >
            {inlineUploading ? (
              <>
                <Loader size={12} className="animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <ImageIcon size={12} /> Insert image at cursor
              </>
            )}
          </button>
          <input
            ref={inlineImageInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadInlineImage(f);
              e.target.value = "";
            }}
          />
          <span className="text-[10px] text-deama-muted">
            Inserts <code className="text-deama-muted">![](url)</code> at the
            cursor &mdash; renders as an inline image on the post.
          </span>
        </div>
        <textarea
          ref={descRef}
          rows={12}
          maxLength={20000}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputCls} resize-y min-h-[200px]`}
          placeholder="Long-form description. Enter twice = paragraph break (no ad). Enter three times = paragraph break with ad. Use the 'Insert image at cursor' button above to embed photos anywhere."
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

      {(() => {
        // Live SEO preview — mirrors exactly what the video page renders.
        const cat =
          categories.find((c) => c.id === form.categoryId)?.name || "";
        const autoTitle = resolveMetaTitle("", form.title).value;
        const effTitleFull = form.metaTitle.trim()
          ? form.metaTitle.trim()
          : `${autoTitle} | Deamaclub`;
        const autoDesc = resolveMetaDescription(
          "",
          form.description,
          form.title
        );
        const effDesc = form.metaDescription.trim() || autoDesc;
        const kws = resolveKeywords(form.focusKeywords, {
          title: form.title,
          category: cat,
        });
        const slugPreview =
          (form.slug || form.title || "your-post")
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-") || "your-post";

        const counter = (n: number, ideal: number, max: number) =>
          n > max
            ? "text-deama-red"
            : n >= ideal
            ? "text-green-400"
            : "text-deama-muted";

        return (
          <fieldset className="bg-deama-ink border border-deama-border rounded p-4 space-y-3">
            <legend className="px-2 text-xs uppercase tracking-wider text-deama-gold">
              SEO
            </legend>
            <p className="text-[11px] text-deama-muted -mt-1">
              Leave any field blank to auto-fill from the title &amp;
              description. Fill it in to override.
            </p>

            {/* Google result preview */}
            <div className="bg-white rounded p-3">
              <p className="text-[#1a0dab] text-[15px] leading-snug truncate">
                {effTitleFull}
              </p>
              <p className="text-[#006621] text-xs">
                deamaclub.com › video › {slugPreview}
              </p>
              <p className="text-[#545454] text-xs leading-snug line-clamp-2">
                {effDesc}
              </p>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <label className={labelCls}>SEO title</label>
                <span
                  className={`text-[10px] ${counter(
                    (form.metaTitle || autoTitle).length,
                    40,
                    60
                  )}`}
                >
                  {(form.metaTitle || autoTitle).length} chars
                  {form.metaTitle ? "" : " (auto)"}
                </span>
              </div>
              <input
                value={form.metaTitle}
                onChange={(e) => update("metaTitle", e.target.value)}
                placeholder={autoTitle}
                className={inputCls}
                maxLength={200}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <label className={labelCls}>Meta description</label>
                <span
                  className={`text-[10px] ${counter(
                    (form.metaDescription || autoDesc).length,
                    120,
                    160
                  )}`}
                >
                  {(form.metaDescription || autoDesc).length} chars
                  {form.metaDescription ? "" : " (auto)"}
                </span>
              </div>
              <textarea
                rows={2}
                value={form.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                placeholder={autoDesc}
                className={`${inputCls} resize-y`}
                maxLength={320}
              />
            </div>

            <div>
              <label className={labelCls}>
                Focus keywords (comma-separated)
              </label>
              <input
                value={form.focusKeywords}
                onChange={(e) => update("focusKeywords", e.target.value)}
                placeholder={kws.join(", ")}
                className={inputCls}
                maxLength={300}
              />
              {!form.focusKeywords && (
                <p className="text-[10px] text-deama-muted mt-1">
                  Auto: {kws.join(", ")}
                </p>
              )}
            </div>
          </fieldset>
        );
      })()}

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

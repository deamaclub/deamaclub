import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

// Google Video Sitemap. This is the single biggest SEO lever for a video
// site — it feeds videos into Google Video search and the video carousel
// that appears on normal results pages. Regenerate every 5 min.
export const revalidate = 300;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDuration(sec: number | null | undefined): string | null {
  if (!sec || sec <= 0) return null;
  // Google video sitemap wants plain seconds (30–28800), not ISO 8601.
  return String(Math.min(28800, Math.max(1, Math.round(sec))));
}

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true, thumbnailUrl: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 5000,
    select: {
      slug: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      embedUrl: true,
      videoUrl: true,
      durationSec: true,
      publishedAt: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });

  const items = posts
    .map((p) => {
      const pageUrl = absoluteUrl(`/video/${p.slug}`);
      const thumb = p.thumbnailUrl!;
      // Google requires a description; strip markdown image tokens + trim.
      const rawDesc =
        (p.description || p.title)
          .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
          .replace(/\s+/g, " ")
          .trim() || p.title;
      const desc = rawDesc.slice(0, 2000);
      const pubDate = (p.publishedAt || p.createdAt).toISOString();
      const duration = isoDuration(p.durationSec);

      // player_loc for iframe embeds, content_loc for direct files.
      const playerLoc = p.embedUrl
        ? `    <video:player_loc>${xmlEscape(p.embedUrl)}</video:player_loc>`
        : "";
      const contentLoc =
        !p.embedUrl && p.videoUrl
          ? `    <video:content_loc>${xmlEscape(p.videoUrl)}</video:content_loc>`
          : "";
      if (!playerLoc && !contentLoc) return ""; // need at least one

      return `  <url>
    <loc>${xmlEscape(pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${xmlEscape(thumb)}</video:thumbnail_loc>
      <video:title>${xmlEscape(p.title)}</video:title>
      <video:description>${xmlEscape(desc)}</video:description>
${playerLoc}${contentLoc}
${duration ? `      <video:duration>${duration}</video:duration>\n` : ""}      <video:publication_date>${pubDate}</video:publication_date>
      <video:family_friendly>no</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${items}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}

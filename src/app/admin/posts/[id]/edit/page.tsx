import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright mb-6">
        EDIT POST
      </h1>
      <PostForm
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.description || "",
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          focusKeywords: post.focusKeywords || "",
          embedUrl: post.embedUrl || "",
          videoUrl: post.videoUrl || "",
          thumbnailUrl: post.thumbnailUrl || "",
          durationSec: post.durationSec ?? "",
          categoryId: post.categoryId,
          published: post.published,
          trending: post.trending,
        }}
      />
    </div>
  );
}

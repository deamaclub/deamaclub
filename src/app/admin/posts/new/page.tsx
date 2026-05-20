import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright mb-6">
        NEW POST
      </h1>
      <PostForm
        categories={categories}
        initial={{
          title: "",
          slug: "",
          description: "",
          embedUrl: "",
          videoUrl: "",
          thumbnailUrl: "",
          durationSec: "",
          categoryId: "",
          published: false,
          trending: false,
        }}
      />
    </div>
  );
}

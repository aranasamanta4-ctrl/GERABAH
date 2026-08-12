import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { toggleLike, toggleSave } from "@/lib/actions/community-posts";
import { MediaPreview } from "@/components/media-preview";

const POST_TYPES = ["Karya", "Produk", "Di Balik Layar", "Inspirasi", "Cerita"];

export default async function CommunityFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const session = await getSession();

  const posts = await prisma.post.findMany({
    where: type ? { type } : undefined,
    include: {
      author: true,
      product: true,
      business: true,
      likes: true,
      comments: true,
      saves: true,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Komunitas</h1>
        <Link
          href="/community/new"
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
        >
          + Post
        </Link>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/community"
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
            !type ? "bg-terracotta text-white" : "border border-border text-charcoal/60"
          }`}
        >
          Semua
        </Link>
        {POST_TYPES.map((t) => (
          <Link
            key={t}
            href={`/community?type=${encodeURIComponent(t)}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              type === t ? "bg-terracotta text-white" : "border border-border text-charcoal/60"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-charcoal/60">Belum ada post di kategori ini.</p>
          <Link
            href="/community/new"
            className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            + Post Pertamamu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => {
            const liked = session ? post.likes.some((l) => l.userId === session.userId) : false;
            const saved = session ? post.saves.some((s) => s.userId === session.userId) : false;
            const like = toggleLike.bind(null, post.id);
            const save = toggleSave.bind(null, post.id);

            return (
              <div key={post.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <Link href={`/community/${post.id}`}>
                  <MediaPreview src={post.imageUrl} alt={post.title} className="aspect-[4/3] w-full" emojiClassName="text-5xl" />
                </Link>
                <div className="p-4">
                  <p className="text-xs font-medium text-terracotta">
                    @{post.business?.name ?? post.author.name}
                  </p>
                  <Link href={`/community/${post.id}`}>
                    <h3 className="mt-1 font-serif text-lg font-semibold text-charcoal">{post.title}</h3>
                  </Link>
                  {post.description && (
                    <p className="mt-1 text-sm text-charcoal/60">{post.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <form action={like}>
                      <button type="submit" className={liked ? "text-terracotta" : "text-charcoal/60"}>
                        ❤️ {post.likes.length}
                      </button>
                    </form>
                    <Link href={`/community/${post.id}`} className="text-charcoal/60">
                      💬 {post.comments.length}
                    </Link>
                    <form action={save}>
                      <button type="submit" className={saved ? "text-terracotta" : "text-charcoal/60"}>
                        🔖
                      </button>
                    </form>
                  </div>
                  {post.product && (
                    <Link
                      href={`/community/${post.id}`}
                      className="mt-3 inline-block rounded-full border border-border px-4 py-1.5 text-xs font-medium text-charcoal hover:bg-beige/50"
                    >
                      Lihat Produk
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

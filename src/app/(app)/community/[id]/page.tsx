import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { toggleLike, toggleSave, addComment } from "@/lib/actions/community-posts";
import { MediaPreview } from "@/components/media-preview";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      business: true,
      product: true,
      likes: true,
      saves: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!post) notFound();

  const liked = session ? post.likes.some((l) => l.userId === session.userId) : false;
  const saved = session ? post.saves.some((s) => s.userId === session.userId) : false;
  const like = toggleLike.bind(null, post.id);
  const save = toggleSave.bind(null, post.id);

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <MediaPreview src={post.imageUrl} alt={post.title} className="aspect-[4/3] w-full" emojiClassName="text-6xl" />
        <div className="p-5">
          <p className="text-xs font-medium text-terracotta">
            @{post.business?.name ?? post.author.name}
          </p>
          <h1 className="mt-1 font-serif text-xl font-semibold text-charcoal">{post.title}</h1>
          {post.description && <p className="mt-2 text-sm text-charcoal/70">{post.description}</p>}

          <div className="mt-4 flex items-center gap-4 text-sm">
            <form action={like}>
              <button type="submit" className={liked ? "text-terracotta" : "text-charcoal/60"}>
                ❤️ {post.likes.length}
              </button>
            </form>
            <span className="text-charcoal/60">💬 {post.comments.length}</span>
            <form action={save}>
              <button type="submit" className={saved ? "text-terracotta" : "text-charcoal/60"}>
                🔖 {saved ? "Tersimpan" : "Simpan"}
              </button>
            </form>
          </div>

          {post.product && (
            <div className="mt-4 rounded-xl bg-beige/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal">{post.product.name}</p>
                  <p className="text-sm text-terracotta">{formatIDR(post.product.sellingPrice)}</p>
                  <p className="text-xs text-charcoal/50">
                    {post.product.stock > 0 ? `${post.product.stock} tersedia` : "Stok habis"}
                  </p>
                </div>
                <Link
                  href={`/product/${post.product.id}?post=${post.id}`}
                  className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
                >
                  Lihat Produk
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-charcoal">Komentar</h2>
        {session && (
          <form action={addComment} className="mb-4 flex gap-2">
            <input type="hidden" name="postId" value={post.id} />
            <input
              name="body"
              placeholder="Tulis komentar..."
              required
              className="flex-1 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-terracotta"
            />
            <button
              type="submit"
              className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
            >
              Kirim
            </button>
          </form>
        )}
        {post.comments.length === 0 ? (
          <p className="text-sm text-charcoal/50">Belum ada komentar.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {post.comments.map((c) => (
              <div key={c.id} className="rounded-xl bg-beige/30 p-3 text-sm">
                <span className="font-medium text-charcoal">{c.user.name}</span>{" "}
                <span className="text-charcoal/70">{c.body}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { getSocialPosts } from "@/lib/queries";
import { deleteSocialPost, toggleSocialPostActive } from "./actions";
import { SocialPostFormDialog } from "@/components/admin/social-post-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ActiveToggle } from "@/components/admin/active-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Music2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kelola Media Sosial" };

export default async function AdminMediaSosialPage() {
  const posts = await getSocialPosts();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">
            Kelola Media Sosial
          </h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} post terdaftar untuk halaman Media Sosial publik.
          </p>
        </div>
        <SocialPostFormDialog />
      </div>

      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Post</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Akun</TableHead>
              <TableHead>Tampil</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada post terdaftar. Cek URL dulu lewat &quot;Cek URL&quot;, lalu tambahkan
                  di sini.
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post.id} className="hover:bg-accent/40">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="line-clamp-1 max-w-[280px] font-medium text-ink">
                      {post.caption ?? "(tanpa caption)"}
                    </span>
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-brass max-w-[220px]"
                    >
                      {post.postUrl}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] leading-none",
                      post.platform === "tiktok" ? "bg-brass/15 text-brass-strong" : "bg-teal/12 text-teal-strong"
                    )}
                  >
                    {post.platform === "tiktok" ? <Music2 className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                    {post.platform === "tiktok" ? "TikTok" : "X"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{post.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{post.authorName ?? "-"}</TableCell>
                <TableCell>
                  <ActiveToggle active={post.active} onToggle={toggleSocialPostActive.bind(null, post.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <SocialPostFormDialog post={post} />
                    <ConfirmDeleteButton
                      onDelete={deleteSocialPost.bind(null, post.id)}
                      itemName={post.caption ?? post.postUrl}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

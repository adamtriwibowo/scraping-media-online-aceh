"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2.5 border-l-2 border-transparent px-5 py-2.5 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
    >
      <LogOut className="h-4 w-4" />
      Keluar
    </button>
  );
}

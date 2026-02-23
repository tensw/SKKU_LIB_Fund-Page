"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Upload, ExternalLink, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/upload", label: "엑셀 업로드", icon: Upload },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Login page renders without the admin sidebar shell
  if (pathname === "/admin/login") {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8F6F2]">
        {children}
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // proceed even if the API call fails
    }
    router.push("/admin/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#F8F6F2]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-[#1B3A5C] text-white">
        {/* Logo / Title */}
        <div className="flex h-16 items-center gap-2 px-6 text-lg font-bold tracking-tight">
          <span className="text-[#C8102E]">SKKU</span>
          <span>Donors Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-4 border-t border-white/20" />

          {/* External link to public site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            사용자 페이지
          </a>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/20 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

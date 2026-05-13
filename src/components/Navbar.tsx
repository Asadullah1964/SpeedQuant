"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, LayoutDashboard, Home, User, Menu, X } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-md">
            SQ
          </div>

          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl" style={{color:"Black"}}>
              SpeedQuant
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              AI-powered aptitude practice
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  active
                    ? "bg-slate-900 font-bold text-white"
                    : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
          ) : !session ? (
            <button
              onClick={() => signIn("google")}
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Login with Google
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Link href="/profile" className="shrink-0">
                <img
                  src={session.user?.image || "/default-avatar.png"}
                  alt={session.user?.name || "Profile"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </Link>

              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-800">
                  {session.user?.name}
                </p>
                <p className="max-w-[180px] truncate text-xs text-slate-500">
                  {session.user?.email}
                </p>
              </div>

              <button
                onClick={() => signOut()}
                className="inline-flex items-center justify-center rounded-xl bg-red-500 p-2.5 text-white transition hover:bg-red-600"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-3 px-4 py-4 sm:px-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-slate-900 font-bold text-white"
                    : "font-medium text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {session && (
            <Link
              href="/profile"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                pathname === "/profile"
                  ? "bg-slate-900 font-bold text-white"
                  : "font-medium text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          )}

          <Link
            href="/#categories"
            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Categories
          </Link>

          <div className="border-t border-slate-200 pt-4">
            {status === "loading" ? (
              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
            ) : !session ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signIn("google");
                }}
                className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Login with Google
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={session.user?.image || "/default-avatar.png"}
                    alt={session.user?.name || "Profile"}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {session.user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
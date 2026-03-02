import { LogoutButton } from "@/components/ui/logout-button";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export function TopNav() {
  const session = getSession();

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100/60 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-[min(1120px,calc(100%-24px))] items-center justify-between gap-4 py-3">
        <Link href="/" className="text-base font-bold text-brand-700">
          HeoVC
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm">
          {!session && (
            <Link href="/login" className="rounded-full bg-brand-600 px-4 py-2 font-semibold text-white">
              Dang nhap
            </Link>
          )}

          {session?.role === "MEMBER" && (
            <>
              <Link href="/vote" className="rounded-full bg-brand-50 px-3 py-2 font-medium text-brand-700">
                Binh chon
              </Link>
              <Link href="/summary" className="rounded-full bg-brand-50 px-3 py-2 font-medium text-brand-700">
                Tong hop
              </Link>
            </>
          )}

          {session?.role === "ADMIN" && (
            <>
              <Link href="/admin/users" className="rounded-full bg-brand-50 px-3 py-2 font-medium text-brand-700">
                Users
              </Link>
              <Link href="/admin/matches" className="rounded-full bg-brand-50 px-3 py-2 font-medium text-brand-700">
                Matches
              </Link>
              <Link href="/admin/payments" className="rounded-full bg-brand-50 px-3 py-2 font-medium text-brand-700">
                Payments
              </Link>
            </>
          )}

          {session && <LogoutButton fullName={session.fullName} />}
        </nav>
      </div>
    </header>
  );
}

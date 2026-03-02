import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  const session = getSession();
  if (session?.role === "ADMIN") {
    redirect("/admin/users");
  }
  if (session?.role === "MEMBER") {
    redirect("/vote");
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-md rounded-3xl border border-blue-100 bg-white/95 p-6 shadow-2xl shadow-blue-100/50">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dang nhap he thong</h1>
      <p className="mt-2 text-sm text-slate-600">Nhap User ID va PIN do Admin cap.</p>
      <LoginForm />
    </section>
  );
}

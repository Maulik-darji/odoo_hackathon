"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showCode, setShowCode] = useState(false);

  const ADMIN_EMAIL = "maulik.darji2005@gmail.com";
  const ADMIN_CODE = "14224";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email === ADMIN_EMAIL && code === ADMIN_CODE) {
      sessionStorage.setItem("access_token", "admin-hardcoded-token");
      document.cookie = "access_token=admin-hardcoded-token; path=/; max-age=28800; SameSite=Lax";
      sessionStorage.setItem("user", JSON.stringify({
        id: 0,
        email: ADMIN_EMAIL,
        name: "Admin",
        role: "Fleet Manager",
        is_admin: true,
        is_approved: true,
      }));
      sessionStorage.setItem("userRole", "Fleet Manager");
      router.push("/admin/manage-access");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="landing-page min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/40 bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center pt-8 pb-6 px-8">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl tracking-tight font-normal mb-2">
              <span className="serif-italic">Admin</span> access
            </h1>
            <p className="text-slate-500 text-base">
              Restricted area. Authorized personnel only.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="space-y-5 px-8">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-200/60 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block">
                  Access Code
                </label>
                <div className="relative">
                  <input
                    type={showCode ? "text" : "password"}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="•••••"
                    required
                    className="w-full h-12 px-4 pr-10 rounded-lg border border-slate-200/60 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-6 pb-8 px-8 pt-6">
              <button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full transition-transform active:scale-[0.98]"
              >
                Enter
              </button>

              <div className="text-sm text-center text-slate-500">
                Not an admin?{" "}
                <Link href="/login" className="text-slate-900 font-medium hover:underline">
                  Sign in normally
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-page min-h-screen flex items-center justify-center selection:bg-blue-100 relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 z-50">
        <div className="logo-icon bg-slate-900 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <span className="font-semibold text-lg tracking-tight text-slate-900">TransitOps</span>
      </Link>
      
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}

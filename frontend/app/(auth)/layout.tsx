export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 selection:bg-slate-200">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold text-sm">T</span>
        </div>
        <span className="font-semibold text-lg tracking-tight text-slate-900">TransitOps</span>
      </div>
      {children}
    </div>
  );
}

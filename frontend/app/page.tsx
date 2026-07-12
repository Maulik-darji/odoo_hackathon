import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">T</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">TransitOps</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
          <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link href="#testimonials" className="hover:text-slate-900 transition-colors">Testimonials</Link>
          <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-slate-600 transition-colors">
            Sign in
          </Link>
          <Link href="/register">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-32">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          TransitOps 1.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter max-w-4xl mb-8">
          The operating system for modern transport fleets.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12">
          Manage vehicles, drivers, trips, and maintenance in one unified platform. 
          Built for speed, reliability, and scale.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8 h-12 text-base">
              Start free trial
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-slate-200">
            Book a demo
          </Button>
        </div>

        {/* Dashboard Preview Placeholder */}
        <div className="mt-24 w-full max-w-5xl rounded-xl border border-slate-200 bg-slate-50/50 p-2 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
          <div className="rounded-lg bg-white p-8 aspect-[16/9] flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin"></div>
              <p className="font-medium">Loading Dashboard Data...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

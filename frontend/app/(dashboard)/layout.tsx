"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { OnboardingTour } from "@/components/onboarding-tour";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Persist sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar_open");
    if (savedState !== null) {
      setIsSidebarOpen(savedState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("sidebar_open", String(newState));
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, tourClass: "tour-dashboard" },
    { name: "Vehicles", href: "/vehicles", icon: Truck, tourClass: "tour-vehicles" },
    { name: "Drivers", href: "/drivers", icon: Users, tourClass: "tour-drivers" },
    { name: "Trips", href: "/trips", icon: Route, tourClass: "tour-trips" },
    { name: "Maintenance", href: "/maintenance", icon: Wrench, tourClass: "tour-maintenance" },
    { name: "Fuel & Expenses", href: "/expenses", icon: Fuel, tourClass: "tour-expenses" },
    { name: "Analytics", href: "/analytics", icon: BarChart3, tourClass: "tour-analytics" },
    { name: "Manage access", href: "/manage-access", icon: ShieldCheck, tourClass: "tour-manage-access" },
    { name: "Settings", href: "/settings", icon: Settings, tourClass: "tour-settings" },
  ];

  // RBAC routing definition
  const roleRoutes: Record<string, string[]> = {
    "Fleet Manager": ["Vehicles", "Maintenance", "Settings"],
    "Dispatcher": ["Dashboard", "Trips", "Settings"],
    "Safety Officer": ["Drivers", "Settings"],
    "Financial Analyst": ["Fuel & Expenses", "Analytics", "Settings"]
  };

  const userRole = user?.role || "Fleet Manager";
  const isAdmin = user?.is_admin || false;
  const isApproved = user?.is_approved || false;

  // Filter navigation items
  const filteredNavigation = isAdmin 
    ? navigation // Admin sees everything
    : navigation.filter(item => {
        // Non-admins only see their role-based items (excluding Manage Access)
        if (item.name === "Manage access") return false;
        return roleRoutes[userRole]?.includes(item.name);
      });

  // Redirect to first allowed page if the current page is not allowed
  useEffect(() => {
    if (!user) return;
    
    // If not approved and not admin, stay on dashboard/current page but locked
    if (!isApproved && !isAdmin) return;

    const isCurrentRouteAllowed = filteredNavigation.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    );

    if (!isCurrentRouteAllowed && filteredNavigation.length > 0) {
      router.push(filteredNavigation[0].href);
    }
  }, [pathname, userRole, router, user, isApproved, isAdmin]);

  const handleBypass = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://localhost:8000/api/v1/users/${user?.id}/approve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
    } catch (e) {
      console.error(e);
    }
    // Update local storage and reload regardless of backend status to guarantee bypass works
    if (user) {
      const updatedUser = { ...user, is_approved: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();
    }
  };

  // Locked/Pending state screen
  if (user && !isApproved && !isAdmin) {
    return (
      <div className="landing-page min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/40 bg-white/70 backdrop-blur-xl rounded-2xl p-8 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-500 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-normal tracking-tight">
              <span className="serif-italic">Approval</span> pending
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your account has been registered under the role <strong>{user.role}</strong> ({user.email}). 
              A request has been sent to the system administrator.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-left text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">What happens next?</p>
            <p>1. The Administrator will review your role request.</p>
            <p>2. Once approved, you will receive a confirmation email.</p>
            <p>3. Refresh this page to access your scoped operational dashboard.</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-transform active:scale-[0.98]"
            >
              Check Status / Refresh
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={logout}
                className="w-full h-11 border-slate-200/60 rounded-full hover:bg-slate-50 text-slate-600"
              >
                Log Out
              </Button>
              <Button 
                variant="secondary"
                onClick={handleBypass}
                className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-full"
              >
                Skip (Bypass)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page flex h-screen overflow-hidden font-sans selection:bg-slate-200">
      <OnboardingTour />
      
      {/* Sidebar - glassmorphism style */}
      <aside className={`border-r border-white/40 bg-white/60 backdrop-blur-xl flex flex-col justify-between shrink-0 transition-all duration-300 relative z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col">
          {/* Logo / Hamburger */}
          <div className="h-16 px-6 border-b border-black/5 flex items-center justify-between gap-2 overflow-hidden">
            {isSidebarOpen ? (
              <>
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-xs">T</span>
                  </div>
                  <span className="font-semibold text-base tracking-tight text-slate-900 transition-opacity whitespace-nowrap">TransitOps</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0 -mr-2">
                  <Menu className="h-4 w-4 text-slate-500" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mx-auto">
                <Menu className="h-5 w-5 text-slate-500" />
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${item.tourClass} ${
                    isActive
                      ? "bg-white shadow-sm border border-white/60 text-slate-900"
                      : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon className={`shrink-0 ${isActive ? "text-slate-900" : "text-slate-400"} ${isSidebarOpen ? "mr-3 h-5 w-5" : "mx-auto h-5 w-5"}`} />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* User Menu */}
        <div className="px-4 py-3 border-t border-black/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-xs">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-900 truncate leading-tight">
                {user?.name || "User Name"}
              </span>
              <span className="text-xs text-slate-500 truncate text-left">
                {isAdmin ? "Administrator" : user?.role || "Fleet Manager"}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className={`text-slate-500 hover:text-slate-900 rounded-lg shrink-0 ${!isSidebarOpen ? "hidden" : ""}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header - Glassmorphism style */}
        <header className="h-16 px-8 border-b border-white/40 bg-white/40 backdrop-blur-md flex items-center justify-between shrink-0">
          <h1 className="text-xl font-medium tracking-tight text-slate-900">
            {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                Admin Console
              </span>
            )}
            <span className="text-xs font-semibold bg-white/80 text-emerald-700 border border-emerald-200/60 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Connection
            </span>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

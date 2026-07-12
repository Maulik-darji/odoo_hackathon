"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Bell,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
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
    { name: "Settings", href: "/settings", icon: Settings, tourClass: "tour-settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-slate-200">
      <OnboardingTour />
      
      {/* Sidebar */}
      <aside className={`border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col">
          {/* Logo */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-xs">T</span>
              </div>
              {isSidebarOpen && <span className="font-semibold text-base tracking-tight text-slate-900 transition-opacity whitespace-nowrap">TransitOps</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0 -mr-2">
              <Menu className="h-4 w-4 text-slate-500" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${item.tourClass} ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || "User Name"}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {user?.role || "Fleet Manager"}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className={`text-slate-400 hover:text-slate-900 rounded-lg ${!isSidebarOpen ? "w-full justify-center" : ""}`}
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Connection
            </span>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

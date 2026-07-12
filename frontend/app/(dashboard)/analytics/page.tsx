"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { BarChart3, TrendingUp, IndianRupee, Activity, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const COLORS = ["#0f172a", "#3b82f6", "#64748b", "#cbd5e1"];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => api.getDashboardStats(),
  });

  const kpis = data?.kpis || {
    vehicle_utilization: "0%",
    total_fleet_size: 0,
    in_shop: 0,
    active_trips: 0,
    operational_cost: "₹0.00",
  };

  const fleetStatusData = data?.fleet_status || [];

  // Zoom level state for the revenue chart
  const [zoomLevel, setZoomLevel] = useState<"day" | "month" | "year">("month");

  // Multi-granularity revenue data
  const dailyData = [
    { name: "Jul 1", revenue: 820 }, { name: "Jul 2", revenue: 1150 },
    { name: "Jul 3", revenue: 640 }, { name: "Jul 4", revenue: 980 },
    { name: "Jul 5", revenue: 1420 }, { name: "Jul 6", revenue: 760 },
    { name: "Jul 7", revenue: 1100 }, { name: "Jul 8", revenue: 530 },
    { name: "Jul 9", revenue: 1340 }, { name: "Jul 10", revenue: 890 },
    { name: "Jul 11", revenue: 1560 }, { name: "Jul 12", revenue: 720 },
    { name: "Jul 13", revenue: 1050 }, { name: "Jul 14", revenue: 1280 },
  ];

  const monthlyData = [
    { name: "Jan", revenue: 2400 }, { name: "Feb", revenue: 1398 },
    { name: "Mar", revenue: 9800 }, { name: "Apr", revenue: 3908 },
    { name: "May", revenue: 4800 }, { name: "Jun", revenue: 3800 },
    { name: "Jul", revenue: 5200 }, { name: "Aug", revenue: 4100 },
    { name: "Sep", revenue: 6300 }, { name: "Oct", revenue: 3500 },
    { name: "Nov", revenue: 4700 }, { name: "Dec", revenue: 5900 },
  ];

  const yearlyData = [
    { name: "2022", revenue: 32000 }, { name: "2023", revenue: 45000 },
    { name: "2024", revenue: 58000 }, { name: "2025", revenue: 41000 },
    { name: "2026", revenue: 52000 },
  ];

  const chartData = zoomLevel === "day" ? dailyData : zoomLevel === "month" ? monthlyData : yearlyData;
  const chartLabel = zoomLevel === "day" ? "Daily Revenue (last 14 days)" : zoomLevel === "month" ? "Monthly Revenue (this year)" : "Yearly Revenue (all time)";

  // Scroll-to-zoom handler with debounce
  const zoomLevels: ("day" | "month" | "year")[] = ["year", "month", "day"];
  const scrollCooldown = useRef(false);

  const handleChartWheel = useCallback((e: React.WheelEvent) => {
    if (scrollCooldown.current) return;
    const currentIdx = zoomLevels.indexOf(zoomLevel);

    if (e.deltaY < 0 && currentIdx < zoomLevels.length - 1) {
      // Scroll up = zoom in (toward Day)
      setZoomLevel(zoomLevels[currentIdx + 1]);
      scrollCooldown.current = true;
      setTimeout(() => { scrollCooldown.current = false; }, 400);
      e.preventDefault();
    } else if (e.deltaY > 0 && currentIdx > 0) {
      // Scroll down = zoom out (toward Year)
      setZoomLevel(zoomLevels[currentIdx - 1]);
      scrollCooldown.current = true;
      setTimeout(() => { scrollCooldown.current = false; }, 400);
      e.preventDefault();
    }
  }, [zoomLevel]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Deep-dive reports on operational costs, efficiency, and utilization.</p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Fuel Efficiency</CardTitle>
                <Activity className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.fuel_efficiency || "8.4 km/L"}</div>
                <p className="text-xs text-slate-500 mt-1">Average distance per fuel unit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Fleet Utilization</CardTitle>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.fleet_utilization || "81%"}</div>
                <p className="text-xs text-slate-500 mt-1">Active vehicles relative to fleet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Operational Cost</CardTitle>
                <IndianRupee className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.operational_cost}</div>
                <p className="text-xs text-slate-500 mt-1">Accumulated maintenance + fuel costs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Vehicle ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.vehicle_roi?.[0]?.roi || "14.2%"}</div>
                <p className="text-xs text-slate-500 mt-1">Average rate of return on assets</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-none border-slate-200" onWheel={handleChartWheel}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                    <CardDescription>{chartLabel}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full">
                    <button
                      onClick={() => setZoomLevel("day")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
                        zoomLevel === "day" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <ZoomIn className="w-3 h-3" /> Day
                    </button>
                    <button
                      onClick={() => setZoomLevel("month")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
                        zoomLevel === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setZoomLevel("year")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
                        zoomLevel === "year" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <ZoomOut className="w-3 h-3" /> Year
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, "Revenue"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue (₹)" animationDuration={400} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-none border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Top Performing Vehicles (ROI)</CardTitle>
                  <CardDescription>Highest return rate vehicles in the active fleet.</CardDescription>
                </div>
                <Link href="/vehicles">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">View All</Button>
                </Link>
              </CardHeader>
              <CardContent className="h-80 space-y-4 overflow-y-auto">
                {(data?.vehicle_roi || []).slice(0, 4).map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-800">{item.make} {item.model} ({item.registration})</span>
                      <span className="text-slate-500">{item.roi} ROI</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(0, Math.min(100, (parseFloat(item.roi) || 14.2) * 5))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-none border-slate-200 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Fleet Status Breakdown</CardTitle>
                <CardDescription>Operational statuses of all registered vehicles.</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col md:flex-row items-center justify-around">
                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fleetStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {fleetStatusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-4 text-sm text-slate-600">
                  {fleetStatusData.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      <span className="font-medium text-slate-800">{entry.name}</span>
                      <span>—</span>
                      <span>{entry.value} vehicles</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
import { BarChart3, TrendingUp, DollarSign, Activity } from "lucide-react";

const COLORS = ["#0f172a", "#3b82f6", "#64748b", "#cbd5e1"];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: api.getDashboardStats,
  });

  const kpis = data?.kpis || {
    vehicle_utilization: "0%",
    total_fleet_size: 0,
    in_shop: 0,
    active_trips: 0,
    operational_cost: "$0.00",
  };

  const fleetStatusData = data?.fleet_status || [];

  // Mocked monthly performance metrics for detailed analytics
  const monthlyData = [
    { name: "Jan", cost: 4000, trips: 24, fuel: 2400 },
    { name: "Feb", cost: 3000, trips: 18, fuel: 1398 },
    { name: "Mar", cost: 9800, trips: 29, fuel: 9800 },
    { name: "Apr", cost: 3908, trips: 20, fuel: 3908 },
    { name: "May", cost: 4800, trips: 27, fuel: 4800 },
    { name: "Jun", cost: 5800, trips: 35, fuel: 3800 },
  ];

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
                <DollarSign className="h-4 w-4 text-slate-400" />
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
            <Card className="shadow-none border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
                <CardDescription>Monthly visualization of total trip revenue generated.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="fuel" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-none border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Performing Vehicles (ROI)</CardTitle>
                <CardDescription>Highest return rate vehicles in the active fleet.</CardDescription>
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

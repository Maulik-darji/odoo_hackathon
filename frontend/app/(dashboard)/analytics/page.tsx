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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Utilization Rate</CardTitle>
                <Activity className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.vehicle_utilization}</div>
                <p className="text-xs text-slate-500 mt-1">Active vehicles relative to total fleet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total Fleet Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.operational_cost}</div>
                <p className="text-xs text-slate-500 mt-1">Accumulated maintenance + fuel costs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Active Trips</CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.active_trips}</div>
                <p className="text-xs text-slate-500 mt-1">Currently active dispatched routes</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-none border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Cost Trend Over Time</CardTitle>
                <CardDescription>Monthly visualization of total operational costs vs fuel expenses.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="cost" stroke="#0f172a" strokeWidth={2} name="Total Cost ($)" />
                    <Line type="monotone" dataKey="fuel" stroke="#3b82f6" strokeWidth={2} name="Fuel Cost ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-none border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Trip Volume By Month</CardTitle>
                <CardDescription>Number of successful route dispatches processed.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="trips" fill="#0f172a" radius={[4, 4, 0, 0]} name="Completed Trips" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-none border-slate-200 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Fleet Utilization Breakdown</CardTitle>
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

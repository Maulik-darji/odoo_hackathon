"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck,
  Users,
  Route,
  Activity,
  DollarSign,
} from "lucide-react";
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
} from "recharts";

const COLORS = ["#0f172a", "#64748b", "#cbd5e1"];

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: api.getDashboardStats,
    refetchInterval: 5000, // Auto-refetch every 5 seconds for live dashboard updates
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Loading fleet metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        <h3 className="font-semibold mb-1">Failed to load dashboard metrics</h3>
        <p className="text-sm">Please verify the backend server is running and try again.</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    vehicle_utilization: "0%",
    total_fleet_size: 0,
    in_shop: 0,
    active_trips: 0,
    operational_cost: "$0.00",
  };

  const chartData = data?.fleet_status || [
    { name: "Active", value: 0 },
    { name: "In Shop", value: 0 },
    { name: "Retired", value: 0 },
  ];

  // If no vehicles are registered yet, show an empty state hint
  const isFleetEmpty = kpis.total_fleet_size === 0;

  const mockWeeklyCosts = [
    { name: "Mon", cost: 1200 },
    { name: "Tue", cost: 900 },
    { name: "Wed", cost: 1500 },
    { name: "Thu", cost: 2100 },
    { name: "Fri", cost: 1800 },
    { name: "Sat", cost: 600 },
    { name: "Sun", cost: 400 },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="shadow-none border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Vehicle Utilization</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.vehicle_utilization}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Fleet</CardTitle>
            <Truck className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.total_fleet_size}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">In Shop</CardTitle>
            <Truck className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.in_shop}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Trips</CardTitle>
            <Route className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.active_trips}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Operational Cost</CardTitle>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.operational_cost}</div>
          </CardContent>
        </Card>
      </div>

      {isFleetEmpty && (
        <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-white">
          <h3 className="font-semibold text-slate-800 text-base mb-1">Your fleet is empty</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
            Get started by registering your first transport vehicle to track metrics and operations.
          </p>
          <a
            href="/vehicles"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Vehicle
          </a>
        </div>
      )}

      {/* Visual Analytics Grid */}
      {!isFleetEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fleet Status Pie Chart */}
          <Card className="shadow-none border-slate-200 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="flex justify-center gap-6 pb-6 text-xs text-slate-500 font-medium">
              {chartData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span>
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Operational Expenses Bar Chart */}
          <Card className="shadow-none border-slate-200 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Weekly Operational Cost</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockWeeklyCosts}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="cost" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Truck,
  Users,
  Route,
  Activity,
  IndianRupee,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const [vehicleType, setVehicleType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardStats", vehicleType, statusFilter, regionFilter],
    queryFn: () => api.getDashboardStats({
      vehicle_type: vehicleType === "All" ? undefined : vehicleType,
      status_filter: statusFilter === "All" ? undefined : statusFilter,
      region: regionFilter === "All" ? undefined : regionFilter,
    }),
    refetchInterval: 5000, // Auto-refetch every 5 seconds for live updates
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
    fleet_utilization: "0%",
    total_fleet_size: 0,
    available_vehicles: 0,
    on_trip_vehicles: 0,
    in_shop: 0,
    total_drivers: 0,
    available_drivers: 0,
    drivers_on_duty: 0,
    active_trips: 0,
    pending_trips: 0,
    total_trips: 0,
    completed_trips: 0,
    operational_cost: "₹0.00",
    fuel_cost: "₹0.00",
    fuel_efficiency: "0 km/L",
  };

  const fleetStatusData = data?.fleet_status || [
    { name: "Available", value: 0 },
    { name: "On Trip", value: 0 },
    { name: "In Shop", value: 0 },
    { name: "Retired", value: 0 },
  ];

  const recentActivity = data?.recent_activity || [];

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200/50";
      case "Dispatched":
        return "bg-sky-100 text-sky-850 border-sky-200/50";
      case "On Trip":
        return "bg-blue-100 text-blue-800 border-blue-200/50";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200/50";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200/50";
    }
  };

  const getEtaLabel = (status: string, dist: number) => {
    if (status === "Completed") return "—";
    if (status === "Cancelled") return "Cancelled";
    if (status === "Draft") return "Awaiting dispatch";
    if (status === "Dispatched") {
      const mins = Math.max(15, Math.round(dist * 1.2));
      return mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;
    }
    return "Awaiting vehicle";
  };

  // Safe percentage helper
  const getPct = (val: number) => {
    const total = fleetStatusData.reduce((acc: number, cur: any) => acc + (cur.value || 0), 0);
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white/60 backdrop-blur-xl p-4 border border-white/60 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Vehicle Type</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="h-9 px-2 rounded-lg border border-slate-200 bg-white/80 focus:outline-none text-xs"
          >
            <option value="All">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Trailer">Trailer</option>
            <option value="Mini">Mini</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2 rounded-lg border border-slate-200 bg-white/80 focus:outline-none text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Region</label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-9 px-2 rounded-lg border border-slate-200 bg-white/80 focus:outline-none text-xs"
          >
            <option value="All">All Regions</option>
            <option value="National">National</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row - exactly 7 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="shadow-none border-blue-200/50 bg-blue-50/50">
          <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Vehicles</span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.on_trip_vehicles}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-emerald-200/50 bg-emerald-50/50">
          <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Available Vehicles</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.available_vehicles}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-amber-200/50 bg-amber-50/50">
          <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">In Maintenance</span>
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">{String(kpis.in_shop).padStart(2, '0')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-indigo-200/50 bg-indigo-50/50">
          <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Trips</span>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.active_trips}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200/80 bg-slate-50/80">
          <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pending Trips</span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">{String(kpis.pending_trips).padStart(2, '0')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-sky-200/50 bg-sky-50/50">
          <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Drivers On Duty</span>
            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.drivers_on_duty}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200/80 bg-slate-100/50">
          <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Fleet Utilization</span>
            <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpis.fleet_utilization}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <Card className="shadow-sm border-slate-200/80 bg-white/60 backdrop-blur-md lg:col-span-2">
          <CardHeader className="border-b border-slate-100 p-4">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Trips</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 pl-6">Trip ID</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Driver</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-6 text-right">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No recent operations or trips logged.
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((trip: any) => (
                      <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 pl-6 font-semibold text-slate-800">
                          TR{String(trip.id).padStart(3, '0')}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {trip.route}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {trip.driver_id ? `Driver #${trip.driver_id}` : "Unassigned"}
                        </td>
                        <td className="p-3.5">
                          <Badge variant="outline" className={`font-semibold text-[10px] rounded-md ${getTripStatusColor(trip.status)}`}>
                            {trip.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 pr-6 text-right font-medium text-slate-500">
                          {getEtaLabel(trip.status, trip.planned_distance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Status Progress Bars */}
        <Card className="shadow-sm border-slate-200/80 bg-white/60 backdrop-blur-md">
          <CardHeader className="border-b border-slate-100 p-4">
            <CardTitle className="text-base font-semibold text-slate-900">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {fleetStatusData.map((item: any, idx: number) => {
              const colors = [
                { bg: "bg-emerald-500", text: "text-emerald-600" }, // Available
                { bg: "bg-blue-500", text: "text-blue-600" },     // On Trip
                { bg: "bg-amber-500", text: "text-amber-600" },   // In Shop
                { bg: "bg-red-400", text: "text-red-500" },       // Retired
              ];
              const theme = colors[idx % colors.length];
              const pct = getPct(item.value);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>{item.name}</span>
                    <span className={theme.text}>{item.value} vehicles ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${theme.bg} rounded-full transition-all duration-500`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

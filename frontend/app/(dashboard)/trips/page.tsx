"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Route, PlayCircle, AlertTriangle, CheckCircle, Circle, ArrowRight, Truck, Clock, XCircle, Radio, MoreVertical, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CardDescription } from "@/components/ui/card";

export default function TripsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states for dynamic capacity check
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");

  const { data: trips = [], isLoading: tripsLoading } = useQuery({ queryKey: ["trips"], queryFn: api.getTrips });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: api.getVehicles });
  const { data: drivers = [] } = useQuery({ queryKey: ["drivers"], queryFn: api.getDrivers });

  const createMutation = useMutation({
    mutationFn: api.createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Trip dispatched successfully");
      setIsAddOpen(false);
      setSelectedVehicleId("");
      setCargoWeight("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to dispatch trip");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.updateTrip(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Trip updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update trip");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Trip deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete trip");
    }
  });

  const filteredTrips = trips.filter((t: any) => 
    t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.route_details && t.route_details.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a: any, b: any) => a.id - b.id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("start_time") as string;
    const vId = parseInt(formData.get("vehicle_id") as string, 10);
    const dId = parseInt(formData.get("driver_id") as string, 10);
    const cargo = parseFloat(formData.get("cargo_weight") as string);
    const dist = parseFloat(formData.get("planned_distance") as string);
    const src = formData.get("source") as string;
    const dest = formData.get("destination") as string;
    const details = formData.get("route_details") as string;

    createMutation.mutate({
      vehicle_id: vId,
      driver_id: dId,
      source: src,
      destination: dest,
      cargo_weight: cargo,
      planned_distance: dist,
      start_time: new Date(dateStr).toISOString(),
      route_details: details,
      revenue: dist * 2.5 // Auto-revenue based on distance
    });
  };

  // Dispatchable items filter (Available status)
  const dispatchableVehicles = vehicles.filter((v: any) => v.status === "Available" || v.status === "AVAILABLE");
  const dispatchableDrivers = drivers.filter((d: any) => d.status === "Available" || d.status === "AVAILABLE");

  // Dynamic capacity calculations
  const selectedVehicle = vehicles.find((v: any) => v.id === parseInt(selectedVehicleId, 10));
  const capacityExceeded = selectedVehicle && parseFloat(cargoWeight) > selectedVehicle.capacity;
  const excessAmount = selectedVehicle && capacityExceeded ? parseFloat(cargoWeight) - selectedVehicle.capacity : 0;

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "Dispatched":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "In Transit":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Trips & Dispatch</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active routes, dispatch drivers, and monitor cargo weight.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full px-5">
              <Plus className="h-4 w-4 mr-2" /> Dispatch Trip
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Dispatch New Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Source</label>
                  <Input name="source" placeholder="Gandhinagar Depot" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Destination</label>
                  <Input name="destination" placeholder="Ahmedabad Hub" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Assign Vehicle (Available Only)</label>
                <select 
                  name="vehicle_id" 
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" 
                  required
                >
                  <option value="">Select a vehicle...</option>
                  {dispatchableVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.registration_number} ({v.make} {v.model} - Cap: {v.capacity}kg)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Assign Driver (Available Only)</label>
                <select 
                  name="driver_id" 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" 
                  required
                >
                  <option value="">Select a driver...</option>
                  {dispatchableDrivers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name} (License: {d.license_number})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Cargo Weight (kg)</label>
                  <Input 
                    type="number" 
                    name="cargo_weight" 
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="450" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Planned Distance (km)</label>
                  <Input type="number" name="planned_distance" placeholder="38" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Start Time</label>
                <Input type="datetime-local" name="start_time" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Route / Notes</label>
                <Input name="route_details" placeholder="Route 4 express logistics notes" />
              </div>

              {/* Dynamic Capacity Warning Block */}
              {selectedVehicle && (
                <div className={`p-4 rounded-xl border text-xs space-y-1 ${capacityExceeded ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <p className="font-semibold">Vehicle Capacity: {selectedVehicle.capacity} kg</p>
                  <p>Cargo Weight: {cargoWeight || 0} kg</p>
                  {capacityExceeded && (
                    <p className="font-bold flex items-center gap-1 mt-1 text-red-800">
                      <AlertTriangle className="w-3.5 h-3.5" /> Capacity exceeded by {excessAmount} kg - dispatch blocked
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full h-11" 
                disabled={createMutation.isPending || !!capacityExceeded}
              >
                {createMutation.isPending ? "Dispatching..." : "Dispatch Trip"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trip Lifecycle Diagram */}
      <Card className="shadow-none border-slate-200 bg-white/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Trip Lifecycle</CardTitle>
          <CardDescription>Every trip follows this status flow.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-2xl mx-auto py-2">
            {[
              { label: "Planned", icon: Circle, color: "bg-slate-100 text-slate-600 border-slate-200" },
              { label: "Dispatched", icon: PlayCircle, color: "bg-blue-50 text-blue-600 border-blue-200" },
              { label: "In Transit", icon: Truck, color: "bg-amber-50 text-amber-600 border-amber-200" },
              { label: "Completed", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
            ].map((step, idx) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">{step.label}</span>
                </div>
                {idx < 3 && (
                  <div className="flex items-center mx-3 mb-5">
                    <div className="w-12 h-0.5 bg-slate-200 rounded-full" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 -ml-0.5" />
                  </div>
                )}
              </div>
            ))}
            {/* Cancelled branch */}
            <div className="flex items-center ml-2 mb-5">
              <div className="w-6 h-0.5 bg-red-200 rounded-full" />
              <ArrowRight className="w-3.5 h-3.5 text-red-300 -ml-0.5" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full border-2 border-red-200 bg-red-50 text-red-500 flex items-center justify-center">
                <XCircle className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-semibold text-red-600">Cancelled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Board */}
      {(() => {
        const activeTrips = trips.filter((t: any) => t.status === "Dispatched" || t.status === "In Transit");
        if (activeTrips.length === 0) return null;
        return (
          <Card className="shadow-none border-blue-200/60 bg-gradient-to-r from-blue-50/50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                </span>
                <CardTitle className="text-base font-semibold">Live Board</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] font-bold">{activeTrips.length} Active</Badge>
              </div>
              <CardDescription>Real-time view of dispatched and in-transit trips.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeTrips.map((trip: any) => {
                  const vehicle = vehicles.find((v: any) => v.id === trip.vehicle_id);
                  const driver = drivers.find((d: any) => d.id === trip.driver_id);
                  const isInTransit = trip.status === "In Transit";
                  const lifecycleSteps = ["Planned", "Dispatched", "In Transit", "Completed"];
                  const currentStepIdx = lifecycleSteps.indexOf(trip.status);
                  return (
                    <div key={trip.id} className="border border-slate-200/80 bg-white rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">{trip.source} → {trip.destination}</span>
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${isInTransit ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                          {isInTransit && <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" />}
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{vehicle?.registration_number || "N/A"}</span>
                        <span>{driver?.name || "Unassigned"}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {/* Mini lifecycle stepper */}
                      <div className="flex items-center gap-1">
                        {lifecycleSteps.map((step, idx) => (
                          <div key={step} className="flex items-center gap-1 flex-1">
                            <div className={`h-1.5 rounded-full flex-1 transition-all ${idx <= currentStepIdx ? 'bg-blue-500' : 'bg-slate-200'}`} />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        {trip.status === "Dispatched" && (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-amber-500 hover:bg-amber-600 text-white rounded-full px-3"
                            onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "In Transit" } })}
                          >
                            Mark In Transit
                          </Button>
                        )}
                        {(trip.status === "Dispatched" || trip.status === "In Transit") && (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-3"
                            onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "Completed", end_time: new Date().toISOString() } })}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Card className="shadow-none border-slate-200 bg-white/60">
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Search source/destination..." 
              className="pl-9 bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {tripsLoading ? (
            <div className="p-8 text-center text-slate-500">Loading trips...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Route className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No active trips</p>
              <p className="text-sm mt-1">Dispatch a trip to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Route</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Vehicle / Driver</TableHead>
                  <TableHead>Weight / Distance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((trip: any) => {
                  const vehicle = vehicles.find((v: any) => v.id === trip.vehicle_id);
                  const driver = drivers.find((d: any) => d.id === trip.driver_id);
                  return (
                    <TableRow key={trip.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-900 pl-6">
                        <div className="flex flex-col">
                          <span>{trip.source} &rarr; {trip.destination}</span>
                          <span className="text-xs font-normal text-slate-500">{trip.route_details || "No notes"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(trip.start_time).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-slate-800">{vehicle?.registration_number || "Unassigned"}</div>
                        <div className="text-xs text-slate-500">{driver?.name || "Unassigned"}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div>{trip.cargo_weight} kg cargo</div>
                        <div>{trip.planned_distance} km</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-semibold text-[10px] rounded-md ${getTripStatusColor(trip.status)}`}>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2 items-center">
                          {(trip.status === "Draft" || trip.status === "Planned") && (
                            <Button 
                              size="sm" 
                              className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-full px-3.5"
                              onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "Dispatched" } })}
                            >
                              <PlayCircle className="h-3.5 w-3.5 mr-1" /> Dispatch
                            </Button>
                          )}
                          {trip.status === "Dispatched" && (
                            <Button 
                              size="sm" 
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-full px-3.5"
                              onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "Completed", end_time: new Date().toISOString() } })}
                            >
                              Complete
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl p-1 z-50">
                              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Change Status</div>
                              {["Draft", "Planned", "Dispatched", "In Transit", "Completed", "Cancelled"]
                                .filter((s) => s !== trip.status)
                                .map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => updateMutation.mutate({ id: trip.id, data: { status } })}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
                                  >
                                    <span className={`w-2 h-2 rounded-full ${
                                      status === "Completed" ? "bg-emerald-500" :
                                      status === "Dispatched" ? "bg-blue-500" :
                                      status === "In Transit" ? "bg-amber-500" :
                                      status === "Cancelled" ? "bg-red-500" : "bg-slate-400"
                                    }`} />
                                    {status}
                                  </DropdownMenuItem>
                                ))}
                              
                              <DropdownMenuSeparator className="my-1 border-t border-slate-100" />
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete this trip?`)) {
                                    deleteMutation.mutate(trip.id);
                                  }
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
                              >
                                <Trash className="w-4 h-4" /> Delete Trip
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

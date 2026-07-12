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
import { Plus, Search, Route, PlayCircle, AlertTriangle } from "lucide-react";

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
    }
  });

  const filteredTrips = trips.filter((t: any) => 
    t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.route_details && t.route_details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                        {(trip.status === "Draft" || trip.status === "Planned") && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-full px-3.5"
                              onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "Dispatched" } })}
                            >
                              <PlayCircle className="h-3.5 w-3.5 mr-1" /> Dispatch
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-slate-200 text-red-650 hover:bg-red-50 hover:border-red-200 font-medium text-xs rounded-full px-3.5"
                              onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "Cancelled" } })}
                            >
                              Cancel
                            </Button>
                          </div>
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

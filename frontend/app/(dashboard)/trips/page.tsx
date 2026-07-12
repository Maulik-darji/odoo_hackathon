"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Plus, Search, MoreVertical, Route, PlayCircle } from "lucide-react";

export default function TripsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: trips = [], isLoading: tripsLoading } = useQuery({ queryKey: ["trips"], queryFn: api.getTrips });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: api.getVehicles });
  const { data: drivers = [] } = useQuery({ queryKey: ["drivers"], queryFn: api.getDrivers });

  const createMutation = useMutation({
    mutationFn: api.createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip dispatched successfully");
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to dispatch trip");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.updateTrip(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip updated successfully");
    }
  });

  const filteredTrips = trips.filter((t: any) => 
    (t.route_details && t.route_details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("start_time") as string;
    
    createMutation.mutate({
      vehicle_id: parseInt(formData.get("vehicle_id") as string, 10),
      driver_id: parseInt(formData.get("driver_id") as string, 10),
      cargo_weight: parseFloat(formData.get("cargo_weight") as string),
      route_details: formData.get("route_details"),
      start_time: new Date(dateStr).toISOString(),
    });
  };

  const activeVehicles = vehicles.filter((v: any) => v.status === "Active");
  const activeDrivers = drivers.filter((d: any) => d.status === "Active");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Trips & Dispatch</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active routes, dispatch drivers, and monitor cargo.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Dispatch Trip
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dispatch New Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Route Details</label>
                <Input name="route_details" placeholder="e.g. NYC to BOS" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Vehicle</label>
                <select name="vehicle_id" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required>
                  <option value="">Select a vehicle...</option>
                  {activeVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.registration_number} (Cap: {v.capacity}kg)</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Driver</label>
                <select name="driver_id" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required>
                  <option value="">Select a driver...</option>
                  {activeDrivers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargo Weight (kg)</label>
                  <Input type="number" name="cargo_weight" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="datetime-local" name="start_time" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-slate-900" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Dispatching..." : "Dispatch Trip"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Search routes..." 
              className="pl-9 bg-slate-50/50" 
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
                  <TableHead>Route</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Vehicle / Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((trip: any) => {
                  const vehicle = vehicles.find((v: any) => v.id === trip.vehicle_id);
                  const driver = drivers.find((d: any) => d.id === trip.driver_id);
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium text-slate-900">{trip.route_details}</TableCell>
                      <TableCell>{new Date(trip.start_time).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{vehicle?.registration_number}</div>
                        <div className="text-xs text-slate-500">{driver?.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          trip.status === "Planned" ? "secondary" : 
                          trip.status === "In Progress" ? "default" : 
                          trip.status === "Completed" ? "outline" : "destructive"
                        }>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {trip.status === "Planned" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-2"
                            onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "In Progress" } })}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" /> Start
                          </Button>
                        )}
                        {trip.status === "In Progress" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 mr-2"
                            onClick={() => updateMutation.mutate({ id: trip.id, data: { status: "Completed", end_time: new Date().toISOString() } })}
                          >
                            Complete
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
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

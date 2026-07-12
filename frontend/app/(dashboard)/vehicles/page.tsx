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
import { Plus, Search, MoreVertical, Edit, Trash, Truck, ShieldAlert, Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const vehicleTypes = ["All", "Truck", "Van", "Bus", "Trailer"];
  const vehicleStatuses = ["All", "Available", "On Trip", "In Shop", "Retired"];

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "On Trip":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "In Shop":
        return "bg-red-50 text-red-700 border-red-200/60";
      case "Retired":
        return "bg-slate-100 text-slate-500 border-slate-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case "Truck":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Van":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Bus":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Trailer":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.getVehicles,
  });

  const createMutation = useMutation({
    mutationFn: api.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle created successfully");
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create vehicle");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully");
      setIsEditOpen(false);
      setEditingVehicle(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update vehicle");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete vehicle");
    },
  });

  const filteredVehicles = vehicles.filter((v: any) => {
    const matchesSearch = v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || v.vehicle_type === filterType;
    const matchesStatus = filterStatus === "All" || v.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a: any, b: any) => a.id - b.id);

  const activeFilterCount = (filterType !== "All" ? 1 : 0) + (filterStatus !== "All" ? 1 : 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      registration_number: formData.get("registration_number"),
      make: formData.get("make"),
      model: formData.get("model"),
      capacity: parseFloat(formData.get("capacity") as string),
    });
  };
  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVehicle) return;
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingVehicle.id,
      data: {
        registration_number: formData.get("registration_number"),
        make: formData.get("make"),
        model: formData.get("model"),
        capacity: parseFloat(formData.get("capacity") as string),
      }
    });
  };
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Vehicles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your fleet, track status, and capacities.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Vehicle
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Number</label>
                <Input name="registration_number" placeholder="e.g. CA-12345" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Make</label>
                  <Input name="make" placeholder="e.g. Ford" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Input name="model" placeholder="e.g. Transit" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity (kg)</label>
                <Input type="number" name="capacity" placeholder="e.g. 5000" required />
              </div>
              <Button type="submit" className="w-full bg-slate-900" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Save Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
            </DialogHeader>
            {editingVehicle && (
              <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Number</label>
                  <Input name="registration_number" defaultValue={editingVehicle.registration_number} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Make</label>
                    <Input name="make" defaultValue={editingVehicle.make} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model</label>
                    <Input name="model" defaultValue={editingVehicle.model} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity (kg)</label>
                  <Input type="number" name="capacity" defaultValue={editingVehicle.capacity} required />
                </div>
                <Button type="submit" className="w-full bg-slate-900" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-100 space-y-3">
          <div className="flex flex-row items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="search" 
                placeholder="Search vehicles..." 
                className="pl-9 bg-slate-50/50" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setFilterType("All"); setFilterStatus("All"); }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="h-3 w-3" /> Clear filters ({activeFilterCount})
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100/80 rounded-full">
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      filterType === type
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100/80 rounded-full">
                {vehicleStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      filterStatus === status
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading vehicles...</div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Truck className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No vehicles found</p>
              <p className="text-sm mt-1">Add a vehicle to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Registration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Make / Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle: any) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium text-slate-900">{vehicle.registration_number}</TableCell>
                    <TableCell><Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider ${getVehicleTypeColor(vehicle.vehicle_type)}`}>{vehicle.vehicle_type}</Badge></TableCell>
                    <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.capacity} kg</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider rounded-md ${getVehicleStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-white border border-slate-100 shadow-lg rounded-xl p-1 z-50">
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingVehicle(vehicle);
                              setIsEditOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <Edit className="w-4 h-4 text-slate-500" /> Edit Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1 border-t border-slate-100" />

                          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Change Status</div>
                          {["Available", "On Trip", "In Shop", "Retired"]
                            .filter((s) => s !== vehicle.status)
                            .map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => updateMutation.mutate({ id: vehicle.id, data: { status } })}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
                              >
                                <span className={`w-2 h-2 rounded-full ${
                                  status === "Available" ? "bg-emerald-500" :
                                  status === "On Trip" ? "bg-blue-500" :
                                  status === "In Shop" ? "bg-red-500" : "bg-slate-400"
                                }`} />
                                {status}
                              </DropdownMenuItem>
                            ))}

                          <DropdownMenuSeparator className="my-1 border-t border-slate-100" />
                          
                          <DropdownMenuItem 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete vehicle ${vehicle.registration_number}?`)) {
                                deleteMutation.mutate(vehicle.id);
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            <Trash className="w-4 h-4" /> Delete Vehicle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

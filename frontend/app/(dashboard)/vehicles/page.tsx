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
import { Plus, Search, MoreVertical, Edit, Trash, Truck } from "lucide-react";

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

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

  const filteredVehicles = vehicles.filter((v: any) => 
    v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
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
                    <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.capacity} kg</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === "Active" ? "default" : vehicle.status === "In Shop" ? "destructive" : "secondary"}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
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

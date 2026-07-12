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
import { Plus, Search, MoreVertical, Users } from "lucide-react";

export default function DriversPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "On Trip":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Off Duty":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Suspended":
        return "bg-red-50 text-red-700 border-red-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: api.getDrivers,
  });

  const createMutation = useMutation({
    mutationFn: api.createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver added successfully");
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add driver");
    },
  });

  const filteredDrivers = drivers.filter((d: any) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("license_expiry") as string;
    
    createMutation.mutate({
      name: formData.get("name"),
      license_number: formData.get("license_number"),
      license_expiry: new Date(dateStr).toISOString(),
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Drivers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage driver profiles and license validations.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Driver
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input name="name" placeholder="e.g. John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">License Number</label>
                <Input name="license_number" placeholder="e.g. DL-987654321" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">License Expiry Date</label>
                <Input type="date" name="license_expiry" required />
              </div>
              <Button type="submit" className="w-full bg-slate-900" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Save Driver"}
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
              placeholder="Search drivers..." 
              className="pl-9 bg-slate-50/50" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading drivers...</div>
          ) : filteredDrivers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No drivers found</p>
              <p className="text-sm mt-1">Add a driver to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License Number</TableHead>
                  <TableHead>License Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver: any) => {
                  const isExpired = new Date(driver.license_expiry) < new Date();
                  return (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium text-slate-900">{driver.name}</TableCell>
                      <TableCell>{driver.license_number}</TableCell>
                      <TableCell className={isExpired ? "text-red-600 font-medium" : ""}>
                        {new Date(driver.license_expiry).toLocaleDateString()}
                        {isExpired && " (Expired)"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider rounded-md ${getDriverStatusColor(driver.status)}`}>
                          {driver.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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

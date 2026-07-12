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
import { Plus, Search, MoreVertical, Wrench, CheckCircle } from "lucide-react";

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: maintenanceLogs = [], isLoading } = useQuery({ queryKey: ["maintenance"], queryFn: api.getMaintenanceLogs });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: api.getVehicles });

  const createMutation = useMutation({
    mutationFn: api.createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Maintenance logged successfully");
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to log maintenance");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.updateMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Maintenance updated");
    }
  });

  const filteredLogs = maintenanceLogs.filter((m: any) => 
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("start_date") as string;
    
    createMutation.mutate({
      vehicle_id: parseInt(formData.get("vehicle_id") as string, 10),
      description: formData.get("description"),
      cost: parseFloat(formData.get("cost") as string),
      status: formData.get("status"),
      start_date: new Date(dateStr).toISOString(),
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Maintenance</h1>
          <p className="text-sm text-slate-500 mt-1">Track vehicle repairs, service logs, and maintenance costs.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Log Maintenance
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Maintenance</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Vehicle</label>
                <select name="vehicle_id" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required>
                  <option value="">Select a vehicle...</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.registration_number}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="e.g. Oil Change & Tire Rotation" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost ($)</label>
                  <Input type="number" name="cost" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" name="start_date" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select name="status" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress (Moves vehicle to In Shop)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-slate-900" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Logging..." : "Log Maintenance"}
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
              placeholder="Search descriptions..." 
              className="pl-9 bg-slate-50/50" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wrench className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No maintenance logs</p>
              <p className="text-sm mt-1">Log a service to keep your fleet healthy.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any) => {
                  const vehicle = vehicles.find((v: any) => v.id === log.vehicle_id);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-slate-900">{vehicle?.registration_number}</TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>${log.cost.toFixed(2)}</TableCell>
                      <TableCell>{new Date(log.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          log.status === "Scheduled" ? "secondary" : 
                          log.status === "In Progress" ? "default" : 
                          log.status === "Completed" ? "outline" : "destructive"
                        }>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {(log.status === "Scheduled" || log.status === "In Progress") && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 mr-2"
                            onClick={() => updateMutation.mutate({ id: log.id, data: { status: "Completed", end_date: new Date().toISOString() } })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Finish
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

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, MoreVertical, Fuel, FileText, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({ queryKey: ["expenses"], queryFn: api.getExpenses });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: api.getVehicles });

  const createMutation = useMutation({
    mutationFn: api.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Expense logged successfully");
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to log expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

  const filteredExpenses = expenses.filter((e: any) => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("date") as string;
    
    createMutation.mutate({
      vehicle_id: formData.get("vehicle_id") ? parseInt(formData.get("vehicle_id") as string, 10) : undefined,
      type: formData.get("type"),
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description"),
      date: new Date(dateStr).toISOString(),
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Fuel & Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Track operational costs, fuel logs, and tolls.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Log Expense
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select name="type" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required>
                  <option value="Fuel">Fuel</option>
                  <option value="Toll">Toll</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="e.g. Highway 41 Toll" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle (Optional)</label>
                <select name="vehicle_id" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="">No specific vehicle</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.registration_number}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input type="number" step="0.01" name="amount" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" name="date" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-slate-900" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Logging..." : "Save Expense"}
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
              placeholder="Search expenses..." 
              className="pl-9 bg-slate-50/50" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Fuel className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No expenses recorded</p>
              <p className="text-sm mt-1">Log fuel or tolls to see them here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense: any) => {
                  const vehicle = vehicles.find((v: any) => v.id === expense.vehicle_id);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm bg-slate-100 text-slate-700">
                          {expense.category === "Fuel" ? <Fuel className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          {expense.category || expense.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{expense.description}</TableCell>
                      <TableCell>{vehicle?.registration_number || "-"}</TableCell>
                      <TableCell className="text-right font-medium">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl p-1 z-50">
                            <DropdownMenuItem 
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this expense?")) {
                                  deleteMutation.mutate(expense.id);
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              <Trash className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-semibold text-right">Total Expenses</TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    ₹{filteredExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, UserResponse } from "@/lib/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldAlert, Trash2, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ManageAccessPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PENDING, APPROVED

  // Query users
  const { data: users = [], isLoading, error, refetch } = useQuery<UserResponse[]>({
    queryKey: ["usersList"],
    queryFn: api.getDrivers, // wait! we defined users endpoints, so we need to call api.getUsers or direct fetch.
    // Let's implement dynamic direct fetch since api.ts doesn't have getUsers method yet.
    // Actually, we can define a method getUsers in api.ts, or just fetch it here.
    // Let's see: we can fetch directly from `/users/` using the api client request function, or define a getMe/getUsers wrapper.
    // Let's write the fetch using custom fetch or update api.ts. We already updated api.ts?
    // Wait, let's look at what we added to api.ts:
    // We added sendOtp, verifyOtp, register. We didn't add getUsers!
    // Let's add getUsers to api.ts or write it inline. Writing it inline or updating api.ts is great.
    // Let's check what we can write inline:
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/users/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    }
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/users/${userId}/approve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (!res.ok) throw new Error("Failed to approve user");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["usersList"] });
      toast.success(`Approved ${data.name || data.email}! Approval email sent.`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to approve user");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/users/${userId}/reject`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (!res.ok) throw new Error("Failed to reject user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersList"] });
      toast.success("User access suspended.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersList"] });
      toast.success("User account deleted successfully.");
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Loading operational accounts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl max-w-xl">
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Access Denied or Connection Failure
        </h3>
        <p className="text-sm">Please ensure you are logged in as an Administrator and the backend server is running.</p>
      </div>
    );
  }

  // Filter and search
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.id).includes(searchQuery);
    
    if (filterStatus === "PENDING") {
      return matchesSearch && !u.is_approved && !u.is_admin;
    }
    if (filterStatus === "APPROVED") {
      return matchesSearch && u.is_approved;
    }
    return matchesSearch;
  });

  // Helper for colored role badges
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Fleet Manager":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Dispatcher":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Safety Officer":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Financial Analyst":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Desc */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-normal tracking-tight">
              Manage <span className="serif-italic">Access</span>
            </h1>
            <Badge className="bg-slate-900 text-white font-medium hover:bg-slate-900 rounded-full px-2.5">
              {users.length} Total
            </Badge>
          </div>
          <p className="text-slate-500 text-sm">
            Search, approve, and delete user accounts and their associated operational roles.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-200/60 rounded-full">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white/40 backdrop-blur-md p-3 border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 bg-white/80 border-slate-200/60 focus-visible:ring-blue-500 rounded-xl"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-full shrink-0">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${filterStatus === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilterStatus("PENDING")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${filterStatus === "PENDING" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            PENDING
          </button>
          <button
            onClick={() => setFilterStatus("APPROVED")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${filterStatus === "APPROVED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            APPROVED
          </button>
        </div>
      </div>

      {/* User Access Table */}
      <div className="border border-white/60 bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/40">
              <th className="p-4 pl-6">User</th>
              <th className="p-4">ID Number</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-slate-400 text-sm font-medium">
                  No operational accounts found matching filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((item) => (
                <tr key={item.id} className="hover:bg-white/40 transition-colors">
                  {/* User Initials Avatar + Info */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {item.name 
                          ? item.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                          : item.email[0].toUpperCase()
                        }
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-900">
                          {item.name || "Awaiting Name"}
                          {item.is_admin && <span className="ml-1.5 text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Admin</span>}
                        </span>
                        <span className="text-xs text-slate-500">{item.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* ID number */}
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {String(item.id).padStart(12, "0")}
                  </td>

                  {/* Role Badge */}
                  <td className="p-4">
                    <Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider rounded-md ${getRoleBadgeColor(item.role)}`}>
                      {item.role}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {item.is_admin ? (
                      <Badge className="bg-slate-100 text-slate-800 border-slate-200 font-semibold text-[10px]">
                        Bypassed (Admin)
                      </Badge>
                    ) : item.is_approved ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold text-[10px]">
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200/60 font-semibold text-[10px] animate-pulse">
                        Pending Approval
                      </Badge>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="p-4 text-xs text-slate-500">
                    {formatDate(item.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      {!item.is_approved && !item.is_admin && (
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(item.id)}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-full px-3.5 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </Button>
                      )}
                      {item.is_approved && !item.is_admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectMutation.mutate(item.id)}
                          className="h-8 border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-full px-3.5"
                        >
                          Suspend
                        </Button>
                      )}
                      {!item.is_admin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${item.email}?`)) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          className="h-8 hover:bg-red-50 text-red-600 font-semibold text-xs rounded-full hover:text-red-700"
                        >
                          DELETE ACCOUNT
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

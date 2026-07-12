"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";

export default function UpgradeRolePage() {
  const { user, setUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState("Dispatcher");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitRequest = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await api.requestRoleUpgrade(selectedRole);
      // Sync auth context user state
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(`Requested role change to ${selectedRole}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit role change request");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDesc = (roleName: string) => {
    switch (roleName) {
      case "Fleet Manager":
        return "Full operations: Manage assets, track odometer readings, log maintenance logs, and manage Settings.";
      case "Dispatcher":
        return "Live logistics: Create and assign trips, monitor status pipelines, and track dispatcher dashboard metrics.";
      case "Safety Officer":
        return "Compliance & Safety: Maintain driver rosters, track safety scores, and view compliance alerts.";
      case "Financial Analyst":
        return "Finances & Cost tracking: Track fuel logs, permits, toll fees, and analyze overall operational cost charts.";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-normal tracking-tight">
          Request <span className="serif-italic">Upgrade</span>
        </h1>
        <p className="text-slate-500 text-sm">
          Change or upgrade your operational access scope.
        </p>
      </div>

      <div className="border border-white/60 bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm space-y-6">
        {/* Current Role status */}
        <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-100 rounded-xl">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Role</p>
            <p className="text-sm font-semibold text-slate-800">{user?.role || "Fleet Manager"}</p>
          </div>
          <Badge className="bg-slate-900 text-white font-medium hover:bg-slate-900 rounded-full px-2.5">
            Active
          </Badge>
        </div>

        {/* Pending Request status */}
        {user?.requested_role && (
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldQuestion className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Upgrade Request</p>
              <p className="text-sm text-slate-600">
                You requested an upgrade to <strong className="text-slate-800">{user.requested_role}</strong>. 
                Awaiting administrator review.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade Form */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Select target role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-12 px-3 rounded-lg border border-slate-200/60 bg-white/80 focus-visible:ring-blue-500 text-sm focus:outline-none"
            >
              <option value="Fleet Manager">Fleet Manager</option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Safety Officer">Safety Officer</option>
              <option value="Financial Analyst">Financial Analyst</option>
            </select>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Role Description:
            </p>
            <p>{getRoleDesc(selectedRole)}</p>
          </div>

          <Button
            onClick={handleSubmitRequest}
            disabled={isLoading || user?.requested_role === selectedRole}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Submitting..." : (
              <>
                Submit Upgrade Request <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

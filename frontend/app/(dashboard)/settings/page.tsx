"use client";

import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, User, Building, Bell, ShieldCheck, Check, Minus, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  const [depotName, setDepotName] = useState("Gandhinagar Depot G3V");
  const [currency, setCurrency] = useState("INR (₹)");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers");

  const handleRestartTour = () => {
    localStorage.removeItem("transitops_tour_completed");
    toast.success("Tour reset! The page will now reload to start the guide.");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully.");
  };

  if (isLoading || !user) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading settings...
      </div>
    );
  }

  // RBAC permission matrix
  const rbacData = [
    { role: "Fleet Manager", fleet: "full", drivers: "full", trips: "none", fuelExp: "none", analytics: "full" },
    { role: "Dispatcher", fleet: "view", drivers: "none", trips: "full", fuelExp: "none", analytics: "none" },
    { role: "Safety Officer", fleet: "none", drivers: "full", trips: "view", fuelExp: "none", analytics: "none" },
    { role: "Financial Analyst", fleet: "view", drivers: "none", trips: "none", fuelExp: "full", analytics: "full" },
  ];

  const renderPermission = (level: string) => {
    if (level === "full") return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600"><Check className="w-3.5 h-3.5" /></span>;
    if (level === "view") return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200/60 text-[10px] font-bold uppercase tracking-wider">View</Badge>;
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-300"><Minus className="w-3.5 h-3.5" /></span>;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and application settings.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><User className="w-4 h-4" /> Profile</TabsTrigger>
          <TabsTrigger value="organization" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><Building className="w-4 h-4" /> General</TabsTrigger>
          <TabsTrigger value="rbac" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><ShieldCheck className="w-4 h-4" /> RBAC</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={user?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue={user?.email || ""} disabled className="bg-slate-50" />
                  <p className="text-xs text-slate-500">Contact support to change your email address.</p>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input defaultValue={user?.role || ""} disabled className="bg-slate-50" />
                </div>
                <Button type="submit" className="bg-slate-900">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Customize your TransitOps experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-medium">Onboarding Tour</h4>
                  <p className="text-sm text-slate-500">Replay the interactive guide to learn about TransitOps.</p>
                </div>
                <Button variant="outline" onClick={handleRestartTour}>
                  <PlayCircle className="w-4 h-4 mr-2" /> Restart Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure depot, currency, and distance preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Depot Name</Label>
                  <Input value={depotName} onChange={(e) => setDepotName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Distance Unit</Label>
                    <select 
                      value={distanceUnit}
                      onChange={(e) => setDistanceUnit(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option>Kilometers</option>
                      <option>Miles</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="bg-slate-900">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Manage company details and regional settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="Acme Logistics Inc." />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option>IST (India Standard Time)</option>
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                  </select>
                </div>
                <Button type="submit" className="bg-slate-900">Save Organization</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rbac" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
              <CardDescription>View the permission matrix for each role across system modules.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-[200px] font-bold text-slate-700">Role</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Fleet</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Drivers</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Trips</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Fuel/Exp.</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Analytics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rbacData.map((row) => (
                    <TableRow key={row.role}>
                      <TableCell className="font-semibold text-slate-900">{row.role}</TableCell>
                      <TableCell className="text-center">{renderPermission(row.fleet)}</TableCell>
                      <TableCell className="text-center">{renderPermission(row.drivers)}</TableCell>
                      <TableCell className="text-center">{renderPermission(row.trips)}</TableCell>
                      <TableCell className="text-center">{renderPermission(row.fuelExp)}</TableCell>
                      <TableCell className="text-center">{renderPermission(row.analytics)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permission Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600"><Check className="w-3.5 h-3.5" /></span>
                  <span className="text-sm text-slate-700">Full Access — Create, Read, Update, Delete</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200/60 text-[10px] font-bold uppercase tracking-wider">View</Badge>
                  <span className="text-sm text-slate-700">Read-only access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-300"><Minus className="w-3.5 h-3.5" /></span>
                  <span className="text-sm text-slate-700">No access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what alerts you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Trip Dispatch Alerts</h4>
                  <p className="text-sm text-slate-500">Receive an email when a new trip starts.</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-slate-900 rounded border-slate-300" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Maintenance Reminders</h4>
                  <p className="text-sm text-slate-500">Get notified when vehicles need service.</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-slate-900 rounded border-slate-300" defaultChecked />
              </div>
              <Button onClick={handleSave} className="bg-slate-900 mt-4">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

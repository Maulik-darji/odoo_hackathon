"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, User, Building, Bell } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();

  const handleRestartTour = () => {
    localStorage.removeItem("transitops_tour_completed");
    toast.success("Tour reset! Refresh the page to start the onboarding guide again.");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and application settings.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
          <TabsTrigger value="organization" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><Building className="w-4 h-4 mr-2" /> Organization</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
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

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
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

import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function BusinessProfile() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "TAMYR Coffee",
    category: "coffee_shop",
    phone: "+7 (701) 123-45-67",
    email: "info@tamyr-coffee.kz",
    address: "ul. Dostyk 15, Astana",
    workingHoursStart: "07:00",
    workingHoursEnd: "22:00",
    peakHoursStart: "09:00",
    peakHoursEnd: "11:00",
    quietHoursStart: "14:00",
    quietHoursEnd: "16:00",
    targetROI: "3.5",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Demo mode — just simulate save
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Business profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your business information and settings</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
            <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
          </TabsList>

          {/* General Information */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic details about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Coffee Lab Astana"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Business Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">Select category</option>
                      <option value="coffee_shop">Coffee Shop</option>
                      <option value="salon">Salon / Spa</option>
                      <option value="retail">Retail Store</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="gym">Gym / Fitness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+7 (XXX) XXX-XX-XX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="business@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Hours */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Define your operating hours and peak/quiet times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Regular Operating Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workingHoursStart">Opening Time</Label>
                      <Input
                        id="workingHoursStart"
                        type="time"
                        value={formData.workingHoursStart}
                        onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workingHoursEnd">Closing Time</Label>
                      <Input
                        id="workingHoursEnd"
                        type="time"
                        value={formData.workingHoursEnd}
                        onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Peak Hours</h3>
                  <p className="text-sm text-muted-foreground mb-4">When do you get the most traffic?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="peakHoursStart">Peak Hours Start</Label>
                      <Input
                        id="peakHoursStart"
                        type="time"
                        value={formData.peakHoursStart}
                        onChange={(e) => setFormData({ ...formData, peakHoursStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="peakHoursEnd">Peak Hours End</Label>
                      <Input
                        id="peakHoursEnd"
                        type="time"
                        value={formData.peakHoursEnd}
                        onChange={(e) => setFormData({ ...formData, peakHoursEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Quiet Hours</h3>
                  <p className="text-sm text-muted-foreground mb-4">When do you need to fill traffic?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quietHoursStart">Quiet Hours Start</Label>
                      <Input
                        id="quietHoursStart"
                        type="time"
                        value={formData.quietHoursStart}
                        onChange={(e) => setFormData({ ...formData, quietHoursStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quietHoursEnd">Quiet Hours End</Label>
                      <Input
                        id="quietHoursEnd"
                        type="time"
                        value={formData.quietHoursEnd}
                        onChange={(e) => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals & Targets */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Goals & Targets</CardTitle>
                <CardDescription>Set your business objectives and performance targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="targetROI">Target ROI (Return on Investment)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="targetROI"
                      type="number"
                      step="0.1"
                      value={formData.targetROI}
                      onChange={(e) => setFormData({ ...formData, targetROI: e.target.value })}
                      placeholder="e.g., 3.5"
                    />
                    <span className="flex items-center text-muted-foreground">x</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    For every ₸1 spent on marketing, how much revenue do you want to generate?
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm">Example ROI Targets</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Conservative: 2.0x - 2.5x</li>
                    <li>Moderate: 2.5x - 3.5x</li>
                    <li>Aggressive: 3.5x - 5.0x</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

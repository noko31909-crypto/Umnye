import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function AdminUI() {
  const { user } = useAuth();
  const [showAddTool, setShowAddTool] = useState(false);
  const [newTool, setNewTool] = useState({ name: "", category: "", description: "" });

  // Mock data
  const businesses = [
    { id: 1, name: "Coffee Lab Astana", owner: "Ahmed Khan", status: "active", customers: 247, revenue: "₸1,234,500" },
    { id: 2, name: "Beauty & Spa", owner: "Aisha Malik", status: "active", customers: 156, revenue: "₸856,300" },
    { id: 3, name: "Tech Retail", owner: "Karim Suleimenov", status: "active", customers: 89, revenue: "₸2,145,600" },
    { id: 4, name: "Fitness Plus", owner: "Zarina Orazova", status: "inactive", customers: 0, revenue: "₸0" },
  ];

  const tools = [
    { id: 1, name: "Twilio SMS", category: "SMS Gateway", status: "active", users: 45 },
    { id: 2, name: "Square", category: "POS", status: "active", users: 32 },
    { id: 3, name: "Google Analytics", category: "Analytics", status: "active", users: 28 },
    { id: 4, name: "WhatsApp Business", category: "WhatsApp", status: "beta", users: 12 },
  ];

  const campaigns = [
    { id: 1, name: "Coffee Comeback", business: "Coffee Lab Astana", status: "completed", sent: 47, roi: "3.2x" },
    { id: 2, name: "Birthday Specials", business: "Beauty & Spa", status: "active", sent: 156, roi: "2.8x" },
    { id: 3, name: "Weekend Promo", business: "Tech Retail", status: "scheduled", sent: 0, roi: "-" },
  ];

  const handleAddTool = () => {
    // Mock implementation
    console.log("Adding tool:", newTool);
    setShowAddTool(false);
    setNewTool({ name: "", category: "", description: "" });
  };

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access the admin panel</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">System overview and management tools</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="tools">Master Tools</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Templates</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
          </TabsList>

          {/* System Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Businesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground mt-1">3 active, 1 inactive</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">492</div>
                  <p className="text-xs text-green-600 mt-1">↑ 12% this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all businesses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₸4.2M</div>
                  <p className="text-xs text-green-600 mt-1">↑ 28% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Master Tools Library */}
          <TabsContent value="tools">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Master Tools Library</CardTitle>
                  <CardDescription>Manage available integrations</CardDescription>
                </div>
                <Dialog open={showAddTool} onOpenChange={setShowAddTool}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Tool
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Tool</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="toolName">Tool Name</Label>
                        <Input
                          id="toolName"
                          value={newTool.name}
                          onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                          placeholder="e.g., Twilio SMS"
                        />
                      </div>
                      <div>
                        <Label htmlFor="toolCategory">Category</Label>
                        <Input
                          id="toolCategory"
                          value={newTool.category}
                          onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                          placeholder="e.g., SMS Gateway"
                        />
                      </div>
                      <div>
                        <Label htmlFor="toolDescription">Description</Label>
                        <Input
                          id="toolDescription"
                          value={newTool.description}
                          onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                          placeholder="Tool description"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowAddTool(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTool}>Add Tool</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Active Users</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tools.map((tool) => (
                        <TableRow key={tool.id}>
                          <TableCell className="font-medium">{tool.name}</TableCell>
                          <TableCell>{tool.category}</TableCell>
                          <TableCell>
                            <Badge variant={tool.status === "active" ? "default" : "secondary"}>
                              {tool.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{tool.users}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign Templates */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Templates Manager</CardTitle>
                <CardDescription>Manage pre-built campaign templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Coffee Comeback", desc: "Re-engage inactive customers" },
                    { name: "Birthday Specials", desc: "Celebrate customer birthdays" },
                    { name: "Weekend Promo", desc: "Boost weekend traffic" },
                    { name: "Loyalty Rewards", desc: "Reward repeat customers" },
                  ].map((template, idx) => (
                    <Card key={idx} className="card-hover">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{template.desc}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          Edit Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Management */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Business Categories & Types</CardTitle>
                <CardDescription>Manage business categories and types for onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Business Types</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { id: "coffee_shop", label: "Coffee Shop", icon: "☕" },
                        { id: "retail_store", label: "Retail Store", icon: "🏪" },
                        { id: "salon", label: "Salon", icon: "💇" },
                        { id: "restaurant", label: "Restaurant", icon: "🍽️" },
                        { id: "fitness", label: "Fitness Center", icon: "💪" },
                        { id: "other", label: "Other", icon: "🏢" },
                      ].map((type) => (
                        <div key={type.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="text-3xl mb-2">{type.icon}</div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{type.id}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Business Sizes</h3>
                    <div className="space-y-2">
                      {[
                        { id: "solo", label: "Solo (1 person)", desc: "Freelancer or sole proprietor" },
                        { id: "small", label: "Small (2-10 employees)", desc: "Small team business" },
                        { id: "medium", label: "Medium (11-50 employees)", desc: "Growing business" },
                        { id: "large", label: "Large (50+ employees)", desc: "Enterprise business" },
                      ].map((size) => (
                        <div key={size.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{size.label}</p>
                              <p className="text-xs text-gray-500">{size.desc}</p>
                            </div>
                            <Badge variant="outline">{size.id}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Businesses Directory */}
          <TabsContent value="businesses">
            <Card>
              <CardHeader>
                <CardTitle>Businesses Directory</CardTitle>
                <CardDescription>Manage all businesses on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Customers</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {businesses.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell className="font-medium">{business.name}</TableCell>
                          <TableCell>{business.owner}</TableCell>
                          <TableCell>
                            <Badge variant={business.status === "active" ? "default" : "secondary"}>
                              {business.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{business.customers}</TableCell>
                          <TableCell className="text-right font-medium">{business.revenue}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MainNav } from "@/components/MainNav";
import { CheckCircle, XCircle, Clock, Eye, Shield, BarChart3, User, Monitor, Search, Wifi, WifiOff, Bell, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vendor } from "@/integrations/supabase/types";
import VendorDashboard from "./VendorDashboard";

interface ExtendedVendor extends Vendor {
  display_status: 'pending' | 'approved' | 'rejected';
}

export default function AdminPanel() {
  const { toast: showToast } = useToast();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Vendor Testing State
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Realtime State
  const [isConnected, setIsConnected] = useState(true);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: string, timestamp: Date}>>([]);
  
  const ADMIN_EMAILS = ["abrar@amarosystems.com", "abraraslam139@gmail.com"];

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        showToast({
          title: "Access Denied",
          description: "You must be logged in to access this page",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      if (!ADMIN_EMAILS.includes(user.email || '')) {
        showToast({
          title: "Access Denied", 
          description: "You don't have permission to access this admin panel",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      showToast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive"
      });
      navigate("/");
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showToast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      setProcessingId(vendorId);
      
      const newVerificationStatus = status === 'approved' ? 'verified' : 'rejected';
      
      const { error } = await supabase
        .from('vendors')
        .update({ verification_status: newVerificationStatus })
        .eq('id', vendorId);

      if (error) throw error;

      // Update local state
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, verification_status: newVerificationStatus } : v
      ));

      showToast({
        title: "Success",
        description: `Vendor ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      showToast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchVendors();
      setupRealtimeSubscription();
    }
  }, [isAuthorized]);

  // Realtime subscription setup
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-vendor-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vendors' },
        (payload) => {
          console.log('Vendor change detected:', payload);
          handleRealtimeVendorChange(payload);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          showToast({
            title: "Connected to realtime updates",
            description: "You'll see live vendor changes"
          });
        }
      });

    setRealtimeChannel(channel);
  };

  // Handle realtime vendor changes
  const handleRealtimeVendorChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        setVendors(prev => [newRecord, ...prev]);
        addNotification(`New vendor submitted: ${newRecord.business_name}`, 'info');
        showToast({
          title: "New Vendor Submitted",
          description: `${newRecord.business_name} is awaiting review`
        });
        break;
        
      case 'UPDATE':
        setVendors(prev => prev.map(v => v.id === newRecord.id ? newRecord : v));
        if (oldRecord.verification_status !== newRecord.verification_status) {
          const status = newRecord.verification_status === 'verified' ? 'approved' : 'rejected';
          addNotification(`Vendor ${status}: ${newRecord.business_name}`, 'success');
        }
        break;
        
      case 'DELETE':
        setVendors(prev => prev.filter(v => v.id !== oldRecord.id));
        addNotification(`Vendor deleted: ${oldRecord.business_name}`, 'warning');
        break;
    }
  };

  // Add notification helper
  const addNotification = (message: string, type: string) => {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Cleanup realtime subscription
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [realtimeChannel]);

  // Filter vendors for search
  const filteredVendors = vendors.filter(vendor => 
    searchTerm === "" || 
    vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${vendor.city}, ${vendor.state}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (verificationStatus: string | null) => {
    switch (verificationStatus) {
      case null:
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{verificationStatus || 'Unknown'}</Badge>;
    }
  };

  const VendorCard = ({ vendor }: { vendor: Vendor }) => {
    const contactInfo = typeof vendor.contact_info === 'string' 
      ? JSON.parse(vendor.contact_info) 
      : vendor.contact_info;

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{vendor.business_name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {vendor.category} • {vendor.city}, {vendor.state}
              </p>
            </div>
            {getStatusBadge(vendor.verification_status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm">{vendor.description}</p>
            
            <div className="flex gap-2 text-sm">
              <span className="font-medium">Contact:</span>
              <span>{contactInfo?.email} • {contactInfo?.phone}</span>
            </div>

            {contactInfo?.website && (
              <div className="flex gap-2 text-sm">
                <span className="font-medium">Website:</span>
                <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {contactInfo.website}
                </a>
              </div>
            )}

            {vendor.images && vendor.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {vendor.images.slice(0, 3).map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`${vendor.business_name} ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
                {vendor.images.length > 3 && (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                    +{vendor.images.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500">
              Submitted: {new Date(vendor.created_at).toLocaleDateString()}
            </div>

            {(!vendor.verification_status || vendor.verification_status === 'pending') && (
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => updateVendorStatus(vendor.id, 'approved')}
                  disabled={processingId === vendor.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => updateVendorStatus(vendor.id, 'rejected', 'Does not meet guidelines')}
                  disabled={processingId === vendor.id}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingVendors = vendors.filter(v => !v.verification_status || v.verification_status === 'pending');
  const approvedVendors = vendors.filter(v => v.verification_status === 'verified');
  const rejectedVendors = vendors.filter(v => v.verification_status === 'rejected');

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <div>Checking admin access...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <div className="text-red-500">Access Denied</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="container mx-auto py-8">
          <div className="text-center">Loading vendors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Admin Panel - Vendor Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <><Wifi className="w-4 h-4 text-green-500" /><span className="text-sm text-green-600">Connected</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">Disconnected</span></>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="relative">
                <Bell className="w-5 h-5 text-blue-500" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                  {notifications.length}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pending">
              Pending ({pendingVendors.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedVendors.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedVendors.length})
            </TabsTrigger>
            <TabsTrigger value="testing">
              <Monitor className="w-4 h-4 mr-1" />
              Vendor Testing
            </TabsTrigger>
            <TabsTrigger value="dashboards">
              Vendor Dashboards
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {pendingVendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending vendors to review
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            {approvedVendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No approved vendors
              </div>
            ) : (
              <div className="space-y-4">
                {approvedVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            {rejectedVendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rejected vendors
              </div>
            ) : (
              <div className="space-y-4">
                {rejectedVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testing" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Vendor Experience Testing</h2>
              <p className="text-gray-600">Test any vendor's dashboard experience as if you were that vendor</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Vendor Selection Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Vendor</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {filteredVendors.slice(0, 50).map(vendor => (
                        <div
                          key={vendor.id}
                          className={`p-3 cursor-pointer transition-colors border-b hover:bg-gray-50 ${
                            selectedVendorId === vendor.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setSelectedVendorId(vendor.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {vendor.business_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {vendor.category}
                              </p>
                              <p className="text-xs text-gray-400">
                                {vendor.city}, {vendor.state}
                              </p>
                            </div>
                            <div className="ml-2">
                              {getStatusBadge(vendor.verification_status)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredVendors.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No vendors found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedVendorId && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Testing Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`/vendor/${selectedVendorId}`, '_blank')}
                      >
                        <User className="w-4 h-4 mr-2" />
                        View Public Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(`/vendor-dashboard?vendorId=${selectedVendorId}`, '_blank')}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Embedded Dashboard */}
              <div className="lg:col-span-3">
                {selectedVendorId ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Vendor Dashboard Preview - {vendors.find(v => v.id === selectedVendorId)?.business_name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          Admin Testing Mode
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                        <VendorDashboard vendorId={selectedVendorId} />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Select a Vendor to Test
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                          Choose a vendor from the list on the left to see their dashboard experience
                          and test all features as if you were that vendor.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Real-time Activity Feed */}
            {notifications.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                    <Badge className="bg-blue-100 text-blue-800">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 10).map(notification => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'info' ? 'bg-blue-500' :
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dashboards" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Vendor Dashboard Access</h2>
              <p className="text-gray-600">Access and view any vendor's dashboard and analytics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedVendors.slice(0, 20).map(vendor => (
                <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{vendor.business_name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {vendor.category} • {vendor.city}, {vendor.state}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => window.open(`/vendor-dashboard?vendorId=${vendor.id}`, '_blank')}
                        className="flex-1"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/vendor/${vendor.id}`, '_blank')}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Public Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {approvedVendors.length > 20 && (
              <div className="text-center mt-6">
                <p className="text-gray-500">
                  Showing first 20 vendors. Total approved vendors: {approvedVendors.length}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Platform Analytics</h2>
              <p className="text-gray-600">Overview of platform-wide vendor metrics and statistics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vendors.length}</div>
                  <p className="text-xs text-muted-foreground">All registered vendors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingVendors.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Vendors</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{approvedVendors.length}</div>
                  <p className="text-xs text-muted-foreground">Active on platform</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vendors.length > 0 ? Math.round((approvedVendors.length / vendors.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Overall approval rate</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      vendors.reduce((acc, vendor) => {
                        acc[vendor.category] = (acc[vendor.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between">
                        <span className="text-sm">{category}</span>
                        <span className="text-sm font-medium">{count} vendors</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vendors
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 5)
                      .map(vendor => (
                        <div key={vendor.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{vendor.business_name}</p>
                            <p className="text-xs text-gray-500">{vendor.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(vendor.created_at).toLocaleDateString()}
                            </p>
                            {getStatusBadge(vendor.verification_status)}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

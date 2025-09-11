import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/MainNav";
import { CheckCircle, XCircle, Clock, Eye, Shield, BarChart3, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vendor } from "@/integrations/supabase/types";

interface ExtendedVendor extends Vendor {
  display_status: 'pending' | 'approved' | 'rejected';
}

export default function AdminPanel() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const ADMIN_EMAILS = ["abrar@amarosystems.com", "abraraslam139@gmail.com"];

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to access this page",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      if (!ADMIN_EMAILS.includes(user.email || '')) {
        toast({
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
      toast({
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
      toast({
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

      toast({
        title: "Success",
        description: `Vendor ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast({
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
    }
  }, [isAuthorized]);

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
        <div className="flex items-center gap-3 mb-6">
          <Eye className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Admin Panel - Vendor Management</h1>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">
              Pending ({pendingVendors.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedVendors.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedVendors.length})
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

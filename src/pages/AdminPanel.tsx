import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/MainNav";
import { CheckCircle, XCircle, Clock, Eye, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Vendor {
  id: string;
  business_name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  contact_info: any;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  owner_id: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const ADMIN_EMAIL = "abrar@amarosystems.com";

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

      if (user.email !== ADMIN_EMAIL) {
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
      
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('id', vendorId);

      if (error) throw error;

      // Log the admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('vendor_admin_actions')
          .insert({
            vendor_id: vendorId,
            admin_id: user.id,
            action: status === 'approved' ? 'approve' : 'reject',
            reason
          });

        // Send notification about status change
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor) {
          await supabase
            .from('admin_notification_queue')
            .insert({
              notification_type: 'vendor_status_change',
              data: {
                business_name: vendor.business_name,
                status: status,
                admin_email: user.email,
                vendor_id: vendorId
              }
            });
        }
      }

      // Update local state
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, status } : v
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
            {getStatusBadge(vendor.status)}
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

            {vendor.status === 'pending' && (
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

  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const approvedVendors = vendors.filter(v => v.status === 'approved');
  const rejectedVendors = vendors.filter(v => v.status === 'rejected');

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingVendors.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedVendors.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedVendors.length})
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
        </Tabs>
      </div>
    </div>
  );
}
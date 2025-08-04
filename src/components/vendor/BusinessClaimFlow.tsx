import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Upload,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Vendor, ClaimStatus } from '@/integrations/supabase/types';

interface BusinessClaimFlowProps {
  onClaimSubmitted?: (claimId: string) => void;
}

interface SearchResult extends Vendor {
  distance?: number;
}

const BusinessClaimFlow: React.FC<BusinessClaimFlowProps> = ({ onClaimSubmitted }) => {
  const [step, setStep] = useState<'search' | 'select' | 'verify' | 'submitted'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState({
    claimantName: '',
    claimantEmail: '',
    verificationMethod: 'website',
    websiteUrl: '',
    businessLicense: null as File | null,
    additionalNotes: ''
  });

  const searchBusinesses = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a business name to search');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor-claim-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search-businesses',
          searchTerm: searchTerm.trim()
        })
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data.businesses || []);
      
      if (data.businesses?.length === 0) {
        toast.info('No unclaimed businesses found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search businesses');
    } finally {
      setLoading(false);
    }
  };

  const selectBusiness = (business: SearchResult) => {
    setSelectedBusiness(business);
    setStep('select');
  };

  const proceedToVerification = () => {
    if (!claimData.claimantName || !claimData.claimantEmail) {
      toast.error('Please fill in your name and email');
      return;
    }
    setStep('verify');
  };

  const submitClaim = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      const claimPayload = {
        action: 'submit-claim',
        vendorId: selectedBusiness.id,
        claimantEmail: claimData.claimantEmail,
        claimantName: claimData.claimantName,
        verificationMethod: claimData.verificationMethod,
        documents: claimData.businessLicense ? [{
          type: 'business_license',
          filename: claimData.businessLicense.name,
          size: claimData.businessLicense.size
        }] : []
      };

      const response = await fetch('/api/vendor-claim-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimPayload)
      });

      if (!response.ok) throw new Error('Failed to submit claim');
      
      const data = await response.json();
      
      toast.success('Claim submitted successfully! We\'ll review it within 2-3 business days.');
      setStep('submitted');
      onClaimSubmitted?.(data.claimId);
    } catch (error) {
      console.error('Claim submission error:', error);
      toast.error('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getClaimStatusBadge = (status: string) => {
    const statusConfig = {
      unclaimed: { color: 'bg-green-100 text-green-800', text: 'Available to Claim' },
      pending_claim: { color: 'bg-yellow-100 text-yellow-800', text: 'Claim Pending' },
      claimed: { color: 'bg-gray-100 text-gray-800', text: 'Already Claimed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unclaimed;
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  if (step === 'submitted') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Claim Submitted Successfully!</CardTitle>
          <CardDescription>
            We've received your claim for {selectedBusiness?.business_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Our team will review your claim within 2-3 business days
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                You'll receive an email update on your claim status
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Once approved, you'll get access to your vendor dashboard
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <Button onClick={() => {
              setStep('search');
              setSelectedBusiness(null);
              setSearchResults([]);
              setSearchTerm('');
            }}>
              Claim Another Business
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center ${step === 'search' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="ml-2 font-medium">Search</span>
        </div>
        <div className="w-8 h-px bg-gray-300"></div>
        <div className={`flex items-center ${step === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Select</span>
        </div>
        <div className="w-8 h-px bg-gray-300"></div>
        <div className={`flex items-center ${step === 'verify' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'verify' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <span className="ml-2 font-medium">Verify</span>
        </div>
      </div>

      {step === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Find Your Business</CardTitle>
            <CardDescription>
              Search for your business in our directory to claim it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchBusinesses()}
                className="flex-1"
              />
              <Button onClick={searchBusinesses} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="font-semibold">Search Results</h3>
                {searchResults.map((business) => (
                  <div
                    key={business.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectBusiness(business)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <h4 className="font-semibold">{business.business_name}</h4>
                          {getClaimStatusBadge(business.claim_status || 'unclaimed')}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {business.city}, {business.state}
                          </div>
                          <Badge variant="outline">{business.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {business.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'select' && selectedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle>Claim This Business</CardTitle>
            <CardDescription>
              Confirm this is your business and provide your contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Business Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{selectedBusiness.business_name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {selectedBusiness.city}, {selectedBusiness.state}
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  {selectedBusiness.category}
                </div>
              </div>
            </div>

            {/* Claimant Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="claimantName">Full Name *</Label>
                  <Input
                    id="claimantName"
                    value={claimData.claimantName}
                    onChange={(e) => setClaimData(prev => ({ ...prev, claimantName: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="claimantEmail">Email Address *</Label>
                  <Input
                    id="claimantEmail"
                    type="email"
                    value={claimData.claimantEmail}
                    onChange={(e) => setClaimData(prev => ({ ...prev, claimantEmail: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('search')}>
                Back to Search
              </Button>
              <Button onClick={proceedToVerification}>
                Continue to Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'verify' && selectedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Ownership</CardTitle>
            <CardDescription>
              Help us verify that you own or represent this business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Verification Method */}
            <div>
              <Label className="text-base font-semibold">Verification Method</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    claimData.verificationMethod === 'website' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setClaimData(prev => ({ ...prev, verificationMethod: 'website' }))}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">Website Verification</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add a verification code to your business website
                  </p>
                </div>
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    claimData.verificationMethod === 'document' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setClaimData(prev => ({ ...prev, verificationMethod: 'document' }))}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Document Upload</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload business license or official documents
                  </p>
                </div>
              </div>
            </div>

            {/* Website URL */}
            {claimData.verificationMethod === 'website' && (
              <div>
                <Label htmlFor="websiteUrl">Business Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={claimData.websiteUrl}
                  onChange={(e) => setClaimData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://yourbusiness.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll provide a verification code to add to your website
                </p>
              </div>
            )}

            {/* Document Upload */}
            {claimData.verificationMethod === 'document' && (
              <div>
                <Label htmlFor="businessLicense">Business License or Official Document</Label>
                <Input
                  id="businessLicense"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setClaimData(prev => ({ 
                    ...prev, 
                    businessLicense: e.target.files?.[0] || null 
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG (max 5MB)
                </p>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <Label htmlFor="additionalNotes">Additional Information (Optional)</Label>
              <Textarea
                id="additionalNotes"
                value={claimData.additionalNotes}
                onChange={(e) => setClaimData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any additional information that might help verify your ownership..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={submitClaim} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessClaimFlow;

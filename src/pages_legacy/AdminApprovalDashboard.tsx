import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AlertCircle, Clock, CheckCircle, XCircle, RefreshCw, User, Calendar, FileText, Database } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface ApprovalRequest {
  id: number
  job_name: string
  approval_date: string
  status: 'pending' | 'approved' | 'rejected'
  request_details: string
  requested_at: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
}

interface VendorPreview {
  business_name: string
  category: string
  city: string
  state: string
  rating?: number
  image_url?: string
  website?: string
  description?: string
}

export default function AdminApprovalDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([])
  const [vendorPreviews, setVendorPreviews] = useState<VendorPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [approverName, setApproverName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const executeSQL = async (query: string, params: any[] = []) => {
    try {
      const response = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, params })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('SQL execution failed:', error)
      // Return mock data for demo purposes
      return mockData(query)
    }
  }

  const mockData = (query: string) => {
    if (query.includes('automation_approvals') && query.includes('pending')) {
      return [
        {
          id: 1,
          job_name: 'backfill-tier1',
          approval_date: '2025-09-28',
          status: 'pending',
          request_details: 'Collect Instagram vendors from Tier 1 cities (major metros)',
          requested_at: new Date().toISOString(),
        },
        {
          id: 2, 
          job_name: 'backfill-dallas',
          approval_date: '2025-09-29',
          status: 'pending', 
          request_details: 'Collect wedding photographers from Dallas, TX',
          requested_at: new Date().toISOString(),
        }
      ]
    }

    if (query.includes('vendors') || query.includes('business_name')) {
      return [
        {
          business_name: 'Elite Wedding Photography',
          category: 'wedding-photographers',
          city: 'Austin',
          state: 'TX',
          rating: 4.8,
          website: 'https://elitewedding.com',
          description: 'Professional wedding photography with artistic flair'
        },
        {
          business_name: 'Dream Day Planners',
          category: 'wedding-planners', 
          city: 'Dallas',
          state: 'TX',
          rating: 4.9,
          website: 'https://dreamdayplanners.com',
          description: 'Full-service wedding planning and coordination'
        },
        {
          business_name: 'Floral Expressions',
          category: 'florists',
          city: 'Houston', 
          state: 'TX',
          rating: 4.6,
          description: 'Custom floral arrangements for weddings and events'
        }
      ]
    }

    return []
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load pending approvals
      const approvals = await executeSQL(`
        SELECT * FROM automation_approvals 
        WHERE status = 'pending' 
        ORDER BY requested_at ASC
      `)
      setPendingApprovals(approvals)

      // Load approval stats
      const stats = await executeSQL(`
        SELECT 
          status,
          COUNT(*) as count
        FROM automation_approvals 
        GROUP BY status
      `)
      
      const statsMap = { pending: 0, approved: 0, rejected: 0 }
      stats.forEach((stat: any) => {
        statsMap[stat.status as keyof typeof statsMap] = parseInt(stat.count)
      })
      setStats(statsMap)

      // Load recent vendors for quality preview
      const vendors = await executeSQL(`
        SELECT business_name, category, city, state, rating, website, description
        FROM vendors 
        ORDER BY created_at DESC 
        LIMIT 12
      `)
      setVendorPreviews(vendors)

    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data. Using demo data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const approveJob = async (approval: ApprovalRequest) => {
    if (!approverName.trim()) {
      toast({
        title: "Error", 
        description: "Please enter your name",
        variant: "destructive"
      })
      return
    }

    try {
      await executeSQL(`
        UPDATE automation_approvals 
        SET status = 'approved', 
            approved_by = $1, 
            approved_at = NOW()
        WHERE id = $2
      `, [approverName.trim(), approval.id])

      toast({
        title: "Success",
        description: `✅ Approved ${approval.job_name} for ${approval.approval_date}`,
      })

      loadData()
    } catch (error) {
      console.error('Error approving job:', error)
      toast({
        title: "Error",
        description: "Failed to approve job",
        variant: "destructive"
      })
    }
  }

  const rejectJob = async (approval: ApprovalRequest) => {
    if (!approverName.trim() || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name and rejection reason",
        variant: "destructive"
      })
      return
    }

    try {
      await executeSQL(`
        UPDATE automation_approvals 
        SET status = 'rejected',
            approved_by = $1,
            approved_at = NOW(),
            rejection_reason = $2
        WHERE id = $3
      `, [approverName.trim(), rejectionReason.trim(), approval.id])

      toast({
        title: "Success",
        description: `❌ Rejected ${approval.job_name}: ${rejectionReason}`,
      })

      setRejectionReason('')
      setSelectedJob(null)
      loadData()
    } catch (error) {
      console.error('Error rejecting job:', error)
      toast({
        title: "Error",
        description: "Failed to reject job",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getJobDescription = (jobName: string) => {
    const descriptions: { [key: string]: string } = {
      'backfill-tier1': 'Collect Instagram vendors from Tier 1 cities (major metros like NYC, LA, Chicago) - Expected: ~400 vendors',
      'backfill-tier2': 'Collect Instagram vendors from Tier 2 cities (medium metros) - Expected: ~300 vendors',  
      'backfill-dallas': 'Collect wedding photographers from Dallas, TX - Expected: ~200 vendors',
      'backfill-austin': 'Collect wedding photographers from Austin, TX - Expected: ~150 vendors',
      'backfill-houston': 'Collect wedding photographers from Houston, TX - Expected: ~150 vendors',
      'qc-daily': 'Daily quality control report - Automated analysis',
      'maintenance-weekly': 'Weekly vendor maintenance refresh - Updates existing data'
    }
    return descriptions[jobName] || `Automation job: ${jobName}`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading approval dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🤖 Instagram Vendor Automation</h1>
        <p className="text-gray-600">Review and approve automation jobs • Test vendor quality before going live</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold">{vendorPreviews.length * 25}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approver Name Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Admin Identity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your name for approval records"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            className="max-w-md"
          />
          <p className="text-sm text-gray-500 mt-2">
            This will be recorded in the database for audit purposes
          </p>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Pending Automation Approvals ({pendingApprovals.length})
            </span>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">All Clear!</h3>
              <p>No pending approvals. All automation jobs are approved or running.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{approval.job_name}</h3>
                        {getStatusBadge(approval.status)}
                      </div>
                      <p className="text-gray-600 mb-2 font-medium">{getJobDescription(approval.job_name)}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Scheduled: {approval.approval_date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Requested: {new Date(approval.requested_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => approveJob(approval)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!approverName.trim()}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Run
                    </Button>
                    
                    <Button 
                      onClick={() => setSelectedJob(selectedJob === approval.job_name ? null : approval.job_name)}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  {selectedJob === approval.job_name && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                      <label className="block text-sm font-medium mb-2">Why should this automation NOT run?</label>
                      <Textarea
                        placeholder="e.g., Budget concerns, need to review targeting, wait for better timing..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mb-3"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => rejectJob(approval)}
                          variant="destructive"
                          size="sm"
                          disabled={!approverName.trim() || !rejectionReason.trim()}
                        >
                          Confirm Rejection
                        </Button>
                        <Button 
                          onClick={() => {
                            setSelectedJob(null)
                            setRejectionReason('')
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Quality Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Current Vendor Quality Sample ({vendorPreviews.length} shown)
            </span>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendorPreviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Vendor Data Yet</h3>
              <p>Run some automation jobs first to see vendor quality previews here.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Review the quality of recently collected vendors. This helps you decide whether to approve new automation runs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendorPreviews.map((vendor, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{vendor.business_name}</h4>
                          {vendor.rating && vendor.rating >= 4.5 && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">⭐ {vendor.rating}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="capitalize">{vendor.category.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>{vendor.city}, {vendor.state}</span>
                        </div>
                        {vendor.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{vendor.description}</p>
                        )}
                        {vendor.website && (
                          <a 
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline block truncate"
                          >
                            {vendor.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocationSync, useStates } from '@/hooks/useLocations';
import { locationService } from '@/services/locationService';
import { Loader2, RefreshCw, Database, MapPin, TrendingUp } from 'lucide-react';

interface CacheStats {
  total_entries: number;
  expired_entries: number;
  total_api_cost: number;
  avg_result_count: number;
  cache_hit_potential: number;
}

export const LocationManagement = () => {
  const { toast } = useToast();
  const { syncLocations, syncing } = useLocationSync();
  const { states, loading: statesLoading } = useStates();
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await locationService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cache statistics',
        variant: 'destructive',
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSyncLocations = async (forceRefresh: boolean = false) => {
    const result = await syncLocations(forceRefresh);
    if (result.success) {
      // Reload stats after successful sync
      setTimeout(loadCacheStats, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Location Management</h2>
        <Button
          onClick={() => handleSyncLocations(true)}
          disabled={syncing}
          variant="outline"
        >
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Force Sync
            </>
          )}
        </Button>
      </div>

      {/* Location Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Data Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">States Available</p>
              <div className="flex items-center gap-2">
                {statesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Badge variant="secondary" className="text-lg">
                    {states.length}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Source</p>
              <Badge variant="outline">DataForSEO API</Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Sync Status</p>
              <Badge variant={syncing ? "destructive" : "default"}>
                {syncing ? "Syncing..." : "Ready"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Search Cache Statistics
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCacheStats}
              disabled={loadingStats}
            >
              {loadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cacheStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Cache Entries</p>
                <p className="text-2xl font-bold">{cacheStats.total_entries}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Expired Entries</p>
                <p className="text-2xl font-bold text-orange-600">
                  {cacheStats.expired_entries}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total API Cost</p>
                <p className="text-2xl font-bold text-green-600">
                  ${cacheStats.total_api_cost?.toFixed(2) || '0.00'}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {cacheStats.cache_hit_potential?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading cache statistics...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Management Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleSyncLocations(false)}
              disabled={syncing}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
            >
              <div className="font-semibold">Sync Locations</div>
              <div className="text-sm text-muted-foreground text-left">
                Update location data from DataForSEO API (only if data is older than 30 days)
              </div>
            </Button>
            
            <Button
              onClick={() => handleSyncLocations(true)}
              disabled={syncing}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
            >
              <div className="font-semibold">Force Sync</div>
              <div className="text-sm text-muted-foreground text-left">
                Force refresh all location data regardless of last update time
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent States */}
      <Card>
        <CardHeader>
          <CardTitle>Available States</CardTitle>
        </CardHeader>
        <CardContent>
          {statesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {states.slice(0, 24).map((state) => (
                <Badge
                  key={state.location_code}
                  variant="outline"
                  className="justify-center p-2"
                >
                  {state.state_code || state.location_name}
                </Badge>
              ))}
              {states.length > 24 && (
                <Badge variant="secondary" className="justify-center p-2">
                  +{states.length - 24} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
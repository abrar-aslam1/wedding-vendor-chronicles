import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { VendorCard } from '@/components/search/VendorCard';
import { MatchBadge, MatchScoreBreakdown } from '@/components/cultural/MatchBadge';
import { MatchExplanation } from '@/components/cultural/MatchExplanation';
import { useCulturalMatches } from '@/hooks/useCulturalMatches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Heart, 
  ArrowLeft, 
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const CulturalMatchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preferenceId = searchParams.get('preference_id');
  
  const { matches, loading, error, refetch } = useCulturalMatches(preferenceId);

  useEffect(() => {
    if (!preferenceId) {
      // Redirect to quiz if no preference ID
      navigate('/cultural-matching-quiz');
    }
  }, [preferenceId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <SEOHead
          customTitle="Loading Your Matches | Cultural Wedding Vendor Matching"
          customDescription="Finding vendors who match your cultural needs..."
        />
        <MainNav />
        
        <div className="container mx-auto px-4 py-12 mt-16">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <MainNav />
        
        <div className="container mx-auto px-4 py-12 mt-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => navigate('/cultural-matching-quiz')}>
                Retake Quiz
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  const topMatch = matches[0];
  const excellentMatches = matches.filter(m => m.match_score.weighted_score >= 90);
  const goodMatches = matches.filter(m => m.match_score.weighted_score >= 70 && m.match_score.weighted_score < 90);
  const fairMatches = matches.filter(m => m.match_score.weighted_score < 70);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SEOHead
        customTitle={`Found ${matches.length} Culturally-Matched Vendors | Your Perfect Matches`}
        customDescription={`Discover ${matches.length} wedding vendors who understand your cultural traditions and speak your language. Personalized matches based on your preferences.`}
      />
      <MainNav />
      
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/cultural-matching-quiz')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Button>

            <div className="text-center mb-6">
              <Badge className="mb-4 bg-gradient-to-r from-wedding-primary to-purple-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Your Cultural Matches
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                We Found {matches.length} Perfect {matches.length === 1 ? 'Match' : 'Matches'}! 🎉
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                These vendors understand your cultural traditions and can make your special day authentic and memorable
              </p>
            </div>

            {/* Match Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-800">{excellentMatches.length}</div>
                  <div className="text-sm text-green-600">Excellent Matches (90%+)</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-800">{goodMatches.length}</div>
                  <div className="text-sm text-blue-600">Good Matches (70-89%)</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-800">{matches.length}</div>
                  <div className="text-sm text-purple-600">Total Matches Found</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Match Spotlight */}
          {topMatch && (
            <Card className="mb-8 border-4 border-wedding-primary bg-gradient-to-br from-white to-pink-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2 bg-wedding-primary">🏆 Your Top Match</Badge>
                    <CardTitle className="text-2xl">
                      {topMatch.vendor?.business_name || 'Top Vendor'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {topMatch.vendor?.category} • {topMatch.vendor?.city}, {topMatch.vendor?.state}
                    </CardDescription>
                  </div>
                  <MatchBadge score={topMatch.match_score.weighted_score} size="lg" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <MatchScoreBreakdown
                  culturalScore={topMatch.match_score.cultural_match_score}
                  languageScore={topMatch.match_score.language_match_score}
                  ceremonyScore={topMatch.match_score.ceremony_match_score}
                  styleScore={topMatch.match_score.style_match_score}
                />
                
                <MatchExplanation
                  strongMatches={topMatch.explanation.strong_matches}
                  matchReasons={topMatch.explanation.match_reasons}
                  potentialConcerns={topMatch.explanation.potential_concerns}
                />

                <div className="flex gap-3">
                  <Button 
                    asChild 
                    className="flex-1"
                  >
                    <Link to={`/vendor/${topMatch.vendor?.id}`}>
                      View Full Profile
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save Vendor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Matches - Tabbed View */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">
                All ({matches.length})
              </TabsTrigger>
              <TabsTrigger value="excellent">
                Excellent ({excellentMatches.length})
              </TabsTrigger>
              <TabsTrigger value="good">
                Good ({goodMatches.length})
              </TabsTrigger>
              <TabsTrigger value="fair">
                Fair ({fairMatches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {matches.map((match, index) => (
                <Card key={match.vendor?.id || index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Vendor Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {match.vendor?.business_name || 'Vendor'}
                            </h3>
                            <p className="text-gray-600">
                              {match.vendor?.category} • {match.vendor?.city}, {match.vendor?.state}
                            </p>
                          </div>
                          <MatchBadge score={match.match_score.weighted_score} />
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {match.vendor?.description || 'Professional wedding vendor'}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-sm">
                            <span className="font-medium">Cultural Fit:</span>{' '}
                            <span className="text-gray-600">{match.match_score.cultural_match_score}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Language:</span>{' '}
                            <span className="text-gray-600">{match.match_score.language_match_score}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Ceremony Experience:</span>{' '}
                            <span className="text-gray-600">{match.match_score.ceremony_match_score}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Style Match:</span>{' '}
                            <span className="text-gray-600">{match.match_score.style_match_score}%</span>
                          </div>
                        </div>

                        {(match.explanation.strong_matches.length > 0 || match.explanation.match_reasons.length > 0) && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold mb-2 text-sm">Why this match:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {match.explanation.strong_matches.slice(0, 2).map((reason, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-green-600">✓</span>
                                  {reason}
                                </li>
                              ))}
                              {match.explanation.match_reasons.slice(0, 1).map((reason, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button asChild variant="default" size="sm">
                            <Link to={`/vendor/${match.vendor?.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="excellent" className="space-y-6">
              {excellentMatches.length > 0 ? (
                excellentMatches.map((match, index) => (
                  <Card key={match.vendor?.id || index}>
                    {/* Same card content as above */}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{match.vendor?.business_name}</h3>
                          <p className="text-gray-600">{match.vendor?.category}</p>
                        </div>
                        <MatchBadge score={match.match_score.weighted_score} />
                      </div>
                      <Button asChild>
                        <Link to={`/vendor/${match.vendor?.id}`}>View Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No excellent matches found. Check out the good matches!
                </div>
              )}
            </TabsContent>

            <TabsContent value="good" className="space-y-6">
              {goodMatches.length > 0 ? (
                goodMatches.map((match, index) => (
                  <Card key={match.vendor?.id || index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{match.vendor?.business_name}</h3>
                          <p className="text-gray-600">{match.vendor?.category}</p>
                        </div>
                        <MatchBadge score={match.match_score.weighted_score} />
                      </div>
                      <Button asChild>
                        <Link to={`/vendor/${match.vendor?.id}`}>View Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No good matches in this range.
                </div>
              )}
            </TabsContent>

            <TabsContent value="fair" className="space-y-6">
              {fairMatches.length > 0 ? (
                fairMatches.map((match, index) => (
                  <Card key={match.vendor?.id || index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{match.vendor?.business_name}</h3>
                          <p className="text-gray-600">{match.vendor?.category}</p>
                        </div>
                        <MatchBadge score={match.match_score.weighted_score} />
                      </div>
                      <Button asChild>
                        <Link to={`/vendor/${match.vendor?.id}`}>View Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No fair matches found.
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-r from-wedding-primary to-purple-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Want More Matches?</h2>
              <p className="mb-6 text-white/90">
                Retake the quiz with different preferences or browse all vendors
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="secondary" asChild>
                  <Link to="/cultural-matching-quiz">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white text-wedding-primary hover:bg-gray-50" asChild>
                  <Link to="/search">
                    Browse All Vendors
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CulturalMatchResults;

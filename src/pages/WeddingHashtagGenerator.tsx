import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Copy, Heart, Calendar, MapPin, Sparkles, Users, Award } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import HashtagBreadcrumbs from "@/components/hashtag/HashtagBreadcrumbs";
import HashtagSchemaMarkup from "@/components/hashtag/HashtagSchemaMarkup";
import HashtagFAQ from "@/components/hashtag/HashtagFAQ";
import LocationContent from "@/components/hashtag/LocationContent";
import { generateLocationHashtags } from "@/config/hashtag-locations";

// Type for form inputs
interface HashtagFormInputs {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  weddingLocation: string;
  weddingTheme: string;
}

// Type for generated hashtag
interface GeneratedHashtag {
  text: string;
  category: string;
}

export const WeddingHashtagGenerator = () => {
  // Get state and city from URL params
  const { state: stateSlug, city: citySlug } = useParams<{ state?: string; city?: string }>();
  
  const [formInputs, setFormInputs] = useState<HashtagFormInputs>({
    partner1Name: "",
    partner2Name: "",
    weddingDate: "",
    weddingLocation: "",
    weddingTheme: "",
  });
  
  const [generatedHashtags, setGeneratedHashtags] = useState<GeneratedHashtag[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Determine if we're on a location-specific page
  const isLocationPage = Boolean(stateSlug);
  
  // Generate canonical URL
  const canonicalUrl = stateSlug && citySlug
    ? `${window.location.origin}/tools/wedding-hashtag-generator/states/${stateSlug}/${citySlug}`
    : stateSlug
      ? `${window.location.origin}/tools/wedding-hashtag-generator/states/${stateSlug}`
      : `${window.location.origin}/tools/wedding-hashtag-generator`;

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formInputs.partner1Name.trim()) {
      newErrors.partner1Name = "Partner 1's name is required";
    }
    
    if (!formInputs.partner2Name.trim()) {
      newErrors.partner2Name = "Partner 2's name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate hashtags
  const generateHashtags = () => {
    if (!validateForm()) {
      return;
    }
    
    const hashtags: GeneratedHashtag[] = [];
    
    // Extract first and last names
    const partner1Parts = formInputs.partner1Name.trim().split(" ");
    const partner2Parts = formInputs.partner2Name.trim().split(" ");
    
    const partner1First = partner1Parts[0];
    const partner1Last = partner1Parts[partner1Parts.length - 1];
    
    const partner2First = partner2Parts[0];
    const partner2Last = partner2Parts[partner2Parts.length - 1];
    
    // 1. Name combinations
    hashtags.push({ text: `#${partner1First}And${partner2First}`, category: "Name Combinations" });
    hashtags.push({ text: `#${partner1First}Weds${partner2First}`, category: "Name Combinations" });
    hashtags.push({ text: `#${partner1First}Marries${partner2First}`, category: "Name Combinations" });
    hashtags.push({ text: `#${partner1First}Plus${partner2First}`, category: "Name Combinations" });
    
    // 2. Last name options
    if (partner1Last === partner2Last) {
      hashtags.push({ text: `#The${partner1Last}s`, category: "Last Name Options" });
      hashtags.push({ text: `#${partner1Last}Wedding`, category: "Last Name Options" });
      hashtags.push({ text: `#${partner1Last}PartyOf2`, category: "Last Name Options" });
    } else {
      hashtags.push({ text: `#The${partner1Last}${partner2Last}s`, category: "Last Name Options" });
      hashtags.push({ text: `#${partner1Last}${partner2Last}Wedding`, category: "Last Name Options" });
      hashtags.push({ text: `#${partner1Last}Meets${partner2Last}`, category: "Last Name Options" });
    }
    
    // 3. Creative mashups
    const mashup1 = partner1First.substring(0, Math.ceil(partner1First.length / 2)) + 
                   partner2First.substring(Math.floor(partner2First.length / 2));
    const mashup2 = partner2First.substring(0, Math.ceil(partner2First.length / 2)) + 
                   partner1First.substring(Math.floor(partner1First.length / 2));
    
    hashtags.push({ text: `#${mashup1}Wedding`, category: "Creative Mashups" });
    hashtags.push({ text: `#${mashup2}Wedding`, category: "Creative Mashups" });
    
    // 4. Date-based tags (if provided)
    if (formInputs.weddingDate) {
      const date = new Date(formInputs.weddingDate);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      
      hashtags.push({ text: `#${partner1First}${partner2First}${year}`, category: "Date-Based Tags" });
      hashtags.push({ text: `#${month}Wedding${year}`, category: "Date-Based Tags" });
      hashtags.push({ text: `#${partner1Last}${partner2Last}${year}`, category: "Date-Based Tags" });
    }
    
    // 5. Location-based tags (if provided)
    if (formInputs.weddingLocation) {
      const location = formInputs.weddingLocation.trim();
      const locationNoSpaces = location.replace(/\s+/g, "");
      
      hashtags.push({ text: `#${partner1First}${partner2First}In${locationNoSpaces}`, category: "Location-Based Tags" });
      hashtags.push({ text: `#${locationNoSpaces}Wedding`, category: "Location-Based Tags" });
      hashtags.push({ text: `#${partner1Last}${partner2Last}${locationNoSpaces}`, category: "Location-Based Tags" });
    }
    
    // 6. Theme-based tags (if provided)
    if (formInputs.weddingTheme) {
      const theme = formInputs.weddingTheme.trim();
      const themeNoSpaces = theme.replace(/\s+/g, "");
      
      hashtags.push({ text: `#${themeNoSpaces}${partner1First}${partner2First}`, category: "Theme-Based Tags" });
      hashtags.push({ text: `#${partner1Last}${partner2Last}${themeNoSpaces}Wedding`, category: "Theme-Based Tags" });
    }
    
    // 7. Puns and wordplay
    hashtags.push({ text: `#${partner1First}${partner2First}ForeverAfter`, category: "Puns & Wordplay" });
    hashtags.push({ text: `#${partner1First}Found${partner2First}`, category: "Puns & Wordplay" });
    hashtags.push({ text: `#${partner1First}Said${partner2First}Said`, category: "Puns & Wordplay" });
    hashtags.push({ text: `#${partner1Last}${partner2Last}TieTheKnot`, category: "Puns & Wordplay" });
    hashtags.push({ text: `#HappilyEver${partner1Last}`, category: "Puns & Wordplay" });
    
    // Set the generated hashtags and show results
    setGeneratedHashtags(hashtags);
    setShowResults(true);
    
    toast({
      title: "Hashtags Generated",
      description: `Generated ${hashtags.length} unique hashtag options for your wedding.`,
    });
  };

  // Copy hashtag to clipboard
  const copyToClipboard = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${hashtag} has been copied to your clipboard.`,
      });
    }).catch((err) => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  // Reset form and go back to generator
  const handleReset = () => {
    setShowResults(false);
  };

  // Add location-specific hashtags if we're on a location page
  const generateLocationSpecificHashtags = () => {
    if (stateSlug && citySlug && formInputs.partner1Name && formInputs.partner2Name) {
      const partner1Parts = formInputs.partner1Name.trim().split(" ");
      const partner2Parts = formInputs.partner2Name.trim().split(" ");
      
      const partner1First = partner1Parts[0];
      const partner2First = partner2Parts[0];
      
      const locationTags = generateLocationHashtags(stateSlug, citySlug, partner1First, partner2First);
      
      return locationTags.map(tag => ({
        text: tag,
        category: "Location-Specific Tags"
      }));
    }
    
    return [];
  };
  
  // Combine regular hashtags with location-specific hashtags
  useEffect(() => {
    if (showResults && stateSlug && citySlug) {
      const locationTags = generateLocationSpecificHashtags();
      if (locationTags.length > 0) {
        setGeneratedHashtags(prev => [...prev, ...locationTags]);
      }
    }
  }, [showResults, stateSlug, citySlug]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* SEO Components */}
      <SEOHead 
        isHomePage={false}
        canonicalUrl={canonicalUrl}
        imageUrl="/Screenshot 2025-04-20 at 9.59.36 PM.png"
      />
      
      <HashtagSchemaMarkup 
        stateSlug={stateSlug}
        citySlug={citySlug}
        canonicalUrl={canonicalUrl}
      />
      
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <HashtagBreadcrumbs 
          stateSlug={stateSlug}
          citySlug={citySlug}
          className="mb-6"
        />
        
        {/* Location-specific content or regular content */}
        {isLocationPage ? (
          <>
            <LocationContent 
              stateSlug={stateSlug}
              citySlug={citySlug}
            />
            <HashtagFAQ 
              stateSlug={stateSlug}
              citySlug={citySlug}
              className="mt-12"
            />
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-wedding-primary">Wedding Hashtag Generator: Create Your Perfect Wedding Hashtag</h1>
                <p className="text-gray-600 mt-2">
                  Create unique, personalized hashtags for your wedding in seconds - no sign up required!
                </p>
              </div>
              
              {!showResults && (
                <Link to="/">
                  <Button variant="outline" className="mt-4 md:mt-0">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Benefits Section */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4">Why You Need a Wedding Hashtag</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Collect All Your Memories</h3>
                  <p className="text-gray-600">Easily gather all your wedding photos from guests in one place by using a unique hashtag.</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Increase Guest Engagement</h3>
                  <p className="text-gray-600">Encourage guests to share their experience and participate in your special day.</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Create a Lasting Trend</h3>
                  <p className="text-gray-600">Over 75% of modern weddings now use custom hashtags to create a digital keepsake.</p>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Create Your Custom Wedding Hashtag in 3 Simple Steps</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600 font-bold">1</div>
                  <h3 className="font-semibold mb-2">Enter Your Names</h3>
                  <p className="text-gray-600">Start by entering both partners' names to create personalized hashtag options.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600 font-bold">2</div>
                  <h3 className="font-semibold mb-2">Add Optional Details</h3>
                  <p className="text-gray-600">Include your wedding date, location, or theme for more customized hashtag options.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600 font-bold">3</div>
                  <h3 className="font-semibold mb-2">Choose Your Favorite</h3>
                  <p className="text-gray-600">Browse through the generated options and pick the perfect hashtag for your special day.</p>
                </div>
              </div>
            </div>

            {/* Generator Tool */}
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="generator">Hashtag Generator</TabsTrigger>
                <TabsTrigger value="tips">Hashtag Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generator">
                {!showResults ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-6">Enter Your Details</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="partner1Name" className="text-base">
                            Partner 1's Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="partner1Name"
                            name="partner1Name"
                            placeholder="e.g. John Smith"
                            value={formInputs.partner1Name}
                            onChange={handleInputChange}
                            className={errors.partner1Name ? "border-red-500" : ""}
                          />
                          {errors.partner1Name && (
                            <p className="text-red-500 text-sm">{errors.partner1Name}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="partner2Name" className="text-base">
                            Partner 2's Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="partner2Name"
                            name="partner2Name"
                            placeholder="e.g. Jane Doe"
                            value={formInputs.partner2Name}
                            onChange={handleInputChange}
                            className={errors.partner2Name ? "border-red-500" : ""}
                          />
                          {errors.partner2Name && (
                            <p className="text-red-500 text-sm">{errors.partner2Name}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="weddingDate" className="text-base">
                            Wedding Date (Optional)
                          </Label>
                          <Input
                            id="weddingDate"
                            name="weddingDate"
                            type="date"
                            value={formInputs.weddingDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="weddingLocation" className="text-base">
                            Wedding Location (Optional)
                          </Label>
                          <Input
                            id="weddingLocation"
                            name="weddingLocation"
                            placeholder="e.g. Miami Beach"
                            value={formInputs.weddingLocation}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="weddingTheme" className="text-base">
                          Wedding Theme or Interests (Optional)
                        </Label>
                        <Input
                          id="weddingTheme"
                          name="weddingTheme"
                          placeholder="e.g. Rustic, Beach, Vintage, Travel"
                          value={formInputs.weddingTheme}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <Button 
                        onClick={generateHashtags} 
                        className="w-full md:w-auto"
                        size="lg"
                      >
                        Generate Hashtags
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <h2 className="text-2xl font-semibold text-wedding-text">Your Wedding Hashtags</h2>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="flex items-center gap-2 mt-4 md:mt-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Generator
                      </Button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedHashtags.map((hashtag, index) => (
                          <Card key={index} className="overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-lg font-medium break-all">
                                {hashtag.text}
                              </CardTitle>
                              <CardDescription>{hashtag.category}</CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => copyToClipboard(hashtag.text)}
                              >
                                <Copy className="h-3.5 w-3.5 mr-2" />
                                Copy
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tips">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-6">Wedding Hashtag Tips</h2>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Keep it Short and Memorable</h3>
                        <p className="text-gray-600">
                          The best wedding hashtags are short, sweet, and easy to remember. Aim for something that guests can quickly type without making mistakes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Check if Hashtags are Already in Use</h3>
                        <p className="text-gray-600">
                          Before finalizing your hashtag, search for it on social media platforms to ensure it's not already being used for another wedding or event.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Use CamelCase for Readability</h3>
                        <p className="text-gray-600">
                          Capitalize the first letter of each word in your hashtag (like #JohnAndJane) to make it easier to read.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* FAQ Section */}
            <HashtagFAQ className="mt-12" />
          </>
        )}
      </div>
    </div>
  );
};

export default WeddingHashtagGenerator;

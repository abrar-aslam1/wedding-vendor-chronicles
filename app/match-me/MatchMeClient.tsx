'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Globe, 
  Users, 
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { useBridePreferences } from '@/hooks/useBridePreferences';
import { toast } from 'sonner';
import { buildUrl } from '@/lib/migration-helpers';

const MatchMeClient = () => {
  const router = useRouter();
  const { saving, savePreferences } = useBridePreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    culturalBackground: [] as string[],
    religiousTradition: [] as string[],
    ceremonyTypes: [] as string[],
    languages: [] as string[],
    requiresBilingual: false,
    dietaryRestrictions: [] as string[],
    modestyPreferences: '',
    weddingStyle: [] as string[],
    budgetRange: '',
    weddingDate: null as Date | null,
    location: '',
    guestCount: 100,
    importanceCulturalKnowledge: 5,
    importanceLanguage: 4,
    importanceStyleMatch: 4,
    importancePrice: 5,
  });

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  // Step 1: Cultural Identity
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-wedding-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Tell Us About Your Cultural Heritage</h2>
        <p className="text-gray-600">Select all that apply - we celebrate diversity!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'south_asian_indian', label: '🇮🇳 Indian', desc: 'Hindu, Muslim, Sikh, Christian' },
          { id: 'south_asian_pakistani', label: '🇵🇰 Pakistani', desc: 'Muslim traditions' },
          { id: 'south_asian_bangladeshi', label: '🇧🇩 Bangladeshi', desc: 'Bengali culture' },
          { id: 'muslim', label: '🕌 Muslim/Islamic', desc: 'Nikah, Walima traditions' },
          { id: 'jewish_orthodox', label: '✡️ Jewish (Orthodox)', desc: 'Traditional ceremonies' },
          { id: 'jewish_reform', label: '✡️ Jewish (Reform)', desc: 'Modern traditions' },
          { id: 'chinese', label: '🇨🇳 Chinese', desc: 'Tea ceremony, traditional' },
          { id: 'korean', label: '🇰🇷 Korean', desc: 'Pyebaek ceremony' },
          { id: 'latino', label: '🌎 Latino/Hispanic', desc: 'Latin American traditions' },
          { id: 'african', label: '🌍 African', desc: 'African ceremonies' },
          { id: 'caribbean', label: '🏝️ Caribbean', desc: 'Island traditions' },
          { id: 'fusion', label: '✨ Multicultural Fusion', desc: 'Blending traditions' },
        ].map(option => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              formData.culturalBackground.includes(option.id)
                ? 'border-wedding-primary bg-wedding-primary/5'
                : 'border-gray-200'
            }`}
            onClick={() =>
              setFormData({
                ...formData,
                culturalBackground: toggleArrayItem(formData.culturalBackground, option.id),
              })
            }
          >
            <CardContent className="p-4 flex items-start space-x-3">
              <Checkbox
                checked={formData.culturalBackground.includes(option.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">{option.label}</p>
                <p className="text-sm text-gray-500">{option.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Step 2: Ceremony Types
  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <Sparkles className="w-12 h-12 text-wedding-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Which Ceremonies Are You Planning?</h2>
        <p className="text-gray-600">Select all the events you want to celebrate</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-wedding-primary">
            South Asian Ceremonies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'mehndi', label: 'Mehndi/Henna Night', emoji: '🎨' },
              { id: 'sangeet', label: 'Sangeet (Music & Dance)', emoji: '💃' },
              { id: 'haldi', label: 'Haldi (Turmeric)', emoji: '✨' },
              { id: 'baraat', label: 'Baraat (Groom\'s Procession)', emoji: '🎊' },
            ].map(ceremony => (
              <Card
                key={ceremony.id}
                className={`cursor-pointer transition-all ${
                  formData.ceremonyTypes.includes(ceremony.id)
                    ? 'border-wedding-primary bg-wedding-primary/5'
                    : ''
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    ceremonyTypes: toggleArrayItem(formData.ceremonyTypes, ceremony.id),
                  })
                }
              >
                <CardContent className="p-3 flex items-center space-x-3">
                  <Checkbox checked={formData.ceremonyTypes.includes(ceremony.id)} />
                  <span className="text-2xl">{ceremony.emoji}</span>
                  <span className="font-medium">{ceremony.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-wedding-primary">Muslim Ceremonies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'nikah', label: 'Nikah (Islamic Wedding)', emoji: '🕌' },
              { id: 'walima', label: 'Walima (Reception)', emoji: '🎉' },
            ].map(ceremony => (
              <Card
                key={ceremony.id}
                className={`cursor-pointer transition-all ${
                  formData.ceremonyTypes.includes(ceremony.id)
                    ? 'border-wedding-primary bg-wedding-primary/5'
                    : ''
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    ceremonyTypes: toggleArrayItem(formData.ceremonyTypes, ceremony.id),
                  })
                }
              >
                <CardContent className="p-3 flex items-center space-x-3">
                  <Checkbox checked={formData.ceremonyTypes.includes(ceremony.id)} />
                  <span className="text-2xl">{ceremony.emoji}</span>
                  <span className="font-medium">{ceremony.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-wedding-primary">Jewish Ceremonies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'ketubah', label: 'Ketubah Signing', emoji: '📜' },
              { id: 'chuppah', label: 'Chuppah Ceremony', emoji: '✡️' },
              { id: 'hora', label: 'Hora Dance', emoji: '💫' },
            ].map(ceremony => (
              <Card
                key={ceremony.id}
                className={`cursor-pointer transition-all ${
                  formData.ceremonyTypes.includes(ceremony.id)
                    ? 'border-wedding-primary bg-wedding-primary/5'
                    : ''
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    ceremonyTypes: toggleArrayItem(formData.ceremonyTypes, ceremony.id),
                  })
                }
              >
                <CardContent className="p-3 flex items-center space-x-3">
                  <Checkbox checked={formData.ceremonyTypes.includes(ceremony.id)} />
                  <span className="text-2xl">{ceremony.emoji}</span>
                  <span className="font-medium">{ceremony.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-wedding-primary">Other Ceremonies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'tea_ceremony', label: 'Tea Ceremony (Chinese)', emoji: '🍵' },
              { id: 'pyebaek', label: 'Pyebaek (Korean)', emoji: '🎎' },
            ].map(ceremony => (
              <Card
                key={ceremony.id}
                className={`cursor-pointer transition-all ${
                  formData.ceremonyTypes.includes(ceremony.id)
                    ? 'border-wedding-primary bg-wedding-primary/5'
                    : ''
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    ceremonyTypes: toggleArrayItem(formData.ceremonyTypes, ceremony.id),
                  })
                }
              >
                <CardContent className="p-3 flex items-center space-x-3">
                  <Checkbox checked={formData.ceremonyTypes.includes(ceremony.id)} />
                  <span className="text-2xl">{ceremony.emoji}</span>
                  <span className="font-medium">{ceremony.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Language & Communication
  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <Globe className="w-12 h-12 text-wedding-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Language Preferences</h2>
        <p className="text-gray-600">What languages do you need your vendors to speak?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { id: 'hindi', label: 'Hindi', flag: '🇮🇳' },
          { id: 'urdu', label: 'Urdu', flag: '🇵🇰' },
          { id: 'punjabi', label: 'Punjabi', flag: '🇮🇳' },
          { id: 'gujarati', label: 'Gujarati', flag: '🇮🇳' },
          { id: 'bengali', label: 'Bengali', flag: '🇧🇩' },
          { id: 'tamil', label: 'Tamil', flag: '🇮🇳' },
          { id: 'arabic', label: 'Arabic', flag: '🌍' },
          { id: 'hebrew', label: 'Hebrew', flag: '🇮🇱' },
          { id: 'mandarin', label: 'Mandarin', flag: '🇨🇳' },
          { id: 'cantonese', label: 'Cantonese', flag: '🇨🇳' },
          { id: 'korean', label: 'Korean', flag: '🇰🇷' },
          { id: 'spanish', label: 'Spanish', flag: '🇪🇸' },
        ].map(language => (
          <Card
            key={language.id}
            className={`cursor-pointer transition-all ${
              formData.languages.includes(language.id)
                ? 'border-wedding-primary bg-wedding-primary/5'
                : ''
            }`}
            onClick={() =>
              setFormData({
                ...formData,
                languages: toggleArrayItem(formData.languages, language.id),
              })
            }
          >
            <CardContent className="p-3 flex items-center space-x-2">
              <Checkbox checked={formData.languages.includes(language.id)} />
              <span className="text-xl">{language.flag}</span>
              <span className="font-medium text-sm">{language.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start space-x-3">
          <Checkbox
            checked={formData.requiresBilingual}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, requiresBilingual: checked as boolean })
            }
          />
          <div>
            <Label className="font-semibold">Bilingual vendor is a must-have</Label>
            <p className="text-sm text-gray-600 mt-1">
              Check this if the vendor MUST speak your language
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Cultural Requirements</h3>
        <div className="space-y-3">
          {[
            { id: 'halal', label: 'Halal Catering Required', emoji: '🍽️' },
            { id: 'kosher', label: 'Kosher Catering Required', emoji: '✡️' },
            { id: 'vegetarian', label: 'Vegetarian/Jain Options', emoji: '🌱' },
          ].map(dietary => (
            <Card
              key={dietary.id}
              className={`cursor-pointer transition-all ${
                formData.dietaryRestrictions.includes(dietary.id)
                  ? 'border-wedding-primary bg-wedding-primary/5'
                  : ''
              }`}
              onClick={() =>
                setFormData({
                  ...formData,
                  dietaryRestrictions: toggleArrayItem(formData.dietaryRestrictions, dietary.id),
                })
              }
            >
              <CardContent className="p-3 flex items-center space-x-3">
                <Checkbox checked={formData.dietaryRestrictions.includes(dietary.id)} />
                <span className="text-xl">{dietary.emoji}</span>
                <span className="font-medium">{dietary.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-lg font-semibold mb-3 block">Modesty Preferences</Label>
        <RadioGroup
          value={formData.modestyPreferences}
          onValueChange={(value) => setFormData({ ...formData, modestyPreferences: value })}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="modest_photography" id="modest" />
              <Label htmlFor="modest">Modest Photography (no close-ups, respectful)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gender_separated" id="separated" />
              <Label htmlFor="separated">Gender-Separated Event Management</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">No Special Requirements</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  // Step 4: Style & Budget
  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <Users className="w-12 h-12 text-wedding-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Your Wedding Style & Budget</h2>
        <p className="text-gray-600">Help us find vendors that match your vision</p>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Wedding Style</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'traditional', label: 'Traditional', emoji: '👑' },
            { id: 'modern_fusion', label: 'Modern Fusion', emoji: '✨' },
            { id: 'contemporary', label: 'Contemporary', emoji: '🎨' },
            { id: 'elegant', label: 'Elegant', emoji: '💎' },
            { id: 'bohemian', label: 'Bohemian', emoji: '🌸' },
            { id: 'luxury', label: 'Luxury', emoji: '👰' },
          ].map(style => (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all ${
                formData.weddingStyle.includes(style.id)
                  ? 'border-wedding-primary bg-wedding-primary/5'
                  : ''
              }`}
              onClick={() =>
                setFormData({
                  ...formData,
                  weddingStyle: toggleArrayItem(formData.weddingStyle, style.id),
                })
              }
            >
              <CardContent className="p-3 flex flex-col items-center text-center">
                <Checkbox checked={formData.weddingStyle.includes(style.id)} className="mb-2" />
                <span className="text-3xl mb-1">{style.emoji}</span>
                <span className="font-medium text-sm">{style.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-lg font-semibold mb-3 block">Budget Range</Label>
        <RadioGroup
          value={formData.budgetRange}
          onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
        >
          <div className="space-y-3">
            {[
              { id: 'under_2k', label: 'Under $2,000', desc: 'Budget-friendly' },
              { id: '2k_5k', label: '$2,000 - $5,000', desc: 'Mid-range' },
              { id: '5k_10k', label: '$5,000 - $10,000', desc: 'Premium' },
              { id: '10k_20k', label: '$10,000 - $20,000', desc: 'Luxury' },
              { id: '20k_plus', label: '$20,000+', desc: 'Ultra-luxury' },
            ].map(budget => (
              <Card
                key={budget.id}
                className={`cursor-pointer transition-all ${
                  formData.budgetRange === budget.id ? 'border-wedding-primary bg-wedding-primary/5' : ''
                }`}
                onClick={() => setFormData({ ...formData, budgetRange: budget.id })}
              >
                <CardContent className="p-3 flex items-center space-x-3">
                  <RadioGroupItem value={budget.id} id={budget.id} />
                  <div>
                    <Label htmlFor={budget.id} className="font-semibold cursor-pointer">
                      {budget.label}
                    </Label>
                    <p className="text-sm text-gray-500">{budget.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <Label className="mb-2 block">Wedding Location (City, State)</Label>
          <Input
            placeholder="e.g., Dallas, Texas"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-2 block">Guest Count</Label>
          <Input
            type="number"
            placeholder="e.g., 150"
            value={formData.guestCount}
            onChange={(e) =>
              setFormData({ ...formData, guestCount: parseInt(e.target.value) || 100 })
            }
          />
        </div>
      </div>
    </div>
  );

  // Step 5: Priorities
  const renderStep5 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <CheckCircle2 className="w-12 h-12 text-wedding-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">What Matters Most to You?</h2>
        <p className="text-gray-600">Set your priorities for vendor matching</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-lg font-semibold mb-2 flex justify-between">
            <span>Cultural Knowledge & Experience</span>
            <Badge variant="secondary">{formData.importanceCulturalKnowledge}/5</Badge>
          </Label>
          <Slider
            value={[formData.importanceCulturalKnowledge]}
            onValueChange={([value]) =>
              setFormData({ ...formData, importanceCulturalKnowledge: value })
            }
            max={5}
            min={1}
            step={1}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            How important is it that vendors understand your cultural traditions?
          </p>
        </div>

        <div>
          <Label className="text-lg font-semibold mb-2 flex justify-between">
            <span>Language Communication</span>
            <Badge variant="secondary">{formData.importanceLanguage}/5</Badge>
          </Label>
          <Slider
            value={[formData.importanceLanguage]}
            onValueChange={([value]) => setFormData({ ...formData, importanceLanguage: value })}
            max={5}
            min={1}
            step={1}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            How important is it that vendors speak your language?
          </p>
        </div>

        <div>
          <Label className="text-lg font-semibold mb-2 flex justify-between">
            <span>Style Match</span>
            <Badge variant="secondary">{formData.importanceStyleMatch}/5</Badge>
          </Label>
          <Slider
            value={[formData.importanceStyleMatch]}
            onValueChange={([value]) => setFormData({ ...formData, importanceStyleMatch: value })}
            max={5}
            min={1}
            step={1}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            How important is matching your aesthetic vision?
          </p>
        </div>

        <div>
          <Label className="text-lg font-semibold mb-2 flex justify-between">
            <span>Budget Fit</span>
            <Badge variant="secondary">{formData.importancePrice}/5</Badge>
          </Label>
          <Slider
            value={[formData.importancePrice]}
            onValueChange={([value]) => setFormData({ ...formData, importancePrice: value })}
            max={5}
            min={1}
            step={1}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            How important is staying within your budget?
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-wedding-primary/10 to-purple-100 border-wedding-primary mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center">🎉 You're All Set!</h3>
          <p className="text-center text-gray-700 mb-4">
            Click "Find My Perfect Vendors" to see culturally-matched vendors who understand your
            traditions and speak your language.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4" />
            <span>Free tool • No registration required</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const steps = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  const handleSubmit = async () => {
    // Save preferences to database
    const result = await savePreferences({
      cultural_background: formData.culturalBackground,
      religious_tradition: formData.religiousTradition,
      ceremony_types: formData.ceremonyTypes,
      preferred_languages: formData.languages,
      requires_bilingual: formData.requiresBilingual,
      wedding_style: formData.weddingStyle,
      dietary_restrictions: formData.dietaryRestrictions,
      modesty_preferences: formData.modestyPreferences,
      budget_range: formData.budgetRange,
      wedding_date: formData.weddingDate,
      guest_count: formData.guestCount,
      location: formData.location,
      importance_cultural_knowledge: formData.importanceCulturalKnowledge,
      importance_language: formData.importanceLanguage,
      importance_style_match: formData.importanceStyleMatch,
      importance_price: formData.importancePrice,
      must_have_cultural_experience: formData.importanceCulturalKnowledge >= 4,
      quiz_completed: true
    });

    if (result.success) {
      toast.success('✨ Your preferences have been saved!', {
        description: 'We\'re finding vendors who match your cultural needs.',
      });
      
      // Trigger matching algorithm
      try {
        toast.info('🔍 Finding your perfect matches...', {
          description: 'This may take a moment',
        });
        
        const matchResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-cultural-matches`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ preference_id: result.preferenceId })
          }
        );
        
        if (matchResponse.ok) {
          const matchData = await matchResponse.json();
          toast.success(`🎉 Found ${matchData.matches_found} matching vendors!`, {
            description: 'Showing you the best matches',
          });
        }
      } catch (matchError) {
        console.error('Matching error:', matchError);
        // Don't block navigation if matching fails
        toast.warning('Matches will be calculated shortly');
      }
      
      // Navigate to results page with preference ID
      const resultsUrl = buildUrl('/match-me/results', { 
        preference_id: result.preferenceId 
      });
      router.push(resultsUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SEOHead
        customTitle="Cultural Wedding Vendor Matching Quiz | Find Vendors Who Understand Your Traditions"
        customDescription="Free interactive quiz to find culturally-matched wedding vendors. Whether you're planning a South Asian, Muslim, Jewish, or multicultural wedding, find vendors who speak your language and understand your ceremonies."
      />
      <MainNav />
      
      <div className="container mx-auto px-4 py-12 mt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4" variant="secondary">
            Free Tool
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-wedding-primary to-purple-600 bg-clip-text text-transparent">
            Find Your Perfect Cultural Match
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Answer 5 quick questions and we'll match you with vendors who understand your cultural
            traditions and speak your language
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-6 md:p-8">{steps[currentStep]()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="min-w-[120px]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps - 1 ? (
              <Button onClick={handleNext} className="min-w-[120px]">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="min-w-[200px] bg-gradient-to-r from-wedding-primary to-purple-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Find My Perfect Vendors
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="w-10 h-10 text-wedding-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Culturally Competent</h3>
              <p className="text-sm text-gray-600">
                Find vendors who understand your traditions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Globe className="w-10 h-10 text-wedding-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Language Match</h3>
              <p className="text-sm text-gray-600">
                Connect with vendors who speak your language
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Sparkles className="w-10 h-10 text-wedding-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Matching</h3>
              <p className="text-sm text-gray-600">
                AI-powered matching for your perfect vendors
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MatchMeClient;

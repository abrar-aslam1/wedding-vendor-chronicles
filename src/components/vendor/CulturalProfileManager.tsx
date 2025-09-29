import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages, Sparkles, Award, Save, Loader2 } from 'lucide-react';
import { useCulturalProfile, CulturalProfile } from '@/hooks/useCulturalProfile';
import { toast } from 'sonner';

interface CulturalProfileManagerProps {
  vendorId: string;
}

// Cultural options
const CULTURAL_TYPES = [
  { value: 'south_asian_indian', label: '🇮🇳 Indian' },
  { value: 'south_asian_pakistani', label: '🇵🇰 Pakistani' },
  { value: 'south_asian_bangladeshi', label: '🇧🇩 Bangladeshi' },
  { value: 'muslim', label: '☪️ Muslim' },
  { value: 'jewish_orthodox', label: '✡️ Jewish (Orthodox)' },
  { value: 'jewish_reform', label: '✡️ Jewish (Reform)' },
  { value: 'jewish_conservative', label: '✡️ Jewish (Conservative)' },
  { value: 'chinese', label: '🇨🇳 Chinese' },
  { value: 'korean', label: '🇰🇷 Korean' },
  { value: 'japanese', label: '🇯🇵 Japanese' },
  { value: 'vietnamese', label: '🇻🇳 Vietnamese' },
  { value: 'latino', label: '🌎 Latino' },
  { value: 'african', label: '🌍 African' },
  { value: 'caribbean', label: '🏝️ Caribbean' },
];

const RELIGIOUS_TRADITIONS = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'christian', label: 'Christian' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'jain', label: 'Jain' },
];

const CEREMONY_TYPES = [
  { value: 'mehndi', label: 'Mehndi' },
  { value: 'sangeet', label: 'Sangeet' },
  { value: 'haldi', label: 'Haldi' },
  { value: 'baraat', label: 'Baraat' },
  { value: 'nikah', label: 'Nikah' },
  { value: 'walima', label: 'Walima' },
  { value: 'ketubah', label: 'Ketubah' },
  { value: 'chuppah', label: 'Chuppah' },
  { value: 'hora', label: 'Hora' },
  { value: 'tea_ceremony', label: 'Tea Ceremony' },
  { value: 'pyebaek', label: 'Pyebaek' },
];

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'hebrew', label: 'Hebrew' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'cantonese', label: 'Cantonese' },
  { value: 'korean', label: 'Korean' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'portuguese', label: 'Portuguese' },
];

const DIETARY_EXPERTISE = [
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'jain', label: 'Jain' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Gluten-Free' },
];

export const CulturalProfileManager: React.FC<CulturalProfileManagerProps> = ({ vendorId }) => {
  const { profile, loading, saving, saveProfile } = useCulturalProfile(vendorId);
  const [formData, setFormData] = useState<Partial<CulturalProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleCheckboxChange = (field: keyof CulturalProfile, value: string) => {
    const currentValues = (formData[field] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFormData(prev => ({
      ...prev,
      [field]: newValues
    }));
  };

  const handleCeremonyExperienceChange = (ceremony: string, count: string) => {
    const numCount = parseInt(count) || 0;
    setFormData(prev => ({
      ...prev,
      ceremony_experience: {
        ...(prev.ceremony_experience || {}),
        [ceremony]: numCount
      }
    }));
  };

  const handleSave = async () => {
    const result = await saveProfile(formData);
    if (result.success) {
      toast.success('Cultural profile saved successfully!');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Cultural Wedding Expertise
          </CardTitle>
          <CardDescription>
            Showcase your cultural specializations to attract the right couples. The more detail you provide,
            the better we can match you with couples planning culturally significant weddings.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cultural Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cultural Backgrounds You Serve</CardTitle>
          <CardDescription>
            Select all cultural backgrounds you have experience with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CULTURAL_TYPES.map(type => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`cultural-${type.value}`}
                  checked={formData.cultural_types?.includes(type.value)}
                  onCheckedChange={() => handleCheckboxChange('cultural_types', type.value)}
                />
                <label
                  htmlFor={`cultural-${type.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Religious Traditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Religious Traditions</CardTitle>
          <CardDescription>
            Select religious traditions you're experienced with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RELIGIOUS_TRADITIONS.map(tradition => (
              <div key={tradition.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`religion-${tradition.value}`}
                  checked={formData.religious_traditions?.includes(tradition.value)}
                  onCheckedChange={() => handleCheckboxChange('religious_traditions', tradition.value)}
                />
                <label
                  htmlFor={`religion-${tradition.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {tradition.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ceremony Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Ceremony Experience
          </CardTitle>
          <CardDescription>
            How many of each ceremony type have you done? This helps couples trust your expertise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CEREMONY_TYPES.map(ceremony => (
              <div key={ceremony.value} className="space-y-2">
                <Label htmlFor={`ceremony-${ceremony.value}`}>
                  {ceremony.label}
                </Label>
                <Input
                  id={`ceremony-${ceremony.value}`}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.ceremony_experience?.[ceremony.value] || ''}
                  onChange={(e) => handleCeremonyExperienceChange(ceremony.value, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Be honest about your experience. Even 1-2 ceremonies shows you have knowledge!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Languages Spoken
          </CardTitle>
          <CardDescription>
            Select all languages you or your team can communicate in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LANGUAGES.map(lang => (
              <div key={lang.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${lang.value}`}
                  checked={formData.languages?.includes(lang.value)}
                  onCheckedChange={() => handleCheckboxChange('languages', lang.value)}
                />
                <label
                  htmlFor={`lang-${lang.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {lang.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Expertise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dietary Requirements Experience</CardTitle>
          <CardDescription>
            What dietary restrictions are you experienced with?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIETARY_EXPERTISE.map(diet => (
              <div key={diet.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`diet-${diet.value}`}
                  checked={formData.dietary_expertise?.includes(diet.value)}
                  onCheckedChange={() => handleCheckboxChange('dietary_expertise', diet.value)}
                />
                <label
                  htmlFor={`diet-${diet.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {diet.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Special Services</CardTitle>
          <CardDescription>
            Do you provide specialized cultural services?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="modesty-services"
              checked={formData.modesty_services}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, modesty_services: checked as boolean }))}
            />
            <label htmlFor="modesty-services" className="text-sm font-medium cursor-pointer">
              Modesty-conscious services (e.g., modest photography, gender-appropriate staff)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gender-segregation"
              checked={formData.gender_segregation_experience}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gender_segregation_experience: checked as boolean }))}
            />
            <label htmlFor="gender-segregation" className="text-sm font-medium cursor-pointer">
              Experience with gender-segregated events
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Experience Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5" />
            Experience Summary
          </CardTitle>
          <CardDescription>
            Help couples understand your overall cultural wedding experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years-experience">Years of Cultural Wedding Experience</Label>
              <Input
                id="years-experience"
                type="number"
                min="0"
                value={formData.years_cultural_experience || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  years_cultural_experience: parseInt(e.target.value) || 0
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-events">Total Cultural Events Done</Label>
              <Input
                id="total-events"
                type="number"
                min="0"
                value={formData.total_cultural_events || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  total_cultural_events: parseInt(e.target.value) || 0
                }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (Optional)</Label>
            <Textarea
              id="certifications"
              placeholder="e.g., Certified Halal Chef, Traditional Indian Wedding Coordinator Certification"
              rows={3}
              value={formData.certifications || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                certifications: e.target.value
              }))}
            />
            <p className="text-sm text-gray-500">
              List any relevant certifications or training in cultural wedding services
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="min-w-[200px]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Cultural Profile
            </>
          )}
        </Button>
      </div>

      {/* Success Message */}
      {formData.cultural_types && formData.cultural_types.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Great! You're showcasing cultural expertise in {formData.cultural_types.length} culture(s)
                </h3>
                <p className="text-sm text-green-800">
                  This helps couples find you when searching for vendors who understand their traditions.
                  Save your profile to start receiving better-matched inquiries!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

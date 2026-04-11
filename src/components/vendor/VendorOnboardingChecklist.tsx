import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Image,
  Globe,
  Share2,
  Sparkles,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';
import { Vendor } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

interface VendorOnboardingChecklistProps {
  vendor: Vendor;
  vendorId: string;
  onNavigate: (tab: string) => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  action: string;
  tab: string;
  icon: React.ReactNode;
}

export const VendorOnboardingChecklist: React.FC<VendorOnboardingChecklistProps> = ({
  vendor,
  vendorId,
  onNavigate,
}) => {
  const [hasCulturalProfile, setHasCulturalProfile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkCulturalProfile = async () => {
      try {
        const { data } = await supabase
          .from('vendor_cultural_profiles')
          .select('id')
          .eq('vendor_id', vendorId)
          .maybeSingle();
        setHasCulturalProfile(!!data);
      } catch {
        // Table may not exist yet
      }
    };
    checkCulturalProfile();
  }, [vendorId]);

  const contactInfo = (vendor.contact_info as Record<string, string>) || {};
  const hasMultiplePhotos = (vendor.images || []).length >= 3;
  const hasWebsite = !!contactInfo.website;
  const hasDescription = (vendor.description || '').length >= 50;

  const checklist: ChecklistItem[] = [
    {
      id: 'photos',
      label: 'Add at least 3 photos',
      description: 'Listings with 3+ photos get 2x more views',
      completed: hasMultiplePhotos,
      action: 'Add Photos',
      tab: 'profile',
      icon: <Image className="w-4 h-4" />,
    },
    {
      id: 'description',
      label: 'Write a detailed description',
      description: 'At least 50 characters helps couples understand your services',
      completed: hasDescription,
      action: 'Edit Description',
      tab: 'profile',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'website',
      label: 'Add your website',
      description: 'Link to your portfolio or booking page',
      completed: hasWebsite,
      action: 'Add Website',
      tab: 'profile',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'cultural',
      label: 'Set up cultural specializations',
      description: 'Stand out to couples looking for culturally specific vendors',
      completed: hasCulturalProfile,
      action: 'Add Specializations',
      tab: 'cultural',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'share',
      label: 'Share your listing',
      description: 'Post your vendor page link on social media',
      completed: false, // Always actionable
      action: 'Copy Link',
      tab: 'share',
      icon: <Share2 className="w-4 h-4" />,
    },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allDone = completedCount === totalCount;

  if (dismissed) return null;

  const handleAction = (item: ChecklistItem) => {
    if (item.id === 'share') {
      const url = `${window.location.origin}/vendor/${vendorId}`;
      navigator.clipboard.writeText(url);
      // We can't mark share as "completed" but the toast from clipboard is enough
      import('sonner').then(({ toast }) => {
        toast.success('Listing link copied to clipboard!');
      });
      return;
    }
    onNavigate(item.tab);
  };

  return (
    <Card className="border-2 border-dashed border-wedding-primary/30 bg-gradient-to-br from-white to-wedding-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allDone ? (
              <PartyPopper className="w-6 h-6 text-green-600" />
            ) : (
              <Sparkles className="w-6 h-6 text-wedding-primary" />
            )}
            <div>
              <CardTitle className="text-lg">
                {allDone ? 'You\'re all set!' : 'Welcome! Let\'s get you set up'}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                {allDone
                  ? 'Your profile is looking great. Couples can now find you!'
                  : `Complete these steps to make your listing stand out`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600">{completedCount} of {totalCount} complete</span>
            <span className="font-medium text-wedding-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                item.completed
                  ? 'bg-green-50/50'
                  : 'bg-white hover:bg-gray-50 cursor-pointer'
              }`}
              onClick={() => !item.completed && handleAction(item)}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
              {!item.completed && (
                <Button variant="ghost" size="sm" className="text-xs text-wedding-primary flex-shrink-0">
                  {item.action}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

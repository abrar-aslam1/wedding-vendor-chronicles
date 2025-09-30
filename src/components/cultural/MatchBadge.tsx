import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Globe, Users, Palette } from 'lucide-react';

interface MatchBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  label?: string;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ 
  score, 
  size = 'md',
  showIcon = true,
  label
}) => {
  const getMatchLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-100 text-green-800 border-green-300', icon: '🎉' };
    if (score >= 80) return { level: 'Very Good', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '✨' };
    if (score >= 70) return { level: 'Good', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '💫' };
    if (score >= 60) return { level: 'Fair', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⭐' };
    return { level: 'Moderate', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '○' };
  };

  const match = getMatchLevel(score);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Badge className={`${match.color} ${sizeClasses[size]} border font-semibold`}>
        {showIcon && <span className="mr-1">{match.icon}</span>}
        {score}% Match
      </Badge>
      {label && size !== 'sm' && (
        <span className="text-xs text-gray-500">
          {label}: {match.level}
        </span>
      )}
    </div>
  );
};

interface MatchScoreBreakdownProps {
  culturalScore: number;
  languageScore: number;
  ceremonyScore: number;
  styleScore: number;
}

export const MatchScoreBreakdown: React.FC<MatchScoreBreakdownProps> = ({
  culturalScore,
  languageScore,
  ceremonyScore,
  styleScore
}) => {
  const scores = [
    { label: 'Cultural Fit', score: culturalScore, icon: Heart, color: 'text-red-600' },
    { label: 'Language', score: languageScore, icon: Globe, color: 'text-blue-600' },
    { label: 'Ceremony Experience', score: ceremonyScore, icon: Sparkles, color: 'text-purple-600' },
    { label: 'Style Match', score: styleScore, icon: Palette, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-3">
      {scores.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  item.score >= 80 ? 'bg-green-500' :
                  item.score >= 60 ? 'bg-blue-500' :
                  item.score >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 w-10 text-right">
              {item.score}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

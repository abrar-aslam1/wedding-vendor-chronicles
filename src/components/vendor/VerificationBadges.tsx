import { CheckCircle, Shield, Star, Clock, Award, Verified, Phone, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerificationData {
  googleVerified?: boolean;
  businessLicense?: boolean;
  insurance?: boolean;
  responseTime?: 'fast' | 'medium' | 'slow';
  reviewScore?: number;
  reviewCount?: number;
  portfolioVerified?: boolean;
  contactVerified?: boolean;
  websiteVerified?: boolean;
  addressVerified?: boolean;
  premiumMember?: boolean;
}

interface VerificationBadgesProps {
  verification: VerificationData;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  className?: string;
}

export const VerificationBadges = ({
  verification,
  size = 'md',
  layout = 'horizontal',
  showLabels = true,
  className
}: VerificationBadgesProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badgeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2'
  };

  const badges = [];

  // Google Verified Badge
  if (verification.googleVerified) {
    badges.push({
      key: 'google',
      icon: <CheckCircle className={sizeClasses[size]} />,
      label: 'Google Verified',
      className: 'bg-gradient-to-r from-blue-500 to-green-500 text-white',
      priority: 1
    });
  }

  // Premium Member Badge
  if (verification.premiumMember) {
    badges.push({
      key: 'premium',
      icon: <Award className={sizeClasses[size]} />,
      label: 'Premium Member',
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      priority: 2
    });
  }

  // Business License Badge
  if (verification.businessLicense) {
    badges.push({
      key: 'license',
      icon: <Shield className={sizeClasses[size]} />,
      label: 'Licensed',
      className: 'bg-green-100 text-green-700 border border-green-200',
      priority: 3
    });
  }

  // Insurance Badge
  if (verification.insurance) {
    badges.push({
      key: 'insurance',
      icon: <Shield className={sizeClasses[size]} />,
      label: 'Insured',
      className: 'bg-blue-100 text-blue-700 border border-blue-200',
      priority: 4
    });
  }

  // Response Time Badge
  if (verification.responseTime) {
    const responseConfig = {
      fast: { label: 'Quick Response', className: 'bg-green-100 text-green-700 border border-green-200' },
      medium: { label: 'Responds Soon', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
      slow: { label: 'Responds', className: 'bg-gray-100 text-gray-700 border border-gray-200' }
    };

    badges.push({
      key: 'response',
      icon: <Clock className={sizeClasses[size]} />,
      label: responseConfig[verification.responseTime].label,
      className: responseConfig[verification.responseTime].className,
      priority: 5
    });
  }

  // High Rating Badge
  if (verification.reviewScore && verification.reviewScore >= 4.5 && verification.reviewCount && verification.reviewCount >= 10) {
    badges.push({
      key: 'rating',
      icon: <Star className={sizeClasses[size]} />,
      label: 'Top Rated',
      className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      priority: 6
    });
  }

  // Portfolio Verified Badge
  if (verification.portfolioVerified) {
    badges.push({
      key: 'portfolio',
      icon: <Verified className={sizeClasses[size]} />,
      label: 'Portfolio Verified',
      className: 'bg-purple-100 text-purple-700 border border-purple-200',
      priority: 7
    });
  }

  // Contact Verified Badge
  if (verification.contactVerified) {
    badges.push({
      key: 'contact',
      icon: <Phone className={sizeClasses[size]} />,
      label: 'Contact Verified',
      className: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
      priority: 8
    });
  }

  // Website Verified Badge
  if (verification.websiteVerified) {
    badges.push({
      key: 'website',
      icon: <Globe className={sizeClasses[size]} />,
      label: 'Website Verified',
      className: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
      priority: 9
    });
  }

  // Address Verified Badge
  if (verification.addressVerified) {
    badges.push({
      key: 'address',
      icon: <MapPin className={sizeClasses[size]} />,
      label: 'Address Verified',
      className: 'bg-orange-100 text-orange-700 border border-orange-200',
      priority: 10
    });
  }

  // Sort badges by priority
  badges.sort((a, b) => a.priority - b.priority);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {badges.map((badge) => (
        <div
          key={badge.key}
          className={cn(
            'flex items-center gap-1.5 rounded-full font-medium shadow-sm',
            badgeClasses[size],
            badge.className
          )}
        >
          {badge.icon}
          {showLabels && <span>{badge.label}</span>}
        </div>
      ))}
    </div>
  );
};

// Trust Score Component
interface TrustScoreProps {
  verification: VerificationData;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const TrustScore = ({ verification, size = 'md', showDetails = false }: TrustScoreProps) => {
  // Calculate trust score based on verification factors
  let score = 0;
  let maxScore = 0;

  const factors = [
    { key: 'googleVerified', weight: 20, label: 'Google Verified' },
    { key: 'businessLicense', weight: 15, label: 'Business License' },
    { key: 'insurance', weight: 15, label: 'Insurance' },
    { key: 'portfolioVerified', weight: 10, label: 'Portfolio Verified' },
    { key: 'contactVerified', weight: 10, label: 'Contact Verified' },
    { key: 'websiteVerified', weight: 10, label: 'Website Verified' },
    { key: 'addressVerified', weight: 10, label: 'Address Verified' },
    { key: 'premiumMember', weight: 10, label: 'Premium Member' }
  ];

  factors.forEach(factor => {
    maxScore += factor.weight;
    if (verification[factor.key as keyof VerificationData]) {
      score += factor.weight;
    }
  });

  // Add response time score
  if (verification.responseTime) {
    maxScore += 10;
    if (verification.responseTime === 'fast') score += 10;
    else if (verification.responseTime === 'medium') score += 5;
  }

  const trustPercentage = Math.round((score / maxScore) * 100);
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Highly Trusted';
    if (percentage >= 60) return 'Trusted';
    if (percentage >= 40) return 'Verified';
    return 'Basic';
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn('font-semibold', getScoreColor(trustPercentage), sizeClasses[size])}>
        {trustPercentage}%
      </div>
      <div className={cn('text-gray-600', sizeClasses[size])}>
        {getScoreLabel(trustPercentage)}
      </div>
      {showDetails && (
        <div className="text-xs text-gray-500">
          ({score}/{maxScore} points)
        </div>
      )}
    </div>
  );
};

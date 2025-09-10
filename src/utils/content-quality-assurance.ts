import { generateCityIntro, generateCityFAQs } from './content-generator';

export interface ContentQualityReport {
  contentId: string;
  city: string;
  state: string;
  category: string;
  subcategory?: string;
  wordCount: number;
  readabilityScore: number;
  duplicateRisk: 'low' | 'medium' | 'high';
  seoOptimization: {
    titleLength: boolean;
    metaLength: boolean;
    keywordDensity: number;
    hasCallToAction: boolean;
  };
  qualityScore: number;
  suggestions: string[];
  generatedAt: string;
}

export interface DuplicateAnalysis {
  similarity: number;
  duplicateSegments: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Analyze content quality and provide optimization suggestions
 */
export const analyzeContentQuality = async (
  city: string,
  state: string,
  category: string,
  subcategory?: string
): Promise<ContentQualityReport> => {
  try {
    // Generate content for analysis
    const introContent = await generateCityIntro(city, state, category, subcategory);
    const faqs = await generateCityFAQs(city, state, category, subcategory);
    
    const contentId = `${city}-${state}-${category}${subcategory ? `-${subcategory}` : ''}`.toLowerCase();
    
    // Analyze word count
    const wordCount = introContent.split(/\s+/).length;
    
    // Calculate readability score (simplified Flesch Reading Ease)
    const readabilityScore = calculateReadabilityScore(introContent);
    
    // Analyze duplicate risk
    const duplicateRisk = await analyzeDuplicateRisk(introContent, city, state, category);
    
    // SEO optimization checks
    const seoOptimization = {
      titleLength: true, // Assuming title is optimized by existing SEO helpers
      metaLength: true, // Assuming meta is optimized by existing SEO helpers
      keywordDensity: calculateKeywordDensity(introContent, category, city),
      hasCallToAction: hasCallToAction(introContent)
    };
    
    // Calculate overall quality score
    const qualityScore = calculateQualityScore({
      wordCount,
      readabilityScore,
      duplicateRisk,
      seoOptimization,
      faqCount: faqs.length
    });
    
    // Generate suggestions
    const suggestions = generateSuggestions({
      wordCount,
      readabilityScore,
      duplicateRisk,
      seoOptimization,
      faqCount: faqs.length
    });
    
    return {
      contentId,
      city,
      state,
      category,
      subcategory,
      wordCount,
      readabilityScore,
      duplicateRisk,
      seoOptimization,
      qualityScore,
      suggestions,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error analyzing content quality:', error);
    throw error;
  }
};

/**
 * Calculate readability score using simplified Flesch Reading Ease
 */
const calculateReadabilityScore = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Simplified Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Count syllables in a word (simplified)
 */
const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e'
  if (word.endsWith('e')) {
    count--;
  }
  
  return Math.max(1, count);
};

/**
 * Analyze duplicate risk by comparing with common patterns
 */
const analyzeDuplicateRisk = async (
  content: string,
  city: string,
  state: string,
  category: string
): Promise<'low' | 'medium' | 'high'> => {
  // Common phrases that might indicate template-like content
  const commonPhrases = [
    'wedding planning',
    'special day',
    'perfect match',
    'top-rated',
    'browse our',
    'find the best',
    'curated list'
  ];
  
  let commonPhraseCount = 0;
  commonPhrases.forEach(phrase => {
    if (content.toLowerCase().includes(phrase)) {
      commonPhraseCount++;
    }
  });
  
  // Calculate uniqueness based on specific data inclusion
  const hasSpecificData = content.includes(city) && 
                         content.includes(state) && 
                         /\d+/.test(content); // Contains numbers (stats)
  
  if (commonPhraseCount > 4 && !hasSpecificData) {
    return 'high';
  } else if (commonPhraseCount > 2 || !hasSpecificData) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Calculate keyword density for SEO optimization
 */
const calculateKeywordDensity = (content: string, category: string, city: string): number => {
  const words = content.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  
  const keywords = [
    category.toLowerCase(),
    city.toLowerCase(),
    'wedding',
    `wedding ${category.toLowerCase()}`,
    `${city.toLowerCase()} ${category.toLowerCase()}`
  ];
  
  let keywordCount = 0;
  keywords.forEach(keyword => {
    const keywordWords = keyword.split(/\s+/);
    if (keywordWords.length === 1) {
      keywordCount += words.filter(word => word === keyword).length;
    } else {
      // Multi-word keyword matching
      const keywordPhrase = keyword;
      const matches = content.toLowerCase().match(new RegExp(keywordPhrase, 'g'));
      keywordCount += matches ? matches.length : 0;
    }
  });
  
  return totalWords > 0 ? Math.round((keywordCount / totalWords) * 100 * 10) / 10 : 0;
};

/**
 * Check if content has a call to action
 */
const hasCallToAction = (content: string): boolean => {
  const ctaPhrases = [
    'browse',
    'explore',
    'discover',
    'contact',
    'connect',
    'find',
    'book',
    'schedule',
    'get started',
    'learn more'
  ];
  
  const lowerContent = content.toLowerCase();
  return ctaPhrases.some(phrase => lowerContent.includes(phrase));
};

/**
 * Calculate overall quality score
 */
const calculateQualityScore = (metrics: {
  wordCount: number;
  readabilityScore: number;
  duplicateRisk: 'low' | 'medium' | 'high';
  seoOptimization: {
    titleLength: boolean;
    metaLength: boolean;
    keywordDensity: number;
    hasCallToAction: boolean;
  };
  faqCount: number;
}): number => {
  let score = 0;
  
  // Word count score (target: 120-180 words)
  if (metrics.wordCount >= 120 && metrics.wordCount <= 180) {
    score += 25;
  } else if (metrics.wordCount >= 100 && metrics.wordCount <= 200) {
    score += 20;
  } else {
    score += 10;
  }
  
  // Readability score (target: 60-70 for general audience)
  if (metrics.readabilityScore >= 60 && metrics.readabilityScore <= 70) {
    score += 25;
  } else if (metrics.readabilityScore >= 50 && metrics.readabilityScore <= 80) {
    score += 20;
  } else {
    score += 10;
  }
  
  // Duplicate risk score
  switch (metrics.duplicateRisk) {
    case 'low':
      score += 25;
      break;
    case 'medium':
      score += 15;
      break;
    case 'high':
      score += 5;
      break;
  }
  
  // SEO optimization score
  let seoScore = 0;
  if (metrics.seoOptimization.titleLength) seoScore += 3;
  if (metrics.seoOptimization.metaLength) seoScore += 3;
  if (metrics.seoOptimization.keywordDensity >= 1 && metrics.seoOptimization.keywordDensity <= 3) seoScore += 6;
  if (metrics.seoOptimization.hasCallToAction) seoScore += 3;
  score += seoScore;
  
  // FAQ count score
  if (metrics.faqCount >= 3) {
    score += 10;
  } else if (metrics.faqCount >= 1) {
    score += 5;
  }
  
  return Math.min(100, score);
};

/**
 * Generate improvement suggestions
 */
const generateSuggestions = (metrics: {
  wordCount: number;
  readabilityScore: number;
  duplicateRisk: 'low' | 'medium' | 'high';
  seoOptimization: {
    titleLength: boolean;
    metaLength: boolean;
    keywordDensity: number;
    hasCallToAction: boolean;
  };
  faqCount: number;
}): string[] => {
  const suggestions: string[] = [];
  
  // Word count suggestions
  if (metrics.wordCount < 120) {
    suggestions.push('Consider adding more specific details about local market data to reach the optimal 120-180 word range.');
  } else if (metrics.wordCount > 180) {
    suggestions.push('Content is longer than optimal. Consider condensing to 120-180 words for better readability.');
  }
  
  // Readability suggestions
  if (metrics.readabilityScore < 50) {
    suggestions.push('Content may be too complex. Try using shorter sentences and simpler words to improve readability.');
  } else if (metrics.readabilityScore > 80) {
    suggestions.push('Content might be too simple. Consider adding more descriptive language while maintaining clarity.');
  }
  
  // Duplicate risk suggestions
  if (metrics.duplicateRisk === 'high') {
    suggestions.push('High duplicate risk detected. Add more specific local data, statistics, or unique insights to differentiate content.');
  } else if (metrics.duplicateRisk === 'medium') {
    suggestions.push('Moderate duplicate risk. Consider incorporating more city-specific details or market statistics.');
  }
  
  // SEO suggestions
  if (metrics.seoOptimization.keywordDensity < 1) {
    suggestions.push('Keyword density is low. Consider naturally incorporating more relevant keywords.');
  } else if (metrics.seoOptimization.keywordDensity > 3) {
    suggestions.push('Keyword density is high. Reduce keyword usage to avoid over-optimization.');
  }
  
  if (!metrics.seoOptimization.hasCallToAction) {
    suggestions.push('Add a clear call-to-action to encourage user engagement.');
  }
  
  // FAQ suggestions
  if (metrics.faqCount < 3) {
    suggestions.push('Consider adding more FAQs to improve rich snippet opportunities and user value.');
  }
  
  return suggestions;
};

/**
 * Batch analyze multiple city/category combinations
 */
export const batchAnalyzeContent = async (
  combinations: Array<{
    city: string;
    state: string;
    category: string;
    subcategory?: string;
  }>
): Promise<ContentQualityReport[]> => {
  const reports: ContentQualityReport[] = [];
  
  for (const combo of combinations) {
    try {
      const report = await analyzeContentQuality(
        combo.city,
        combo.state,
        combo.category,
        combo.subcategory
      );
      reports.push(report);
      
      // Add small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error analyzing ${combo.city}, ${combo.state} - ${combo.category}:`, error);
    }
  }
  
  return reports;
};

/**
 * Generate quality assurance summary
 */
export const generateQASummary = (reports: ContentQualityReport[]) => {
  const totalReports = reports.length;
  const averageQualityScore = reports.reduce((sum, r) => sum + r.qualityScore, 0) / totalReports;
  
  const duplicateRiskDistribution = {
    low: reports.filter(r => r.duplicateRisk === 'low').length,
    medium: reports.filter(r => r.duplicateRisk === 'medium').length,
    high: reports.filter(r => r.duplicateRisk === 'high').length
  };
  
  const averageWordCount = reports.reduce((sum, r) => sum + r.wordCount, 0) / totalReports;
  const averageReadability = reports.reduce((sum, r) => sum + r.readabilityScore, 0) / totalReports;
  
  const commonSuggestions = reports
    .flatMap(r => r.suggestions)
    .reduce((acc, suggestion) => {
      acc[suggestion] = (acc[suggestion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  
  const topSuggestions = Object.entries(commonSuggestions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([suggestion, count]) => ({ suggestion, count }));
  
  return {
    totalReports,
    averageQualityScore: Math.round(averageQualityScore * 10) / 10,
    duplicateRiskDistribution,
    averageWordCount: Math.round(averageWordCount),
    averageReadability: Math.round(averageReadability),
    topSuggestions,
    generatedAt: new Date().toISOString()
  };
};

/**
 * Advanced Wedding Hashtag Generator Algorithm
 */

// Main types
export interface HashtagInput {
  partner1FirstName: string;
  partner1LastName: string;
  partner2FirstName: string;
  partner2LastName: string;
  weddingDate?: Date;
  weddingLocation?: string;
  weddingTheme?: string;
  interests?: string[];
  customWords?: string[];
  preferences?: HashtagPreferences;
}

export interface HashtagPreferences {
  tone: 'formal' | 'casual';
  style: 'traditional' | 'modern';
  maxLength?: number;
  includeDate?: boolean;
  includeLocation?: boolean;
  prioritizeUniqueness?: boolean;
}

export interface GeneratedHashtag {
  text: string;
  category: string;
  score: number;
  pattern: string;
}

/**
 * Main function to generate advanced wedding hashtags
 */
export function generateAdvancedHashtags(input: HashtagInput): GeneratedHashtag[] {
  // Normalize input
  const normalizedInput = normalizeInput(input);
  
  // Generate hashtags from all pattern categories
  const allHashtags: GeneratedHashtag[] = [];
  
  // Apply all pattern categories
  allHashtags.push(...generateNameCombinations(normalizedInput));
  allHashtags.push(...generateLinguisticCreations(normalizedInput));
  allHashtags.push(...generatePersonalizedTags(normalizedInput));
  allHashtags.push(...generateLastNameTransformations(normalizedInput));
  allHashtags.push(...generateWordplayFormulas(normalizedInput));
  allHashtags.push(...generateSentimentPatterns(normalizedInput));
  
  // Apply quality controls
  const filteredHashtags = verifyAndFilterHashtags(allHashtags);
  
  // Score and rank
  const scoredHashtags = scoreAndRankHashtags(filteredHashtags, normalizedInput.preferences);
  
  return scoredHashtags;
}

/**
 * Normalize input data for consistent processing
 */
function normalizeInput(input: HashtagInput): HashtagInput {
  return {
    ...input,
    partner1FirstName: capitalize(input.partner1FirstName.trim()),
    partner1LastName: capitalize(input.partner1LastName.trim()),
    partner2FirstName: capitalize(input.partner2FirstName.trim()),
    partner2LastName: capitalize(input.partner2LastName.trim()),
    weddingLocation: input.weddingLocation ? input.weddingLocation.trim() : undefined,
    weddingTheme: input.weddingTheme ? input.weddingTheme.trim() : undefined,
    interests: input.interests ? input.interests.map(i => i.trim()) : undefined,
    customWords: input.customWords ? input.customWords.map(w => w.trim()) : undefined,
  };
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate hashtags based on name combinations
 */
function generateNameCombinations(input: HashtagInput): GeneratedHashtag[] {
  const hashtags: GeneratedHashtag[] = [];
  
  // First + First combinations
  hashtags.push({
    text: `#${input.partner1FirstName}And${input.partner2FirstName}`,
    category: "Name Combinations",
    score: 0,
    pattern: "FirstName+And+FirstName"
  });
  
  hashtags.push({
    text: `#${input.partner1FirstName}Weds${input.partner2FirstName}`,
    category: "Name Combinations",
    score: 0,
    pattern: "FirstName+Weds+FirstName"
  });
  
  // Portmanteaus (name blending)
  const firstNameBlend1 = blendNames(input.partner1FirstName, input.partner2FirstName);
  hashtags.push({
    text: `#${firstNameBlend1}Wedding`,
    category: "Name Combinations",
    score: 0,
    pattern: "BlendedNames+Wedding"
  });
  
  // Last name combinations
  if (input.partner1LastName === input.partner2LastName) {
    // Same last name
    hashtags.push({
      text: `#The${input.partner1LastName}s`,
      category: "Name Combinations",
      score: 0,
      pattern: "The+LastName+s"
    });
  } else {
    // Different last names
    hashtags.push({
      text: `#${input.partner1LastName}${input.partner2LastName}Wedding`,
      category: "Name Combinations",
      score: 0,
      pattern: "LastName+LastName+Wedding"
    });
  }
  
  return hashtags;
}

/**
 * Helper function to blend two names
 */
function blendNames(name1: string, name2: string): string {
  const name1Half = name1.substring(0, Math.ceil(name1.length / 2));
  const name2Half = name2.substring(Math.floor(name2.length / 2));
  return name1Half + name2Half;
}

/**
 * Generate hashtags based on linguistic creativity
 */
function generateLinguisticCreations(input: HashtagInput): GeneratedHashtag[] {
  const hashtags: GeneratedHashtag[] = [];
  
  // Alliteration
  if (input.partner1FirstName[0].toLowerCase() === input.partner2FirstName[0].toLowerCase()) {
    const letter = input.partner1FirstName[0];
    
    hashtags.push({
      text: `#${letter}${letter}Forever`,
      category: "Linguistic Creativity",
      score: 0,
      pattern: "Alliteration+Forever"
    });
  }
  
  // Wedding terminology wordplay
  hashtags.push({
    text: `#${input.partner1LastName}TieTheKnot`,
    category: "Linguistic Creativity",
    score: 0,
    pattern: "LastName+WeddingPhrase"
  });
  
  return hashtags;
}

/**
 * Generate hashtags based on personalization vectors
 */
function generatePersonalizedTags(input: HashtagInput): GeneratedHashtag[] {
  const hashtags: GeneratedHashtag[] = [];
  
  // Date-based hashtags
  if (input.weddingDate) {
    const year = input.weddingDate.getFullYear();
    const month = input.weddingDate.toLocaleString('default', { month: 'long' });
    
    hashtags.push({
      text: `#${input.partner1LastName}${input.partner2LastName}${year}`,
      category: "Personalized",
      score: 0,
      pattern: "LastName+LastName+Year"
    });
    
    hashtags.push({
      text: `#${month}Wedding${year}`,
      category: "Personalized",
      score: 0,
      pattern: "Month+Wedding+Year"
    });
  }
  
  // Location-based hashtags
  if (input.weddingLocation) {
    const location = input.weddingLocation.replace(/\s+/g, "");
    
    hashtags.push({
      text: `#${input.partner1FirstName}${input.partner2FirstName}In${location}`,
      category: "Personalized",
      score: 0,
      pattern: "FirstName+FirstName+In+Location"
    });
    
    hashtags.push({
      text: `#${location}Wedding`,
      category: "Personalized",
      score: 0,
      pattern: "Location+Wedding"
    });
  }
  
  // Theme-based hashtags
  if (input.weddingTheme) {
    const theme = input.weddingTheme.replace(/\s+/g, "");
    
    hashtags.push({
      text: `#${theme}${input.partner1FirstName}${input.partner2FirstName}`,
      category: "Personalized",
      score: 0,
      pattern: "Theme+FirstName+FirstName"
    });
  }
  
  return hashtags;
}

/**
 * Generate hashtags based on last name transformations
 */
function generateLastNameTransformations(input: HashtagInput): GeneratedHashtag[] {
  const hashtags: GeneratedHashtag[] = [];
  
  // "Happily Ever LastName" variations
  hashtags.push({
    text: `#HappilyEver${input.partner1LastName}`,
    category: "Last Name Transformations",
    score: 0,
    pattern: "HappilyEver+LastName"
  });
  
  // "The LastName Adventure/Journey/Chapter" variations
  const journeyWords = ["Adventure", "Journey", "Chapter", "Story"];
  journeyWords.forEach(word => {
    hashtags.push({
      text: `#The${input.partner1LastName}${word}`,
      category: "Last Name Transformations",
      score: 0,
      pattern: "The+LastName+JourneyWord"
    });
  });
  
  // Date additions
  if (input.weddingDate) {
    const year = input.weddingDate.getFullYear();
    
    hashtags.push({
      text: `#Forever${input.partner1LastName}${year}`,
      category: "Last Name Transformations",
      score: 0,
      pattern: "Forever+LastName+Year"
    });
  }
  
  return hashtags;
}

/**
 * Generate hashtags based on creative wordplay formulas
 */
function generateWordplayFormulas(input: HashtagInput): GeneratedHashtag[] {
  const hashtags: GeneratedHashtag[] = [];
  
  // Common wedding phrases with wordplay
  hashtags.push({
    text: `#${input.partner1LastName}ToHaveAndToHold`,
    category: "Creative Wordplay",
    score: 0,
    pattern: "LastName+WeddingVow"
  });
  
  // Pun variations based on common phrases
  hashtags.push({
    text: `#LoveAt${input.partner1FirstName}Sight`,
    category: "Creative Wordplay",
    score: 0,
    pattern: "CustomPun"
  });
  
  hashtags.push({
    text: `#${input.partner1LastName}MakingWaves`,
    category: "Creative Wordplay",
    score: 0,
    pattern: "LocationTheme+Phrase"
  });
  
  // Location-specific wordplay
  if (input.weddingLocation) {
    const location = input.weddingLocation.replace(/\s+/g, "");
    
    hashtags.push({
      text: `#${location}Ever${input.partner1LastName}After`,
      category: "Creative Wordplay",
      score: 0,
      pattern: "Location+Ever+LastName+After"
    });
  }
  
  return hashtags;
}

/**
 * Generate hashtags based on sentiment and emotional patterns
 */
function generateSentimentPatterns(input: HashtagInput): GeneratedHashtag[] {
  const hashtags: GeneratedHashtag[] = [];
  
  // Journey expressions
  if (input.partner1LastName !== input.partner2LastName) {
    hashtags.push({
      text: `#From${input.partner1LastName}To${input.partner2LastName}`,
      category: "Sentiment & Emotional",
      score: 0,
      pattern: "From+LastName+To+LastName"
    });
    
    hashtags.push({
      text: `#FromMissTo${input.partner2LastName}`,
      category: "Sentiment & Emotional",
      score: 0,
      pattern: "FromMissTo+LastName"
    });
  }
  
  // Commitment expressions
  hashtags.push({
    text: `#ForeverAnd${input.partner1LastName}`,
    category: "Sentiment & Emotional",
    score: 0,
    pattern: "ForeverAnd+LastName"
  });
  
  // Union expressions
  hashtags.push({
    text: `#TwoBecomesOne${input.partner1LastName}`,
    category: "Sentiment & Emotional",
    score: 0,
    pattern: "TwoBecomesOne+LastName"
  });
  
  hashtags.push({
    text: `#Better${input.partner1FirstName}${input.partner2FirstName}Together`,
    category: "Sentiment & Emotional",
    score: 0,
    pattern: "Better+FirstName+FirstName+Together"
  });
  
  return hashtags;
}

/**
 * Verify and filter hashtags for quality control
 */
function verifyAndFilterHashtags(hashtags: GeneratedHashtag[]): GeneratedHashtag[] {
  // Filter out duplicates
  const uniqueHashtags = removeDuplicates(hashtags);
  
  // Filter out inappropriate combinations
  const appropriateHashtags = filterInappropriate(uniqueHashtags);
  
  // Check for spelling issues
  const spellCheckedHashtags = spellCheck(appropriateHashtags);
  
  return spellCheckedHashtags;
}

/**
 * Remove duplicate hashtags
 */
function removeDuplicates(hashtags: GeneratedHashtag[]): GeneratedHashtag[] {
  const seen = new Set<string>();
  return hashtags.filter(hashtag => {
    const normalized = hashtag.text.toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

/**
 * Filter out inappropriate hashtags
 */
function filterInappropriate(hashtags: GeneratedHashtag[]): GeneratedHashtag[] {
  // Simple implementation - in a real system, this would use a more comprehensive list
  const inappropriateSubstrings = [
    "ass", "sex", "hell", "damn", "crap"
  ];
  
  return hashtags.filter(hashtag => {
    const text = hashtag.text.toLowerCase();
    return !inappropriateSubstrings.some(word => text.includes(word));
  });
}

/**
 * Check spelling and ensure proper formatting
 */
function spellCheck(hashtags: GeneratedHashtag[]): GeneratedHashtag[] {
  // Simple implementation - in a real system, this would use a proper spell checker
  return hashtags.map(hashtag => {
    // Ensure proper camelCase
    let text = hashtag.text;
    text = ensureCamelCase(text);
    
    return {
      ...hashtag,
      text
    };
  });
}

/**
 * Ensure proper camelCase formatting for hashtags
 */
function ensureCamelCase(text: string): string {
  // Ensure the hashtag symbol is at the beginning
  if (!text.startsWith('#')) {
    text = '#' + text;
  }
  
  // Split by non-alphanumeric characters
  const parts = text.substring(1).split(/[^a-zA-Z0-9]/);
  
  // Capitalize each part
  const camelCased = parts.map(part => {
    if (part.length === 0) return '';
    return part[0].toUpperCase() + part.substring(1);
  }).join('');
  
  return '#' + camelCased;
}

/**
 * Score and rank hashtags based on various factors
 */
function scoreAndRankHashtags(hashtags: GeneratedHashtag[], preferences?: HashtagPreferences): GeneratedHashtag[] {
  // Score each hashtag
  const scoredHashtags = hashtags.map(hashtag => {
    let score = 0;
    
    // Length score - prefer medium length (not too short, not too long)
    const textLength = hashtag.text.length;
    if (textLength > 10 && textLength < 25) {
      score += 2;
    } else if (textLength <= 30) {
      score += 1;
    }
    
    // Memorability score - based on pattern
    if (hashtag.pattern.includes("FirstName") || hashtag.pattern.includes("LastName")) {
      score += 2; // Names are memorable
    }
    
    if (hashtag.pattern.includes("Rhyme") || hashtag.pattern.includes("Alliteration")) {
      score += 2; // Rhymes and alliteration are memorable
    }
    
    // Preference matching
    if (preferences) {
      // Adjust score based on preferences
      if (preferences.includeDate && hashtag.pattern.includes("Year")) {
        score += 1;
      }
      
      if (preferences.includeLocation && hashtag.pattern.includes("Location")) {
        score += 1;
      }
      
      // Length preference
      if (preferences.maxLength && hashtag.text.length <= preferences.maxLength) {
        score += 1;
      }
      
      // Tone preference
      if (preferences.tone === 'formal' && 
          (hashtag.category === "Last Name Transformations" || hashtag.pattern.includes("LastName"))) {
        score += 1;
      }
      
      if (preferences.tone === 'casual' && 
          (hashtag.category === "Creative Wordplay" || hashtag.pattern.includes("Pun"))) {
        score += 1;
      }
      
      // Style preference
      if (preferences.style === 'traditional' && 
          (hashtag.category === "Name Combinations" || hashtag.pattern.includes("Wedding"))) {
        score += 1;
      }
      
      if (preferences.style === 'modern' && 
          (hashtag.category === "Creative Wordplay" || hashtag.category === "Linguistic Creativity")) {
        score += 1;
      }
    }
    
    return {
      ...hashtag,
      score
    };
  });
  
  // Sort by score (descending)
  return scoredHashtags.sort((a, b) => b.score - a.score);
}

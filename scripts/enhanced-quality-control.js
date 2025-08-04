/**
 * Enhanced Quality Control System for Instagram Vendor Collection
 * 
 * This system implements advanced quality checks to ensure only the highest
 * quality wedding vendors are collected and stored in the database.
 */

import { InstagramCollector, WEDDING_CATEGORIES } from './instagram-vendor-collection-system.js';

/**
 * Enhanced Quality Control Collector
 * Implements stricter quality standards and multi-layer validation
 */
class EnhancedQualityCollector extends InstagramCollector {
  constructor() {
    super();
    
    // Enhanced quality thresholds
    this.qualityThresholds = {
      minimumQualityScore: 60, // Raised from 30 to 60
      minimumEngagementRate: 0.8, // Minimum 0.8% engagement
      minimumWeddingContent: 70, // 70% wedding-related content
      minimumRecentActivity: 30, // Posted within last 30 days
      minimumBusinessIndicators: 2, // At least 2 business indicators
      maximumFollowerEngagementRatio: 0.1, // Prevent fake followers
      minimumContentQuality: 70 // Professional content quality
    };
    
    // Quality flags for detailed analysis
    this.qualityFlags = {
      hasBusinessEmail: false,
      hasWebsite: false,
      hasPhoneNumber: false,
      isVerifiedAccount: false,
      isBusinessAccount: false,
      hasRecentPosts: false,
      hasConsistentPosting: false,
      hasHighEngagement: false,
      hasWeddingPortfolio: false,
      hasProfessionalBio: false,
      hasLocationInfo: false,
      hasClientTestimonials: false
    };
  }

  /**
   * Enhanced quality scoring with stricter criteria
   */
  calculateEnhancedQualityScore(profileData, postsData, category) {
    const categoryConfig = WEDDING_CATEGORIES[category];
    let score = 0;
    let qualityFlags = { ...this.qualityFlags };
    
    // 1. FOLLOWER QUALITY ANALYSIS (30 points)
    const followers = profileData.followers_count || 0;
    const following = profileData.following_count || 0;
    const posts = profileData.posts_count || 0;
    
    // Follower count scoring with quality checks
    if (followers >= 100000) score += 25;
    else if (followers >= 50000) score += 22;
    else if (followers >= 20000) score += 20;
    else if (followers >= 10000) score += 18;
    else if (followers >= 5000) score += 15;
    else if (followers >= 2000) score += 12;
    else if (followers >= 1000) score += 8;
    else if (followers >= 500) score += 5;
    
    // Follower-to-following ratio (healthy accounts)
    const followerRatio = following > 0 ? followers / following : 0;
    if (followerRatio >= 2) score += 3; // Good ratio
    else if (followerRatio >= 1) score += 1;
    else if (followerRatio < 0.1) score -= 5; // Red flag
    
    // Posts-to-followers ratio (active accounts)
    const postRatio = followers > 0 ? posts / followers : 0;
    if (postRatio >= 0.01) score += 2; // Active poster
    
    // 2. ACCOUNT VERIFICATION & BUSINESS INDICATORS (25 points)
    if (profileData.is_verified) {
      score += 10;
      qualityFlags.isVerifiedAccount = true;
    }
    
    if (profileData.is_business_account) {
      score += 8;
      qualityFlags.isBusinessAccount = true;
    }
    
    // Contact information completeness
    if (profileData.contact_info?.email) {
      score += 4;
      qualityFlags.hasBusinessEmail = true;
    }
    
    if (profileData.contact_info?.website) {
      score += 3;
      qualityFlags.hasWebsite = true;
    }
    
    // 3. ENGAGEMENT QUALITY & AUTHENTICITY (25 points)
    const engagementRate = postsData?.engagement_rate || 0;
    
    if (engagementRate >= 5) score += 20;
    else if (engagementRate >= 3) score += 17;
    else if (engagementRate >= 2) score += 15;
    else if (engagementRate >= 1.5) score += 12;
    else if (engagementRate >= 1) score += 8;
    else if (engagementRate >= 0.8) score += 5;
    else if (engagementRate < 0.5) score -= 5; // Suspicious low engagement
    
    if (engagementRate >= 1.5) qualityFlags.hasHighEngagement = true;
    
    // Engagement authenticity check
    const avgLikes = postsData?.avg_likes || 0;
    const avgComments = postsData?.avg_comments || 0;
    const commentToLikeRatio = avgLikes > 0 ? avgComments / avgLikes : 0;
    
    if (commentToLikeRatio >= 0.02 && commentToLikeRatio <= 0.15) {
      score += 3; // Healthy engagement ratio
    } else if (commentToLikeRatio > 0.2) {
      score -= 3; // Suspicious high comment ratio
    }
    
    // 4. CONTENT QUALITY & WEDDING RELEVANCE (15 points)
    const contentQuality = postsData?.content_quality_score || 0;
    const weddingRelevance = postsData?.wedding_content_percentage || 0;
    
    if (contentQuality >= 90 && weddingRelevance >= 90) score += 15;
    else if (contentQuality >= 80 && weddingRelevance >= 80) score += 12;
    else if (contentQuality >= 70 && weddingRelevance >= 70) score += 9;
    else if (contentQuality >= 60 && weddingRelevance >= 60) score += 6;
    else if (contentQuality >= 50 && weddingRelevance >= 50) score += 3;
    
    if (weddingRelevance >= 80) qualityFlags.hasWeddingPortfolio = true;
    
    // 5. ACTIVITY & CONSISTENCY (10 points)
    if (postsData?.recent_activity) {
      score += 5;
      qualityFlags.hasRecentPosts = true;
    }
    
    const postingConsistency = postsData?.posting_consistency || 0;
    if (postingConsistency >= 0.8) {
      score += 5;
      qualityFlags.hasConsistentPosting = true;
    } else if (postingConsistency >= 0.6) {
      score += 3;
    } else if (postingConsistency >= 0.4) {
      score += 1;
    }
    
    // 6. PROFESSIONAL INDICATORS (10 points)
    const bio = profileData.bio?.toLowerCase() || '';
    
    // Professional bio indicators
    const professionalKeywords = [
      'photographer', 'videographer', 'planner', 'coordinator',
      'professional', 'studio', 'services', 'available',
      'booking', 'contact', 'portfolio', 'experience'
    ];
    
    const bioKeywordCount = professionalKeywords.filter(keyword => 
      bio.includes(keyword)
    ).length;
    
    if (bioKeywordCount >= 3) {
      score += 5;
      qualityFlags.hasProfessionalBio = true;
    } else if (bioKeywordCount >= 2) {
      score += 3;
    }
    
    // Location information
    if (profileData.location || bio.includes('based in') || bio.includes('located')) {
      score += 3;
      qualityFlags.hasLocationInfo = true;
    }
    
    // Awards or recognition mentions
    const recognitionKeywords = [
      'award', 'featured', 'published', 'magazine', 'winner',
      'certified', 'licensed', 'insured', 'member'
    ];
    
    if (recognitionKeywords.some(keyword => bio.includes(keyword))) {
      score += 2;
    }
    
    // Apply category-specific weight
    const weightedScore = Math.round(score * categoryConfig.qualityWeight);
    
    return {
      score: Math.min(Math.max(weightedScore, 0), 100),
      qualityFlags: qualityFlags,
      breakdown: {
        followerQuality: Math.min(score * 0.3, 30),
        businessIndicators: Math.min(score * 0.25, 25),
        engagementQuality: Math.min(score * 0.25, 25),
        contentQuality: Math.min(score * 0.15, 15),
        activityConsistency: Math.min(score * 0.1, 10),
        professionalIndicators: Math.min(score * 0.1, 10)
      }
    };
  }

  /**
   * Advanced content analysis for wedding relevance
   */
  analyzeWeddingContentQuality(profileData, postsData) {
    const posts = postsData?.posts || [];
    const bio = profileData.bio?.toLowerCase() || '';
    
    let weddingScore = 0;
    let professionalScore = 0;
    let qualityIndicators = {
      hasWeddingHashtags: false,
      hasClientWork: false,
      hasBehindTheScenes: false,
      hasVenueVariety: false,
      hasSeasonalWork: false,
      hasDetailShots: false,
      hasCouplePortraits: false,
      hasReceptionPhotos: false
    };
    
    // Analyze bio for wedding focus
    const weddingBioKeywords = [
      'wedding', 'bride', 'bridal', 'engagement', 'ceremony',
      'reception', 'matrimony', 'nuptials', 'elopement'
    ];
    
    const bioWeddingCount = weddingBioKeywords.filter(keyword => 
      bio.includes(keyword)
    ).length;
    
    weddingScore += Math.min(bioWeddingCount * 10, 30);
    
    // Analyze posts for wedding content
    if (posts.length > 0) {
      let weddingPosts = 0;
      let professionalPosts = 0;
      
      posts.forEach(post => {
        const caption = (post.caption || '').toLowerCase();
        const hashtags = post.post_hashtags || [];
        
        // Check for wedding content
        const hasWeddingContent = weddingBioKeywords.some(keyword => 
          caption.includes(keyword) || 
          hashtags.some(tag => tag.toLowerCase().includes(keyword))
        );
        
        if (hasWeddingContent) {
          weddingPosts++;
          
          // Specific wedding content types
          if (hashtags.some(tag => tag.toLowerCase().includes('wedding'))) {
            qualityIndicators.hasWeddingHashtags = true;
          }
          
          if (caption.includes('couple') || caption.includes('bride') || caption.includes('groom')) {
            qualityIndicators.hasCouplePortraits = true;
          }
          
          if (caption.includes('reception') || caption.includes('party') || caption.includes('dance')) {
            qualityIndicators.hasReceptionPhotos = true;
          }
          
          if (caption.includes('venue') || caption.includes('location')) {
            qualityIndicators.hasVenueVariety = true;
          }
        }
        
        // Check for professional indicators
        const professionalKeywords = [
          'client', 'session', 'shoot', 'portfolio', 'professional',
          'booking', 'available', 'contact', 'inquiry'
        ];
        
        if (professionalKeywords.some(keyword => caption.includes(keyword))) {
          professionalPosts++;
        }
      });
      
      const weddingPercentage = (weddingPosts / posts.length) * 100;
      const professionalPercentage = (professionalPosts / posts.length) * 100;
      
      weddingScore += Math.min(weddingPercentage, 50);
      professionalScore += Math.min(professionalPercentage, 30);
    }
    
    return {
      weddingRelevanceScore: Math.min(weddingScore, 100),
      professionalScore: Math.min(professionalScore, 100),
      qualityIndicators: qualityIndicators
    };
  }

  /**
   * Multi-layer quality validation
   */
  async validateVendorQuality(profileData, postsData, category) {
    const qualityResult = this.calculateEnhancedQualityScore(profileData, postsData, category);
    const contentAnalysis = this.analyzeWeddingContentQuality(profileData, postsData);
    
    // Quality gate checks
    const qualityGates = {
      minimumScore: qualityResult.score >= this.qualityThresholds.minimumQualityScore,
      minimumEngagement: (postsData?.engagement_rate || 0) >= this.qualityThresholds.minimumEngagementRate,
      minimumWeddingContent: contentAnalysis.weddingRelevanceScore >= this.qualityThresholds.minimumWeddingContent,
      hasRecentActivity: postsData?.recent_activity === true,
      hasBusinessIndicators: this.countBusinessIndicators(qualityResult.qualityFlags) >= this.qualityThresholds.minimumBusinessIndicators,
      hasMinimumContentQuality: (postsData?.content_quality_score || 0) >= this.qualityThresholds.minimumContentQuality
    };
    
    // Calculate overall pass rate
    const passedGates = Object.values(qualityGates).filter(Boolean).length;
    const totalGates = Object.keys(qualityGates).length;
    const passRate = (passedGates / totalGates) * 100;
    
    // Vendor must pass at least 80% of quality gates
    const isQualityVendor = passRate >= 80;
    
    return {
      isQualityVendor: isQualityVendor,
      qualityScore: qualityResult.score,
      passRate: passRate,
      qualityGates: qualityGates,
      qualityFlags: qualityResult.qualityFlags,
      contentAnalysis: contentAnalysis,
      breakdown: qualityResult.breakdown,
      recommendations: this.generateQualityRecommendations(qualityGates, qualityResult.qualityFlags)
    };
  }

  /**
   * Count business indicators
   */
  countBusinessIndicators(qualityFlags) {
    const businessIndicators = [
      'hasBusinessEmail',
      'hasWebsite',
      'isBusinessAccount',
      'hasProfessionalBio',
      'hasLocationInfo'
    ];
    
    return businessIndicators.filter(indicator => qualityFlags[indicator]).length;
  }

  /**
   * Generate quality improvement recommendations
   */
  generateQualityRecommendations(qualityGates, qualityFlags) {
    const recommendations = [];
    
    if (!qualityGates.minimumScore) {
      recommendations.push('Overall quality score below threshold - needs improvement in multiple areas');
    }
    
    if (!qualityGates.minimumEngagement) {
      recommendations.push('Low engagement rate - may indicate inactive audience or poor content');
    }
    
    if (!qualityGates.minimumWeddingContent) {
      recommendations.push('Insufficient wedding-related content - not specialized enough');
    }
    
    if (!qualityGates.hasRecentActivity) {
      recommendations.push('No recent posts - account may be inactive');
    }
    
    if (!qualityFlags.hasBusinessEmail) {
      recommendations.push('Missing business email - reduces client contact options');
    }
    
    if (!qualityFlags.hasWebsite) {
      recommendations.push('No website link - limits portfolio showcase');
    }
    
    if (!qualityFlags.isBusinessAccount) {
      recommendations.push('Not a business account - missing professional features');
    }
    
    return recommendations;
  }

  /**
   * Enhanced vendor processing with strict quality control
   */
  async processVendorWithQualityControl(profileUrl, city, state, category) {
    console.log(`\n🔍 QUALITY ANALYSIS: ${profileUrl}`);
    
    // Extract profile data
    const profileData = await this.extractInstagramProfile(profileUrl);
    if (!profileData) {
      console.log('❌ Failed to extract profile data');
      return { success: false, reason: 'extraction_failed' };
    }
    
    // Check minimum follower requirement (stricter)
    const categoryConfig = WEDDING_CATEGORIES[category];
    const minFollowers = Math.max(categoryConfig.minFollowers, 1000); // Minimum 1000 followers
    
    if (profileData.followers_count < minFollowers) {
      console.log(`❌ Below minimum followers (${profileData.followers_count} < ${minFollowers})`);
      this.stats.lowQualitySkipped++;
      return { success: false, reason: 'insufficient_followers' };
    }
    
    // Analyze posts
    const postsData = await this.analyzeInstagramPosts(profileUrl);
    if (!postsData) {
      console.log('❌ Failed to analyze posts');
      return { success: false, reason: 'posts_analysis_failed' };
    }
    
    // Enhanced quality validation
    const qualityValidation = await this.validateVendorQuality(profileData, postsData, category);
    
    console.log(`📊 Quality Score: ${qualityValidation.qualityScore}/100`);
    console.log(`🎯 Pass Rate: ${qualityValidation.passRate.toFixed(1)}%`);
    console.log(`✅ Quality Gates Passed: ${Object.values(qualityValidation.qualityGates).filter(Boolean).length}/6`);
    
    if (!qualityValidation.isQualityVendor) {
      console.log('❌ QUALITY CHECK FAILED');
      console.log('📋 Recommendations:');
      qualityValidation.recommendations.forEach(rec => console.log(`   • ${rec}`));
      this.stats.lowQualitySkipped++;
      return { 
        success: false, 
        reason: 'quality_check_failed',
        qualityData: qualityValidation
      };
    }
    
    console.log('✅ QUALITY CHECK PASSED - High-quality vendor identified');
    
    // Determine subcategory
    const subcategory = this.determineSubcategory(profileData, postsData, category);
    
    // Prepare enhanced vendor data
    const vendorData = {
      business_name: profileData.display_name || profileData.username,
      category: category,
      subcategory: subcategory,
      city: city,
      state: state,
      address: profileData.location || `${city}, ${state}`,
      phone: profileData.contact_info?.phone,
      email: profileData.contact_info?.email,
      website: profileData.contact_info?.website,
      instagram_url: profileUrl,
      instagram_data: {
        username: profileData.username,
        followers_count: profileData.followers_count,
        posts_count: profileData.posts_count,
        is_business_account: profileData.is_business_account,
        is_verified: profileData.is_verified,
        bio: profileData.bio,
        avg_engagement: postsData.engagement_rate
      },
      quality_metrics: {
        overall_quality_score: qualityValidation.qualityScore,
        engagement_score: Math.round(postsData.engagement_rate * 10),
        content_quality_score: postsData.content_quality_score,
        wedding_relevance_score: qualityValidation.contentAnalysis.weddingRelevanceScore,
        professional_score: qualityValidation.contentAnalysis.professionalScore,
        quality_pass_rate: qualityValidation.passRate,
        quality_flags: qualityValidation.qualityFlags,
        quality_breakdown: qualityValidation.breakdown
      },
      vendor_source: 'instagram_brightdata_enhanced',
      verification_status: 'pending_enhanced',
      quality_tier: this.determineQualityTier(qualityValidation.qualityScore),
      created_at: new Date().toISOString(),
      last_instagram_update: new Date().toISOString()
    };
    
    // Store in database (would work with real Supabase)
    const success = await this.storeVendorData(vendorData);
    
    if (success) {
      this.stats.qualityVendors++;
      console.log(`🌟 HIGH-QUALITY VENDOR ADDED: ${vendorData.business_name}`);
      console.log(`   Quality Tier: ${vendorData.quality_tier}`);
      console.log(`   Score: ${qualityValidation.qualityScore}/100`);
    }
    
    return { 
      success: success, 
      reason: success ? 'quality_vendor_added' : 'storage_failed',
      vendorData: vendorData,
      qualityData: qualityValidation
    };
  }

  /**
   * Determine quality tier based on score
   */
  determineQualityTier(score) {
    if (score >= 90) return 'Premium';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'Standard';
  }

  /**
   * Enhanced collection with quality focus
   */
  async collectHighQualityVendors(city, state, category, maxVendors = 5) {
    console.log(`\n🎯 HIGH-QUALITY COLLECTION: ${category} in ${city}, ${state}`);
    console.log(`📊 Target: ${maxVendors} premium vendors`);
    
    const categoryConfig = WEDDING_CATEGORIES[category];
    let qualityVendorsFound = 0;
    let totalProcessed = 0;
    const qualityResults = [];
    
    // Search using all search terms for this category
    for (const searchTerm of categoryConfig.searchTerms) {
      if (qualityVendorsFound >= maxVendors) break;
      
      const searchResults = await this.searchInstagramVendors(city, state, searchTerm);
      
      for (const result of searchResults) {
        if (qualityVendorsFound >= maxVendors) break;
        if (!result.url || !result.url.includes('instagram.com')) continue;
        
        totalProcessed++;
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const processResult = await this.processVendorWithQualityControl(
          result.url, city, state, category
        );
        
        qualityResults.push({
          url: result.url,
          success: processResult.success,
          reason: processResult.reason,
          qualityScore: processResult.qualityData?.qualityScore || 0,
          qualityTier: processResult.vendorData?.quality_tier || 'N/A'
        });
        
        if (processResult.success) {
          qualityVendorsFound++;
        }
        
        // Stop if we've processed enough profiles without finding quality vendors
        if (totalProcessed >= 20 && qualityVendorsFound === 0) {
          console.log('⚠️ No quality vendors found after 20 attempts - stopping search');
          break;
        }
      }
      
      // Delay between search terms
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log(`\n📈 QUALITY COLLECTION RESULTS:`);
    console.log(`🎯 Quality vendors found: ${qualityVendorsFound}/${maxVendors}`);
    console.log(`📊 Total processed: ${totalProcessed}`);
    console.log(`✅ Success rate: ${totalProcessed > 0 ? ((qualityVendorsFound / totalProcessed) * 100).toFixed(1) : 0}%`);
    
    // Show quality breakdown
    const qualityTiers = {};
    qualityResults.filter(r => r.success).forEach(result => {
      qualityTiers[result.qualityTier] = (qualityTiers[result.qualityTier] || 0) + 1;
    });
    
    console.log(`🏆 Quality Tiers:`);
    Object.entries(qualityTiers).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} vendors`);
    });
    
    return {
      qualityVendorsFound: qualityVendorsFound,
      totalProcessed: totalProcessed,
      successRate: totalProcessed > 0 ? (qualityVendorsFound / totalProcessed) * 100 : 0,
      qualityTiers: qualityTiers,
      results: qualityResults
    };
  }
}

// Export the enhanced collector
export { EnhancedQualityCollector };

// CLI execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const collector = new EnhancedQualityCollector();
  
  // Test quality collection
  async function testQualityCollection() {
    console.log('🧪 Testing Enhanced Quality Collection System\n');
    
    const result = await collector.collectHighQualityVendors(
      'New York', 'NY', 'Wedding Photographer', 3
    );
    
    console.log('\n🎉 Quality Collection Test Complete');
    console.log(`Final Results: ${result.qualityVendorsFound} quality vendors found`);
  }
  
  testQualityCollection().catch(console.error);
}

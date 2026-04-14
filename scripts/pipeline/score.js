/**
 * Scoring Module
 * Assigns quality scores and vendor tiers to normalized vendor data.
 */

export class VendorScorer {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Score and tag a batch of normalized vendors
   * @param {Array} vendors - Normalized vendor records
   * @returns {Array} Vendors with quality_score and vendor_tier assigned
   */
  scoreAll(vendors) {
    this.logger.info(`Scoring ${vendors.length} vendors`);

    const scored = vendors.map(vendor => {
      const score = this._calculateQualityScore(vendor);
      const tier = this._assignTier(score, vendor);

      return {
        ...vendor,
        quality_score: score,
        vendor_tier: tier
      };
    });

    // Log tier distribution
    const tierCounts = scored.reduce((acc, v) => {
      acc[v.vendor_tier] = (acc[v.vendor_tier] || 0) + 1;
      return acc;
    }, {});

    const avgScore = scored.length
      ? (scored.reduce((s, v) => s + v.quality_score, 0) / scored.length).toFixed(1)
      : 0;

    this.logger.success('Scoring complete', {
      average_score: avgScore,
      tiers: tierCounts
    });

    return scored;
  }

  /**
   * Calculate a composite quality score (0-100)
   *
   * Weights:
   *   Followers:     30%
   *   Engagement:    25%
   *   Completeness:  25%
   *   Content:       20%
   */
  _calculateQualityScore(vendor) {
    const followerScore = this._followerScore(vendor.follower_count || 0);
    const engagementScore = this._engagementScore(vendor.engagement_score || 0);
    const completenessScore = this._completenessScore(vendor);
    const contentScore = this._contentScore(vendor);

    const weighted =
      followerScore * 0.30 +
      engagementScore * 0.25 +
      completenessScore * 0.25 +
      contentScore * 0.20;

    return Math.round(weighted * 100) / 100;
  }

  /** Followers: logarithmic scale, peaks at ~100k */
  _followerScore(count) {
    if (count <= 0) return 0;
    // log10(500) ≈ 2.7, log10(100000) ≈ 5
    const score = (Math.log10(count) - 2.5) / 2.5 * 100;
    return Math.max(0, Math.min(100, score));
  }

  /** Engagement rate: 1-3% is good, >5% is excellent */
  _engagementScore(rate) {
    if (rate <= 0) return 0;
    if (rate >= 5) return 100;
    if (rate >= 3) return 80 + (rate - 3) * 10;
    if (rate >= 1) return 40 + (rate - 1) * 20;
    return rate * 40;
  }

  /** Profile completeness: bio, email, phone, website, images */
  _completenessScore(vendor) {
    let score = 0;
    if (vendor.bio) score += 20;
    if (vendor.email) score += 25;
    if (vendor.phone) score += 15;
    if (vendor.website_url) score += 25;
    if (vendor.images?.length >= 3) score += 15;
    else if (vendor.images?.length >= 1) score += 8;
    return score;
  }

  /** Content quality: post count and verified status */
  _contentScore(vendor) {
    let score = 0;
    const posts = vendor.post_count || 0;

    if (posts >= 500) score += 50;
    else if (posts >= 200) score += 40;
    else if (posts >= 100) score += 30;
    else if (posts >= 50) score += 20;
    else if (posts >= 20) score += 10;

    if (vendor.is_verified) score += 30;
    if (vendor.is_business_account) score += 20;

    return Math.min(score, 100);
  }

  /** Assign tier based on quality score */
  _assignTier(score, vendor) {
    // Top vendor: score >= 70 OR verified with high followers
    if (score >= 70 || (vendor.is_verified && (vendor.follower_count || 0) > 10000)) {
      return 'top_vendor';
    }

    // Rising vendor: score >= 40 with decent engagement
    if (score >= 40 && (vendor.engagement_score || 0) >= 1.5) {
      return 'rising_vendor';
    }

    return 'standard';
  }
}

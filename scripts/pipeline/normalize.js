/**
 * Normalization Module
 * Cleans, validates, and normalizes enriched vendor data before storage.
 */

import { CATEGORIES, DEFAULTS } from './config.js';

// Valid US states (abbreviations)
const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY'
]);

export class VendorNormalizer {
  constructor(logger) {
    this.logger = logger;
    this.seen = new Map(); // handle -> true (dedup tracker)
    this.stats = { total: 0, passed: 0, filtered: 0, duplicates: 0 };
  }

  /**
   * Normalize a batch of enriched profiles
   * @returns {Array} Normalized, deduplicated vendor records ready for DB
   */
  normalize(enrichedProfiles) {
    this.logger.info(`Normalizing ${enrichedProfiles.length} enriched profiles`);
    const results = [];

    for (const profile of enrichedProfiles) {
      this.stats.total++;

      // Dedup by username
      const handle = profile.username?.toLowerCase();
      if (!handle) {
        this.stats.filtered++;
        continue;
      }

      if (this.seen.has(handle)) {
        this.stats.duplicates++;
        continue;
      }

      // Filter: skip private accounts
      if (profile.is_private) {
        this.stats.filtered++;
        continue;
      }

      // Filter: minimum followers
      const minFollowers = CATEGORIES[profile.category]?.minFollowers || DEFAULTS.MIN_FOLLOWERS_FILTER;
      if ((profile.follower_count || 0) < minFollowers) {
        this.stats.filtered++;
        continue;
      }

      // Filter: minimum posts
      if ((profile.post_count || 0) < DEFAULTS.MIN_POSTS_FILTER) {
        this.stats.filtered++;
        continue;
      }

      // Filter: must appear to be a business
      const isBusiness = this._isLikelyBusiness(profile);
      if (!isBusiness) {
        this.stats.filtered++;
        continue;
      }

      // Normalize the record
      const category = this._normalizeCategory(profile.dbCategory || profile.category);
      const normalized = {
        instagram_handle: handle,
        business_name: this._cleanBusinessName(profile.display_name || handle),
        bio: this._cleanBio(profile.bio),
        category,
        subcategory: this._inferSubcategory(category, profile.bio, profile.raw_hashtags),
        city: this._normalizeCity(profile.city),
        state: this._normalizeState(profile.state),
        country: profile.country || 'US',
        location: `${this._normalizeCity(profile.city)}, ${this._normalizeState(profile.state)}`,
        email: this._normalizeEmail(profile.email),
        phone: this._normalizePhone(profile.phone),
        website_url: this._normalizeUrl(profile.website_url),
        follower_count: profile.follower_count || 0,
        post_count: profile.post_count || 0,
        profile_image_url: profile.profile_pic_url || null,
        is_verified: profile.is_verified || false,
        is_business_account: profile.is_business_account || false,
        is_business: isBusiness,
        images: this._extractImages(profile.recent_posts),
        hashtags: (profile.raw_hashtags || []).slice(0, 20),
        engagement_score: this._estimateEngagement(profile),
        slug: this._generateSlug(profile),
        source: profile.source || 'instagram',
        claimed: false
      };

      this.seen.set(handle, true);
      this.stats.passed++;
      results.push(normalized);
    }

    this.logger.success(`Normalization complete`, this.stats);
    return results;
  }

  _isLikelyBusiness(profile) {
    // Explicit business account flag
    if (profile.is_business_account) return true;

    // Has contact info
    if (profile.email || profile.phone || profile.website_url) return true;

    // Bio contains business-like keywords
    const bio = (profile.bio || '').toLowerCase();
    const businessKeywords = [
      'book', 'inquir', 'dm for', 'available', 'booking', 'hire',
      'weddings', 'events', 'studio', 'photography', 'videography',
      'planning', 'design', 'floral', 'beauty', 'makeup', 'hair',
      'serving', 'based in', 'located', '@', 'link in bio',
      'photographer', 'planner', 'florist', 'artist', 'venue'
    ];
    if (businessKeywords.some(kw => bio.includes(kw))) return true;

    // High follower count with decent engagement is likely a business
    if ((profile.follower_count || 0) > 2000) return true;

    return false;
  }

  _cleanBusinessName(name) {
    if (!name) return '';
    // Remove emojis and excessive special chars, trim
    return name
      .replace(/[\u{1F600}-\u{1F9FF}]/gu, '')
      .replace(/[|•·]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
  }

  _cleanBio(bio) {
    if (!bio) return null;
    return bio.trim().slice(0, 500);
  }

  _normalizeCategory(category) {
    if (!category) return 'wedding-photographers';
    // Already in db format
    const dbCategories = Object.values(CATEGORIES).map(c => c.dbCategory);
    if (dbCategories.includes(category)) return category;

    // Map from config key
    if (CATEGORIES[category]) return CATEGORIES[category].dbCategory;

    // Fuzzy match
    const lower = category.toLowerCase();
    if (lower.includes('photo')) return 'wedding-photographers';
    if (lower.includes('plan') || lower.includes('coordin')) return 'wedding-planners';
    if (lower.includes('venue')) return 'venues';
    if (lower.includes('flor') || lower.includes('flower')) return 'florists';
    if (lower.includes('makeup') || lower.includes('mua')) return 'makeup-artists';
    if (lower.includes('video') || lower.includes('film') || lower.includes('cinema')) return 'videographers';

    return category;
  }

  _normalizeCity(city) {
    if (!city) return 'Unknown';
    return city.trim().split(' ').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');
  }

  _normalizeState(state) {
    if (!state) return 'Unknown';
    const upper = state.trim().toUpperCase();
    if (US_STATES.has(upper)) return upper;

    // Common full names
    const stateMap = {
      'texas': 'TX', 'california': 'CA', 'new york': 'NY', 'florida': 'FL',
      'georgia': 'GA', 'washington': 'WA', 'illinois': 'IL', 'massachusetts': 'MA',
      'colorado': 'CO', 'tennessee': 'TN', 'oregon': 'OR', 'arizona': 'AZ',
      'minnesota': 'MN', 'north carolina': 'NC', 'pennsylvania': 'PA',
      'nevada': 'NV', 'virginia': 'VA', 'michigan': 'MI', 'ohio': 'OH'
    };
    return stateMap[state.trim().toLowerCase()] || upper;
  }

  _normalizeEmail(email) {
    if (!email) return null;
    const cleaned = email.trim().toLowerCase();
    // Basic email validation
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return cleaned;
    return null;
  }

  _normalizePhone(phone) {
    if (!phone) return null;
    // Strip non-digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) return phone.trim();
    return null;
  }

  _normalizeUrl(url) {
    if (!url) return null;
    let cleaned = url.trim();
    if (!cleaned.startsWith('http')) cleaned = `https://${cleaned}`;
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      return null;
    }
  }

  _extractImages(recentPosts) {
    if (!recentPosts?.length) return [];
    return recentPosts
      .slice(0, 3)
      .map(p => p.url)
      .filter(Boolean);
  }

  _estimateEngagement(profile) {
    if (!profile.recent_posts?.length || !profile.follower_count) return 0;

    const posts = profile.recent_posts.slice(0, 5);
    const totalInteractions = posts.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0), 0);
    const avgInteractions = totalInteractions / posts.length;
    const rate = (avgInteractions / profile.follower_count) * 100;

    // Cap at 100
    return Math.min(Math.round(rate * 100) / 100, 100);
  }

  _inferSubcategory(category, bio, hashtags) {
    const text = ((bio || '') + ' ' + (hashtags || []).join(' ')).toLowerCase();

    const subcategoryMap = {
      'wedding-photographers': [
        { match: ['photojournalis', 'candid', 'storytell', 'documentary'], value: 'Photojournalistic' },
        { match: ['fine art', 'editorial', 'artistic'], value: 'Fine Art' },
        { match: ['drone', 'aerial'], value: 'Aerial Photography' },
        { match: ['engagement', 'pre-wedding'], value: 'Engagement Specialists' },
        { match: ['traditional', 'classic', 'portrait', 'formal'], value: 'Traditional Photography' }
      ],
      'wedding-planners': [
        { match: ['full service', 'full-service', 'a to z', 'start to finish'], value: 'Full-Service Planning' },
        { match: ['day of', 'day-of', 'coordination'], value: 'Day-of Coordination' },
        { match: ['destination'], value: 'Destination Wedding Planning' },
        { match: ['partial', 'month-of'], value: 'Partial Planning' },
        { match: ['cultural', 'indian', 'south asian', 'nigerian', 'jewish'], value: 'Cultural Wedding Specialists' }
      ],
      'florists': [
        { match: ['modern', 'contemporary', 'unique'], value: 'Modern Arrangements' },
        { match: ['classic', 'traditional', 'timeless'], value: 'Classic/Traditional' },
        { match: ['rustic', 'bohemian', 'boho', 'wildflower'], value: 'Rustic/Bohemian' },
        { match: ['minimalist', 'minimal', 'simple'], value: 'Minimalist' },
        { match: ['luxury', 'extravag', 'opulent', 'high-end'], value: 'Luxury/Extravagant' }
      ],
      'venues': [
        { match: ['ballroom'], value: 'Ballrooms' },
        { match: ['barn', 'farm', 'ranch'], value: 'Barns & Farms' },
        { match: ['beach', 'waterfront', 'lakeside', 'ocean'], value: 'Beach/Waterfront' },
        { match: ['garden', 'park', 'outdoor'], value: 'Gardens & Parks' },
        { match: ['historic', 'historical', 'heritage', 'mansion'], value: 'Historic Buildings' },
        { match: ['hotel', 'resort'], value: 'Hotels & Resorts' },
        { match: ['winery', 'vineyard'], value: 'Wineries & Vineyards' },
        { match: ['industrial', 'loft', 'warehouse'], value: 'Industrial Spaces' }
      ],
      'videographers': [
        { match: ['cinematic', 'cinema'], value: 'Cinematic' },
        { match: ['documentary', 'storytell'], value: 'Documentary' },
        { match: ['highlight', 'reel'], value: 'Highlight Reels' }
      ],
      'makeup-artists': [
        { match: ['airbrush'], value: 'Airbrush' },
        { match: ['natural', 'organic'], value: 'Natural/Organic' },
        { match: ['glamour', 'glam', 'editorial'], value: 'Glamour/Editorial' }
      ]
    };

    const rules = subcategoryMap[category];
    if (!rules) return null;

    for (const rule of rules) {
      if (rule.match.some(keyword => text.includes(keyword))) {
        return rule.value;
      }
    }

    // Default subcategory per category
    const defaults = {
      'wedding-photographers': 'Traditional Photography',
      'wedding-planners': 'Full-Service Planning',
      'florists': 'Classic/Traditional',
      'venues': null,
      'videographers': 'Cinematic',
      'makeup-artists': null
    };
    return defaults[category] || null;
  }

  _generateSlug(profile) {
    const city = (profile.city || 'unknown').toLowerCase().replace(/\s+/g, '-');
    const category = (profile.dbCategory || profile.category || 'vendor')
      .replace('wedding-', '')
      .replace(/s$/, '');
    const name = (profile.display_name || profile.username || 'vendor')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40);

    return `${city}-${category}-${name}`;
  }
}

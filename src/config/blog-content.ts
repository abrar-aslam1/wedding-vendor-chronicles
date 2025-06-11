export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  readTime: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  color: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'planning-guides',
    name: 'Planning Guides',
    slug: 'planning-guides',
    description: 'Comprehensive guides to help you plan every aspect of your wedding',
    seoTitle: 'Wedding Planning Guides | Expert Tips & Advice',
    seoDescription: 'Expert wedding planning guides covering everything from budgeting to vendor selection. Get professional tips to plan your perfect wedding day.',
    color: 'blue'
  },
  {
    id: 'vendor-selection',
    name: 'Vendor Selection',
    slug: 'vendor-selection',
    description: 'Tips and advice for choosing the right wedding vendors',
    seoTitle: 'Wedding Vendor Selection Guide | How to Choose the Best Vendors',
    seoDescription: 'Learn how to select the best wedding vendors for your special day. Expert tips on choosing photographers, venues, caterers, and more.',
    color: 'purple'
  },
  {
    id: 'budget-tips',
    name: 'Budget & Money',
    slug: 'budget-tips',
    description: 'Smart strategies for wedding budgeting and cost management',
    seoTitle: 'Wedding Budget Tips | Save Money on Your Wedding',
    seoDescription: 'Practical wedding budget tips and money-saving strategies. Learn how to plan a beautiful wedding without breaking the bank.',
    color: 'green'
  },
  {
    id: 'trends',
    name: 'Wedding Trends',
    slug: 'trends',
    description: 'Latest wedding trends and style inspiration',
    seoTitle: 'Wedding Trends 2025 | Latest Styles & Ideas',
    seoDescription: 'Discover the latest wedding trends for 2025. Get inspiration for colors, themes, decor, and styles for your modern wedding.',
    color: 'pink'
  },
  {
    id: 'real-weddings',
    name: 'Real Weddings',
    slug: 'real-weddings',
    description: 'Real wedding stories and inspiration from couples',
    seoTitle: 'Real Wedding Stories | Wedding Inspiration & Ideas',
    seoDescription: 'Get inspired by real wedding stories from couples around the country. See photos, vendor details, and planning tips from actual weddings.',
    color: 'orange'
  },
  {
    id: 'seasonal',
    name: 'Seasonal Weddings',
    slug: 'seasonal',
    description: 'Season-specific wedding planning advice and ideas',
    seoTitle: 'Seasonal Wedding Ideas | Spring, Summer, Fall & Winter Weddings',
    seoDescription: 'Seasonal wedding planning guides for spring, summer, fall, and winter weddings. Get ideas for seasonal themes, colors, and decor.',
    color: 'teal'
  }
];

export const FEATURED_BLOG_POSTS: BlogPost[] = [
  {
    id: 'ultimate-wedding-planning-timeline',
    title: 'The Ultimate Wedding Planning Timeline: 12 Months to "I Do"',
    slug: 'ultimate-wedding-planning-timeline',
    excerpt: 'A comprehensive month-by-month guide to planning your perfect wedding, from engagement to walking down the aisle.',
    content: `Planning a wedding can feel overwhelming, but with the right timeline, you can stay organized and stress-free. This comprehensive guide breaks down everything you need to do in the 12 months leading up to your big day.

## 12 Months Before Your Wedding

### Set Your Budget
Before you do anything else, determine your wedding budget. This will guide every decision you make. Consider:
- Total amount you can spend
- Priority areas (venue, photography, etc.)
- Emergency fund (10-15% of total budget)

### Choose Your Date and Venue
Your venue often determines your date, so start here:
- Research venues in your area
- Consider seasonal pricing
- Book your top choice immediately

### Start Your Guest List
Create a preliminary guest list to help determine:
- Venue size requirements
- Catering needs
- Budget allocation

## 10-11 Months Before

### Book Major Vendors
Secure your most important vendors:
- Photographer and videographer
- Caterer or reception venue
- Wedding planner (if using one)
- Band or DJ

### Send Save-the-Dates
Give guests plenty of notice, especially for:
- Destination weddings
- Holiday weekends
- Peak wedding season dates

## 8-9 Months Before

### Choose Your Wedding Party
Select your bridesmaids and groomsmen:
- Consider close friends and family
- Think about logistics and costs for them
- Have honest conversations about expectations

### Start Dress Shopping
Begin looking for your wedding dress:
- Research styles and designers
- Book appointments at bridal salons
- Allow time for alterations (3-6 months)

## 6-7 Months Before

### Book Remaining Vendors
Secure your remaining vendors:
- Florist
- Hair and makeup artists
- Transportation
- Officiant

### Plan Your Menu
Work with your caterer to:
- Schedule tastings
- Finalize menu selections
- Discuss dietary restrictions

## 4-5 Months Before

### Send Invitations
Mail your wedding invitations:
- Include RSVP deadline (3-4 weeks before wedding)
- Provide wedding website information
- Include accommodation details for out-of-town guests

### Finalize Details
Confirm details with all vendors:
- Timeline for the day
- Setup and breakdown procedures
- Final headcount requirements

## 2-3 Months Before

### Final Fittings
Complete dress alterations and fittings:
- Bring your wedding shoes and undergarments
- Schedule final fitting 1-2 weeks before wedding
- Arrange for dress pickup or delivery

### Confirm Guest Count
Follow up on RSVPs and provide final numbers to:
- Caterer
- Venue
- Transportation

## 1 Month Before

### Final Vendor Confirmations
Confirm all details with vendors:
- Timeline and logistics
- Payment schedules
- Emergency contact information

### Prepare for the Honeymoon
If traveling after the wedding:
- Confirm reservations
- Arrange for house/pet sitting
- Pack honeymoon bags

## 1 Week Before

### Delegate Responsibilities
Assign tasks to wedding party and family:
- Setup and breakdown duties
- Vendor coordination
- Guest assistance

### Relax and Prepare
Take care of yourself:
- Get plenty of sleep
- Stay hydrated
- Practice stress-relief techniques

## Wedding Day

### Trust Your Team
Let your vendors and wedding party handle the details while you focus on enjoying your special day.

Remember, this timeline is a guide. Adjust it based on your specific needs and circumstances. The most important thing is to stay organized and enjoy the process of planning your dream wedding!`,
    author: 'Sarah Johnson',
    publishedDate: '2025-01-15',
    category: 'planning-guides',
    tags: ['wedding planning', 'timeline', 'organization', 'checklist'],
    readTime: 8,
    seoTitle: 'Ultimate Wedding Planning Timeline | 12-Month Wedding Checklist',
    seoDescription: 'Complete 12-month wedding planning timeline with month-by-month checklist. Stay organized and stress-free with our comprehensive wedding planning guide.',
    seoKeywords: ['wedding planning timeline', 'wedding checklist', 'wedding planning guide', '12 month wedding timeline', 'wedding organization']
  },
  {
    id: 'how-to-choose-wedding-photographer',
    title: 'How to Choose the Perfect Wedding Photographer: A Complete Guide',
    slug: 'how-to-choose-wedding-photographer',
    excerpt: 'Everything you need to know about selecting a wedding photographer who will capture your special day perfectly.',
    content: `Your wedding photographer will capture the memories that last a lifetime. Here's how to choose the perfect one for your special day.

## Understanding Photography Styles

### Traditional/Classic Photography
- Formal, posed shots
- Classic compositions
- Timeless appeal
- Great for family portraits

### Photojournalistic/Documentary Style
- Candid, unposed moments
- Storytelling approach
- Natural emotions
- Minimal direction from photographer

### Fine Art Photography
- Artistic, creative compositions
- Emphasis on lighting and mood
- Often includes dramatic elements
- Gallery-worthy images

### Contemporary/Modern Style
- Mix of posed and candid shots
- Creative use of lighting
- Modern editing techniques
- Trendy compositions

## Questions to Ask Potential Photographers

### Experience and Background
- How long have you been photographing weddings?
- How many weddings do you shoot per year?
- Do you have experience with my venue?
- Can you provide references from recent clients?

### Style and Approach
- How would you describe your photography style?
- How do you handle low-light situations?
- Do you use flash during ceremonies?
- How much direction do you provide during photos?

### Logistics and Planning
- Will you visit the venue before the wedding?
- How do you handle timeline planning?
- Do you work with an assistant or second shooter?
- What happens if you're sick on my wedding day?

### Packages and Pricing
- What's included in your packages?
- How many edited photos will I receive?
- What's the turnaround time for photos?
- Do you offer engagement sessions?

## Red Flags to Watch For

### Poor Communication
- Slow to respond to emails or calls
- Vague answers to specific questions
- Unprofessional behavior during meetings

### Limited Portfolio
- Few wedding examples
- Inconsistent quality across different lighting
- No examples from venues similar to yours

### Unrealistic Promises
- Guaranteeing specific shots
- Promising unrealistic turnaround times
- Offering prices significantly below market rate

## Making Your Final Decision

### Review Contracts Carefully
- Understand what's included
- Check cancellation policies
- Verify delivery timelines
- Ensure copyright terms are clear

### Trust Your Instincts
- Choose someone you feel comfortable with
- Consider personality fit
- Ensure they understand your vision
- Feel confident in their abilities

### Consider the Investment
- Photography is one area not to skimp on
- These images will last forever
- Quality equipment and experience matter
- Factor in the value of their time and expertise

## Tips for Working with Your Photographer

### Before the Wedding
- Share your vision and must-have shots
- Provide a detailed timeline
- Introduce them to key family members
- Discuss any restrictions or concerns

### On Your Wedding Day
- Trust their expertise
- Stay relaxed and natural
- Communicate any last-minute changes
- Enjoy the process

Remember, your wedding photographer is documenting one of the most important days of your life. Take time to research, meet with candidates, and choose someone who aligns with your vision and makes you feel comfortable. The right photographer will not only capture beautiful images but will also help make your wedding day run smoothly.`,
    author: 'Michael Chen',
    publishedDate: '2025-01-10',
    category: 'vendor-selection',
    tags: ['wedding photography', 'vendor selection', 'photographer tips', 'wedding planning'],
    readTime: 10,
    seoTitle: 'How to Choose a Wedding Photographer | Complete Selection Guide',
    seoDescription: 'Learn how to choose the perfect wedding photographer with our comprehensive guide. Tips on styles, questions to ask, and what to look for.',
    seoKeywords: ['wedding photographer', 'choose wedding photographer', 'wedding photography tips', 'photographer selection', 'wedding vendor']
  },
  {
    id: 'wedding-budget-breakdown-guide',
    title: 'Wedding Budget Breakdown: How to Allocate Your Wedding Funds',
    slug: 'wedding-budget-breakdown-guide',
    excerpt: 'A detailed guide on how to allocate your wedding budget across different categories to get the most value for your money.',
    content: `Creating a wedding budget can be overwhelming, but understanding how to allocate your funds will help you make informed decisions and avoid overspending.

## Average Wedding Budget Breakdown

### Venue and Catering (40-50%)
This is typically your largest expense:
- Reception venue rental
- Catering and bar service
- Service fees and gratuities
- Linens, tables, and chairs (if not included)

### Photography and Videography (10-15%)
Capturing your memories:
- Wedding photographer
- Videographer (optional)
- Engagement session
- Photo albums and prints

### Attire and Beauty (8-10%)
Looking your best:
- Wedding dress and alterations
- Groom's attire
- Hair and makeup
- Accessories and shoes

### Flowers and Decor (8-10%)
Setting the scene:
- Bridal bouquet and boutonnieres
- Ceremony decorations
- Reception centerpieces
- Additional floral arrangements

### Music and Entertainment (8-10%)
Keeping guests entertained:
- DJ or band
- Sound system rental
- Special lighting
- Additional entertainment

### Transportation (3-5%)
Getting there in style:
- Wedding day transportation
- Guest transportation (if needed)
- Parking fees

### Stationery (2-3%)
Communicating with guests:
- Save-the-dates
- Wedding invitations
- Programs and menus
- Thank you cards

### Miscellaneous (5-10%)
Everything else:
- Wedding favors
- Guest accommodations
- Wedding insurance
- Emergency fund

## Money-Saving Tips by Category

### Venue and Catering
- Consider off-peak dates and times
- Look for venues with inclusive packages
- Limit the bar selection
- Choose seasonal menu options

### Photography
- Book during off-season
- Consider newer photographers building portfolios
- Opt for digital-only packages
- Limit hours of coverage

### Attire and Beauty
- Shop sample sales and trunk shows
- Consider renting formal wear
- Do your own hair or makeup
- Buy accessories online

### Flowers and Decor
- Use seasonal flowers
- Repurpose ceremony flowers at reception
- DIY some decorations
- Rent instead of buying

## Creating Your Personal Budget

### Step 1: Determine Your Total Budget
Consider:
- Your savings
- Family contributions
- Timeline for saving additional funds

### Step 2: Prioritize Your Must-Haves
Identify what's most important to you:
- Amazing photography
- Dream venue
- Live band
- Designer dress

### Step 3: Allocate Funds
Use the percentages as a starting point, but adjust based on your priorities.

### Step 4: Track Everything
Use a spreadsheet or budgeting app to:
- Track estimates vs. actual costs
- Monitor payments and due dates
- Identify areas where you're over/under budget

## Common Budget Mistakes to Avoid

### Forgetting Hidden Costs
- Service fees and gratuities
- Taxes
- Overtime charges
- Delivery and setup fees

### Not Having a Contingency Fund
- Set aside 10-15% for unexpected expenses
- Last-minute additions
- Emergency situations

### Overspending Early
- Don't blow your budget on the first vendor you book
- Get quotes from multiple vendors
- Negotiate when possible

## Sample Budget Scenarios

### $20,000 Wedding
- Venue/Catering: $8,000-10,000
- Photography: $2,000-3,000
- Attire/Beauty: $1,600-2,000
- Flowers/Decor: $1,600-2,000
- Music: $1,600-2,000
- Other: $3,200-4,000

### $50,000 Wedding
- Venue/Catering: $20,000-25,000
- Photography: $5,000-7,500
- Attire/Beauty: $4,000-5,000
- Flowers/Decor: $4,000-5,000
- Music: $4,000-5,000
- Other: $8,000-12,500

Remember, these are guidelines, not rules. Your budget should reflect your priorities and financial situation. The most important thing is to create a realistic budget and stick to it while planning the wedding of your dreams.`,
    author: 'Emily Rodriguez',
    publishedDate: '2025-01-05',
    category: 'budget-tips',
    tags: ['wedding budget', 'budget planning', 'wedding costs', 'money saving'],
    readTime: 12,
    seoTitle: 'Wedding Budget Breakdown Guide | How to Allocate Wedding Funds',
    seoDescription: 'Complete wedding budget breakdown guide with percentages, tips, and sample budgets. Learn how to allocate your wedding funds effectively.',
    seoKeywords: ['wedding budget', 'wedding budget breakdown', 'wedding costs', 'budget allocation', 'wedding planning budget']
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return FEATURED_BLOG_POSTS.find(post => post.slug === slug);
};

export const getBlogPostsByCategory = (categorySlug: string): BlogPost[] => {
  return FEATURED_BLOG_POSTS.filter(post => post.category === categorySlug);
};

export const getCategoryBySlug = (slug: string): BlogCategory | undefined => {
  return BLOG_CATEGORIES.find(category => category.slug === slug);
};

export const getRelatedPosts = (currentPost: BlogPost, limit: number = 3): BlogPost[] => {
  return FEATURED_BLOG_POSTS
    .filter(post => post.id !== currentPost.id && post.category === currentPost.category)
    .slice(0, limit);
};

// SEO-optimized blog post meta descriptions
export const generateBlogPostMetaDescription = (post: BlogPost): string => {
  return post.seoDescription || `${post.excerpt.substring(0, 140)}...`;
};

// Generate blog post keywords
export const generateBlogPostKeywords = (post: BlogPost): string => {
  const baseKeywords = post.seoKeywords || post.tags;
  return baseKeywords.join(', ');
};

// Generate category-specific content
export const generateCategoryContent = (category: BlogCategory): string => {
  const posts = getBlogPostsByCategory(category.slug);
  return `Explore our comprehensive collection of ${category.name.toLowerCase()} with ${posts.length} expert articles covering everything you need to know about ${category.description.toLowerCase()}.`;
};

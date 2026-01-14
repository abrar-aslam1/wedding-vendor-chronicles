export const SEOContent = () => {
  return (
    <div className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main SEO Content Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-wedding-text text-center mb-6">
            Find the Perfect Wedding Vendors for Your Special Day
          </h2>
          <div className="prose prose-lg max-w-none text-wedding-text/80 space-y-4">
            <p>
              Welcome to Wedding Vendor Chronicles, your trusted platform for discovering and connecting with top-rated wedding professionals across the United States. Whether you're planning an intimate ceremony or a grand celebration, we help you find the perfect photographers, videographers, florists, planners, venues, caterers, and more to bring your dream wedding to life.
            </p>
            <p>
              Our comprehensive directory features thousands of verified wedding vendors in all 50 states, each carefully curated to ensure quality and professionalism. From major metropolitan areas to charming small towns, we connect couples with local experts who understand your vision and can execute it flawlessly.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-wedding-text text-center mb-12">
            How Wedding Vendor Chronicles Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-wedding-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-wedding-text mb-3">
                Search by Location
              </h3>
              <p className="text-wedding-text/70">
                Use your current location or manually select your city and state to find local wedding vendors near you. Our smart location detection makes it easy to discover professionals in your area.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-wedding-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-wedding-text mb-3">
                Browse Categories
              </h3>
              <p className="text-wedding-text/70">
                Explore our extensive categories including photographers, videographers, florists, wedding planners, venues, caterers, DJs, makeup artists, hair stylists, cake designers, decorators, and bridal shops.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-wedding-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💌</span>
              </div>
              <h3 className="text-xl font-semibold text-wedding-text mb-3">
                Connect & Book
              </h3>
              <p className="text-wedding-text/70">
                View detailed profiles, portfolios, reviews, and pricing. Contact vendors directly through our platform to check availability and book your wedding services with confidence.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Categories Section - SEO Keywords */}
        <section className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-wedding-text text-center mb-8">
            Popular Wedding Vendor Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Wedding Photographers",
                description: "Capture your special moments with professional wedding photography. Find documentary, fine art, traditional, and destination wedding photographers.",
              },
              {
                title: "Wedding Videographers",
                description: "Preserve your memories with cinematic wedding videography. Browse videographers specializing in same-day edits, drone footage, and live streaming.",
              },
              {
                title: "Wedding Florists",
                description: "Create stunning floral arrangements for your ceremony and reception. Discover luxury, bohemian, modern, and sustainable wedding florists.",
              },
              {
                title: "Wedding Planners",
                description: "Reduce stress with expert wedding planning services. Find full-service planners, day-of coordinators, and destination wedding specialists.",
              },
              {
                title: "Wedding Venues",
                description: "Find your perfect ceremony and reception location. Explore barn, beach, garden, ballroom, vineyard, and historic wedding venues.",
              },
              {
                title: "Wedding Caterers",
                description: "Delight your guests with exceptional wedding catering. Search for farm-to-table, ethnic cuisine, vegan, and specialty dietary caterers.",
              },
            ].map((category) => (
              <div key={category.title} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-wedding-text mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-wedding-text/70">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage Section */}
        <section className="max-w-4xl mx-auto mb-16 bg-wedding-light/30 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-wedding-text text-center mb-6">
            Nationwide Wedding Vendor Directory
          </h2>
          <p className="text-wedding-text/80 text-center mb-6">
            Wedding Vendor Chronicles serves couples across all 50 states, connecting you with local wedding professionals in major cities and small towns alike. Our platform features vendors in:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-wedding-text/70">
            {[
              "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
              "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
              "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle",
              "Denver", "Boston", "Nashville", "Portland", "Las Vegas", "Detroit",
              "Memphis", "Louisville", "Milwaukee", "Baltimore", "Miami", "Atlanta",
              "And 1000+ more cities..."
            ].map((city) => (
              <div key={city} className="text-center">
                {city}
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-wedding-text text-center mb-12">
            Why Choose Wedding Vendor Chronicles
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Verified Professionals",
                description: "All vendors on our platform are verified and vetted to ensure quality service for your wedding day.",
              },
              {
                title: "Comprehensive Reviews",
                description: "Read authentic reviews from real couples to make informed decisions about your wedding vendors.",
              },
              {
                title: "Transparent Pricing",
                description: "View vendor pricing, packages, and availability upfront with no hidden fees or surprises.",
              },
              {
                title: "Personalized Matching",
                description: "Our Match Me feature helps you find vendors that align with your style, budget, and wedding vision.",
              },
              {
                title: "Easy Communication",
                description: "Contact multiple vendors, compare quotes, and manage all your wedding vendor communications in one place.",
              },
              {
                title: "Free to Use",
                description: "Search, browse, and connect with wedding vendors completely free. No membership fees or hidden charges.",
              },
            ].map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-wedding-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-wedding-primary text-xl">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-wedding-text mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-wedding-text/70">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-wedding-text text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "How do I find wedding vendors near me?",
                answer: "Simply click 'Use My Location' on our homepage to automatically detect your location, or manually select your city and state. Then browse by vendor category to see local professionals in your area.",
              },
              {
                question: "Is Wedding Vendor Chronicles free to use?",
                answer: "Yes! Wedding Vendor Chronicles is completely free for couples planning their wedding. You can search, browse, and contact as many vendors as you need without any fees.",
              },
              {
                question: "How are vendors verified?",
                answer: "All vendors go through our verification process which includes business license validation, portfolio review, and reference checks to ensure quality and professionalism.",
              },
              {
                question: "Can I see vendor pricing before contacting them?",
                answer: "Many vendors display their starting prices and package information on their profiles. For detailed quotes, you can contact vendors directly through our platform.",
              },
              {
                question: "What types of wedding vendors can I find?",
                answer: "We feature all essential wedding vendor categories including photographers, videographers, florists, planners, venues, caterers, DJs and bands, cake designers, makeup artists, hair stylists, decorators, and bridal shops.",
              },
              {
                question: "How do I contact a wedding vendor?",
                answer: "Each vendor profile has a contact form where you can send inquiries directly. You'll receive responses via email and can manage all communications through our platform.",
              },
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-lg font-semibold text-wedding-text mb-3">
                  {faq.question}
                </h3>
                <p className="text-wedding-text/70">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

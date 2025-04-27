import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { SocialShare } from "@/components/SocialShare";
import { blogPosts } from "../config/blog-posts";

export default function Blog() {
  const { slug } = useParams();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [slug]);

  // If a slug is provided, show the specific blog post
  if (slug) {
    const post = blogPosts.find(post => post.slug === slug);
    
    if (!post) {
      return (
        <div className="container mx-auto px-4 py-16 mt-16">
          <h1 className="text-3xl font-bold text-center">Blog Post Not Found</h1>
          <p className="text-center mt-4">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <SEOHead
          category="Blog"
          isHomePage={false}
          imageUrl={post.coverImage}
          canonicalUrl={`${window.location.origin}/blog/${post.slug}`}
        />
        <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
          <Link to="/blog" className="inline-flex items-center text-wedding-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all posts
          </Link>
          
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {post.coverImage && (
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {post.author}
                </div>
                {post.category && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    <Link to={`/blog/category/${post.category.toLowerCase().replace(/ /g, '-')}`} className="hover:text-wedding-primary">
                      {post.category}
                    </Link>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-wedding-text mb-6">{post.title}</h1>
              
              <div className="prose prose-wedding max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <SocialShare 
                  title={post.title}
                  url={`${window.location.origin}/blog/${post.slug}`}
                  description={post.excerpt}
                />
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Link 
                        key={tag}
                        to={`/blog/tag/${tag.toLowerCase().replace(/ /g, '-')}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-wedding-primary hover:text-white transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {post.relatedPosts && post.relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-wedding-text mb-6">Related Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {post.relatedPosts.map(relatedSlug => {
                      const relatedPost = blogPosts.find(p => p.slug === relatedSlug);
                      if (!relatedPost) return null;
                      
                      return (
                        <Link 
                          key={relatedPost.slug}
                          to={`/blog/${relatedPost.slug}`}
                          className="group"
                        >
                          <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {relatedPost.coverImage && (
                              <img 
                                src={relatedPost.coverImage} 
                                alt={relatedPost.title} 
                                className="w-full h-40 object-cover"
                              />
                            )}
                            <div className="p-4">
                              <h4 className="font-semibold text-wedding-text group-hover:text-wedding-primary transition-colors">
                                {relatedPost.title}
                              </h4>
                              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {relatedPost.excerpt}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </>
    );
  }

  // If no slug is provided, show the blog index page
  return (
    <>
      <SEOHead
        category="Blog"
        isHomePage={false}
        canonicalUrl={`${window.location.origin}/blog`}
      />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-wedding-text">Wedding Planning Blog</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Expert advice, inspiration, and tips to help you plan your perfect wedding day
          </p>
        </div>
        
        {/* Featured post */}
        {blogPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-wedding-text mb-6">Featured Article</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={blogPosts[0].coverImage} 
                    alt={blogPosts[0].title} 
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(blogPosts[0].date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-wedding-text mb-4">
                    <Link to={`/blog/${blogPosts[0].slug}`} className="hover:text-wedding-primary">
                      {blogPosts[0].title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-6">{blogPosts[0].excerpt}</p>
                  <Button asChild>
                    <Link to={`/blog/${blogPosts[0].slug}`}>Read More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* All blog posts */}
        <div>
          <h2 className="text-2xl font-bold text-wedding-text mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div key={post.slug} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link to={`/blog/${post.slug}`}>
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <h3 className="text-xl font-bold text-wedding-text mb-3">
                    <Link to={`/blog/${post.slug}`} className="hover:text-wedding-primary">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <Button variant="outline" asChild>
                    <Link to={`/blog/${post.slug}`}>Read More</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Categories section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-wedding-text mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from(new Set(blogPosts.map(post => post.category)))
              .filter(Boolean)
              .map((category: string) => (
                <Link 
                  key={category}
                  to={`/blog/category/${category.toLowerCase().replace(/ /g, '-')}`}
                  className="bg-gray-50 hover:bg-wedding-primary text-gray-700 hover:text-white p-4 rounded-lg text-center transition-colors"
                >
                  {category}
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}

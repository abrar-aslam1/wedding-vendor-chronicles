import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-wedding-light">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/" className="flex items-center gap-2">
              <span>← Back to Home</span>
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-6 text-wedding-text">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="mb-4">Last updated: March 20, 2024</p>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Contact information (name, email address)</li>
                <li>Account credentials</li>
                <li>Search preferences and history</li>
                <li>Communication with vendors through our platform</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide and improve our services</li>
                <li>Connect you with wedding vendors</li>
                <li>Send you updates and marketing communications</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Wedding vendors you choose to connect with</li>
                <li>Service providers who assist our operations</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p>Email: support@findmyweddingvendor.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
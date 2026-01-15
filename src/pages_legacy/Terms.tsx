import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-wedding-light">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/" className="flex items-center gap-2">
              <span>← Back to Home</span>
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-6 text-wedding-text">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="mb-4">Last updated: March 20, 2024</p>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Wedding Vendor Chronicles, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Not use the service for any illegal purposes</li>
                <li>Not interfere with the proper working of the service</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Vendor Listings</h2>
              <p>Wedding Vendor Chronicles:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Does not guarantee the accuracy of vendor information</li>
                <li>Is not responsible for vendor services or conduct</li>
                <li>Reserves the right to remove any listing</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. User Content</h2>
              <p>By submitting content, you:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Grant us the right to use and display the content</li>
                <li>Confirm you have the right to share the content</li>
                <li>Accept responsibility for the content you post</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
              <p>Wedding Vendor Chronicles is not liable for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Any damages arising from use of the service</li>
                <li>Vendor-related disputes or issues</li>
                <li>Loss of data or business interruption</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of new terms.</p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
              <p>For questions about these Terms of Service, please contact:</p>
              <p>Email: support@findmyweddingvendor.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
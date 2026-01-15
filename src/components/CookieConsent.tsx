import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { Button } from './ui/button';

interface CookieConsentProps {
  onAccept?: () => void;
  onReject?: () => void;
}

const COOKIE_CONSENT_KEY = 'wedding-vendor-cookie-consent';
const COOKIE_CONSENT_VERSION = '1.0';

export function CookieConsent({ onAccept, onReject }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consentData = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentData) {
      setShowBanner(true);
    } else {
      try {
        const consent = JSON.parse(consentData);
        if (consent.version !== COOKIE_CONSENT_VERSION) {
          setShowBanner(true);
        }
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAccept = () => {
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: COOKIE_CONSENT_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    onAccept?.();
  };

  const handleReject = () => {
    const consentData = {
      accepted: false,
      timestamp: new Date().toISOString(),
      version: COOKIE_CONSENT_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    onReject?.();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-wedding-primary mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-wedding-text">
                We value your privacy
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your browsing experience, analyze site traffic, 
                and personalize content. By clicking "Accept All", you consent to our use 
                of cookies. Read our{' '}
                <Link 
                  to="/privacy" 
                  className="text-wedding-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>{' '}
                to learn more.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="border-gray-300 hover:bg-gray-50"
            >
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-wedding-primary hover:bg-wedding-primary-dark text-white"
            >
              Accept All
            </Button>
            <button
              onClick={handleReject}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Shield } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface TermsPopupProps {
  onAccept?: () => void;
}

const TERMS_ACCEPTANCE_KEY = 'wedding-vendor-terms-accepted';
const TERMS_VERSION = '1.0';

export function TermsPopup({ onAccept }: TermsPopupProps) {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const acceptanceData = localStorage.getItem(TERMS_ACCEPTANCE_KEY);
    if (!acceptanceData) {
      // Delay showing the popup to avoid overwhelming the user immediately
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      try {
        const acceptance = JSON.parse(acceptanceData);
        if (acceptance.version !== TERMS_VERSION) {
          const timer = setTimeout(() => {
            setShowDialog(true);
          }, 3000);
          return () => clearTimeout(timer);
        }
      } catch {
        const timer = setTimeout(() => {
          setShowDialog(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    const acceptanceData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: TERMS_VERSION,
    };
    localStorage.setItem(TERMS_ACCEPTANCE_KEY, JSON.stringify(acceptanceData));
    setShowDialog(false);
    onAccept?.();
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-wedding-primary/10 rounded-full">
              <Shield className="h-6 w-6 text-wedding-primary" />
            </div>
            <DialogTitle className="text-xl">Welcome to Wedding Vendor Chronicles</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-3">
            <p>
              We're committed to providing you with a safe and trustworthy platform 
              for finding the perfect wedding vendors.
            </p>
            <p>
              Before you continue, please review our terms and policies:
            </p>
            <div className="space-y-2 pt-2">
              <Link
                to="/terms"
                target="_blank"
                className="flex items-center gap-2 text-wedding-primary hover:underline font-medium"
              >
                <FileText className="h-4 w-4" />
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                target="_blank"
                className="flex items-center gap-2 text-wedding-primary hover:underline font-medium"
              >
                <Shield className="h-4 w-4" />
                Privacy Policy
              </Link>
            </div>
            <p className="text-sm text-gray-600 pt-2">
              By continuing to use our site, you agree to our Terms of Service 
              and acknowledge our Privacy Policy.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            onClick={handleAccept}
            className="w-full bg-wedding-primary hover:bg-wedding-primary-dark text-white"
          >
            I Understand & Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
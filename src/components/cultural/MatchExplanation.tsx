import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

interface MatchExplanationProps {
  strongMatches: string[];
  matchReasons: string[];
  potentialConcerns: string[];
}

export const MatchExplanation: React.FC<MatchExplanationProps> = ({
  strongMatches,
  matchReasons,
  potentialConcerns
}) => {
  return (
    <Card className="border-l-4 border-l-wedding-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Why This Vendor Matches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {strongMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Strong Matches</h4>
            </div>
            <ul className="space-y-1.5 ml-7">
              {strongMatches.map((match, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{match}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchReasons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Additional Experience</h4>
            </div>
            <ul className="space-y-1.5 ml-7">
              {matchReasons.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {potentialConcerns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Things to Ask About</h4>
            </div>
            <ul className="space-y-1.5 ml-7">
              {potentialConcerns.map((concern, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">!</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {strongMatches.length === 0 && matchReasons.length === 0 && potentialConcerns.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            Match analysis in progress...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { WizardProvider, useWizard } from "./WizardContext";
import { WizardSteps } from "./WizardSteps";
import { WeddingDateStep } from "./steps/WeddingDateStep";
import { WeddingDetailsStep } from "./steps/WeddingDetailsStep";
import { VendorSelectionStep } from "./steps/VendorSelectionStep";
import { TimelineReviewStep } from "./steps/TimelineReviewStep";
import { WeddingDetails, TimelineEventType } from "@/types/timeline";
import { generateTimeline } from "./TimelineGenerator";

interface TimelineWizardProps {
  onClose: () => void;
  onAddEvents: (events: Partial<TimelineEventType>[]) => void;
  requireAuth?: boolean;
}

const WizardContent = ({ onClose, onAddEvents, requireAuth = true }: TimelineWizardProps) => {
  const { currentStep, goToNextStep, goToPreviousStep, weddingDetails, setWeddingDetails, isComplete } = useWizard();
  const [generatedEvents, setGeneratedEvents] = useState<Partial<TimelineEventType>[]>([]);
  
  const handleGenerateTimeline = () => {
    if (!weddingDetails.weddingDate) return;
    
    const events = generateTimeline(weddingDetails);
    setGeneratedEvents(events);
    goToNextStep();
  };
  
  const handleAddToTimeline = () => {
    onAddEvents(generatedEvents);
    onClose();
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WeddingDateStep />;
      case 1:
        return <WeddingDetailsStep />;
      case 2:
        return <VendorSelectionStep />;
      case 3:
        return <TimelineReviewStep events={generatedEvents} />;
      default:
        return null;
    }
  };
  
  const isLastStep = currentStep === 3;
  const isGenerateStep = currentStep === 2;
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <WizardSteps />
      
      <div className="mt-6 bg-white p-6 rounded-lg border">
        {renderStepContent()}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onClose : goToPreviousStep}
          className="flex items-center gap-2"
        >
          {currentStep === 0 ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Back
            </>
          )}
        </Button>
        
        <Button
          onClick={
            isLastStep 
              ? handleAddToTimeline 
              : isGenerateStep 
                ? handleGenerateTimeline 
                : goToNextStep
          }
          disabled={!isComplete}
          className="bg-wedding-primary hover:bg-wedding-primary/90 flex items-center gap-2"
        >
          {isLastStep ? (
            <>
              <Check className="h-4 w-4" />
              Add to Timeline
            </>
          ) : isGenerateStep ? (
            <>
              <Wand2 className="h-4 w-4" />
              Generate Timeline
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export const TimelineWizard = (props: TimelineWizardProps) => {
  return (
    <WizardProvider>
      <WizardContent {...props} />
    </WizardProvider>
  );
};

import React, { createContext, useContext, useState, ReactNode } from "react";
import { WeddingDetails, VenueType, GuestCountRange } from "@/types/timeline";

interface WizardContextType {
  currentStep: number;
  weddingDetails: Partial<WeddingDetails>;
  isComplete: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setWeddingDetails: (details: Partial<WeddingDetails>) => void;
  updateWeddingDetail: <K extends keyof WeddingDetails>(
    key: K,
    value: WeddingDetails[K]
  ) => void;
  validateCurrentStep: () => boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
}

export const WizardProvider = ({ children }: WizardProviderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [weddingDetails, setWeddingDetailsState] = useState<Partial<WeddingDetails>>({
    selectedVendors: [],
  });
  
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Wedding Date Step
        return !!weddingDetails.weddingDate;
      case 1: // Wedding Details Step
        return (
          !!weddingDetails.guestCount &&
          !!weddingDetails.venueType
        );
      case 2: // Vendor Selection Step
        return weddingDetails.selectedVendors?.length !== undefined && 
               weddingDetails.selectedVendors?.length > 0;
      default:
        return true;
    }
  };
  
  const isComplete = validateCurrentStep();
  
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };
  
  const setWeddingDetails = (details: Partial<WeddingDetails>) => {
    setWeddingDetailsState((prev) => ({
      ...prev,
      ...details,
    }));
  };
  
  const updateWeddingDetail = <K extends keyof WeddingDetails>(
    key: K,
    value: WeddingDetails[K]
  ) => {
    setWeddingDetailsState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  return (
    <WizardContext.Provider
      value={{
        currentStep,
        weddingDetails,
        isComplete,
        goToNextStep,
        goToPreviousStep,
        setWeddingDetails,
        updateWeddingDetail,
        validateCurrentStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = (): WizardContextType => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};

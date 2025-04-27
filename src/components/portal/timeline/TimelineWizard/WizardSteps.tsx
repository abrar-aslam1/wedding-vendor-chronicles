import { useWizard } from "./WizardContext";
import { Calendar, Users, ListChecks, ClipboardList } from "lucide-react";

const steps = [
  {
    title: "Wedding Date",
    icon: Calendar,
    description: "Select your wedding date"
  },
  {
    title: "Wedding Details",
    icon: Users,
    description: "Tell us about your wedding"
  },
  {
    title: "Vendor Selection",
    icon: ListChecks,
    description: "Choose your vendors"
  },
  {
    title: "Review Timeline",
    icon: ClipboardList,
    description: "Review your personalized timeline"
  }
];

export const WizardSteps = () => {
  const { currentStep } = useWizard();
  
  return (
    <div className="w-full">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center relative"
              style={{ width: `${100 / steps.length}%` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-5 h-0.5 w-full right-0 -mr-2 ${
                    index < currentStep ? 'bg-wedding-primary' : 'bg-gray-200'
                  }`}
                  style={{ width: 'calc(100% - 20px)', left: '60%' }}
                />
              )}
              
              {/* Step circle */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  isActive 
                    ? 'bg-wedding-primary text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Step title */}
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-wedding-primary' : isCompleted ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 hidden md:block">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

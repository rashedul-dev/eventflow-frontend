"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface MultiStepFormProps {
  steps: Step[];
  children: ReactNode[];
  onComplete: () => void;
  className?: string;
}

export function MultiStepForm({ steps, children, onComplete, className }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Progress Indicator */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                disabled={index > currentStep}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all",
                  index <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary",
                    isCurrent && "border-primary bg-black",
                    !isCompleted && !isCurrent && "border-secondary bg-black"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-black" />
                  ) : (
                    <span className={cn("text-sm font-semibold", isCurrent ? "text-primary" : "text-muted-foreground")}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">{children[currentStep]}</div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-secondary">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className={cn(
            "px-6 py-2.5 rounded-lg border border-secondary text-foreground font-medium transition-all",
            "hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Back
        </button>
        <button
          onClick={goNext}
          className="px-6 py-2.5 rounded-lg bg-primary text-black font-semibold transition-all hover:bg-primary/90"
        >
          {currentStep === steps.length - 1 ? "Complete" : "Continue"}
        </button>
      </div>
    </div>
  );
}

export function useMultiStepForm(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  return {
    currentStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    goNext: () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1)),
    goBack: () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    goToStep: setCurrentStep,
  };
}

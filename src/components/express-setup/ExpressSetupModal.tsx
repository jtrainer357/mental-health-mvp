"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/design-system/components/ui/dialog";
import { TooltipProvider } from "@/design-system/components/ui/tooltip";
import { Button } from "@/design-system/components/ui/button";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  AddOnSelectionStep,
  CombinedAccountPaymentStep,
  UploadSuccessStep,
} from "./ExpressSetupSteps";
import { PriceSummary } from "./PriceSummary";
import {
  PracticeInfoData,
  AccountData,
  PaymentData,
  ValidationError,
} from "@/src/lib/expressSetupValidation";
import { AddOn } from "@/src/lib/addOnsData";
import { cn } from "@/design-system/lib/utils";

interface ExpressSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddOns?: AddOn[];
}

const STORAGE_KEY = "tebra_express_setup_data";

const INITIAL_PRACTICE_DATA: PracticeInfoData = {
  practiceName: "",
  specialty: "",
  providerCount: "",
  zipCode: "",
};

const INITIAL_ACCOUNT_DATA: AccountData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const INITIAL_PAYMENT_DATA: PaymentData = {
  cardNumber: "",
  expirationDate: "",
  cvv: "",
  billingZip: "",
};

export function ExpressSetupModal({ open, onOpenChange }: ExpressSetupModalProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [basePlanOption, setBasePlanOption] = React.useState<number>(349);
  const [selectedAddOns, setSelectedAddOns] = React.useState<AddOn[]>([]);
  const [practiceData, setPracticeData] = React.useState<PracticeInfoData>(INITIAL_PRACTICE_DATA);
  const [accountData, setAccountData] = React.useState<AccountData>(INITIAL_ACCOUNT_DATA);
  const [paymentData, setPaymentData] = React.useState<PaymentData>(INITIAL_PAYMENT_DATA);
  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Load saved state on mount
  React.useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Only restore if valid
        if (data.step) setStep(data.step);
        if (data.selectedAddOns) setSelectedAddOns(data.selectedAddOns);
        if (data.practiceData) setPracticeData(data.practiceData);
        if (data.accountData) setAccountData(data.accountData);
      } catch (e) {
        console.error("Failed to load saved setup data", e);
      }
    }
  }, []);

  // Save state on change
  React.useEffect(() => {
    if (open) {
      // Only save if modal is open to avoid clearing on initial load
      const data = {
        step,
        selectedAddOns,
        practiceData,
        accountData,
        // Don't save payment data for security
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [step, selectedAddOns, practiceData, accountData, open]);

  const handleNext = () => {
    // PERMIT_ALL: Bypassing validation for demo purposes as requested
    const currentErrors: ValidationError[] = [];

    /* Validation temporarily disabled
        if (step === 2) {
             // Validate ALL sections
            const practiceErrors = validatePracticeInfo(practiceData)
            const accountErrors = validateAccountInfo(accountData)
            const paymentErrors = validatePaymentInfo(paymentData)
            currentErrors = [...practiceErrors, ...accountErrors, ...paymentErrors]
        }
        */

    setErrors(currentErrors);

    if (currentErrors.length === 0) {
      if (step < 3) {
        if (step === 2) {
          // Simulate API call
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            setStep(step + 1);
            // Clear storage after success
            sessionStorage.removeItem(STORAGE_KEY);
          }, 1500);
        } else {
          setStep(step + 1);
        }
      }
    }
  };

  const handleBack = () => {
    if (step > 1 && step <= 3) {
      setStep(step - 1);
      setErrors([]);
    }
  };

  const handleToggleAddOn = (addon: AddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  // Calculate progress percentage (available for UI if needed)
  const _progress = (step / 3) * 100;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card flex max-h-[90vh] max-w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[1000px]">
          <DialogHeader className="sr-only">
            <DialogTitle>Express Setup</DialogTitle>
            <DialogDescription>
              Complete your practice registration and add-on selection.
            </DialogDescription>
          </DialogHeader>

          {/* Header with Progress */}
          {step <= 3 && (
            <div className="border-border absolute top-0 right-0 left-0 z-20 border-b bg-white/80 px-4 pt-6 pb-4 backdrop-blur-xl sm:px-6 sm:pt-8 sm:pb-6 md:px-12 md:pt-12">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground absolute top-4 right-4 z-30"
                onClick={() => onOpenChange(false)}
                aria-label="Close setup wizard"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-5" aria-hidden="true" />
              </Button>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-muted-foreground text-xl font-bold">Express Setup</div>
                <div className="text-muted-foreground text-base font-medium">Step {step} of 3</div>
              </div>
              <div className="flex w-full gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-300",
                      i <= step ? "bg-primary" : "bg-black/10"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Scrollable Content Area */}
          <div className="relative flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <div
                className={cn(
                  "min-h-full",
                  step <= 3
                    ? "px-4 pt-24 pb-32 sm:px-6 sm:pt-28 sm:pb-40 md:px-12 md:pt-36 md:pb-48"
                    : "h-full p-0"
                )}
              >
                {step === 1 && (
                  <AddOnSelectionStep
                    selectedAddOns={selectedAddOns}
                    onToggleAddOn={handleToggleAddOn}
                    onContinue={handleNext}
                    basePlanOption={basePlanOption}
                    onBasePlanChange={setBasePlanOption}
                  />
                )}
                {step === 2 && (
                  <CombinedAccountPaymentStep
                    practiceData={practiceData}
                    accountData={accountData}
                    paymentData={paymentData}
                    errors={errors}
                    onPracticeChange={(field, value) =>
                      setPracticeData((prev) => ({ ...prev, [field]: value }))
                    }
                    onAccountChange={(field, value) =>
                      setAccountData((prev) => ({ ...prev, [field]: value }))
                    }
                    onPaymentChange={(field, value) =>
                      setPaymentData((prev) => ({ ...prev, [field]: value }))
                    }
                    onComplete={handleNext}
                    selectedAddOns={selectedAddOns}
                    isLoading={isLoading}
                    basePrice={basePlanOption}
                    onBack={handleBack}
                  />
                )}
                {step === 3 && (
                  <UploadSuccessStep
                    email={accountData.email}
                    onClose={() => {
                      onOpenChange(false);
                      router.push("/home?setup_complete=true");
                    }}
                    onBack={handleBack}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer with Price and Actions (Steps 1-3) */}
          {step <= 3 && (
            <div className="border-border absolute right-0 bottom-0 left-0 z-20 flex flex-col items-stretch justify-between gap-4 border-t bg-white/80 px-4 pt-4 pb-6 backdrop-blur-xl sm:flex-row sm:items-end sm:px-6 sm:pt-6 sm:pb-10 md:px-12">
              {/* Left Side: Back Button */}
              <div className="flex-1">
                {step > 1 && (
                  <Button
                    onClick={handleBack}
                    size="xl"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground pl-0 text-lg hover:bg-transparent"
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft02Icon}
                      className="mr-2 size-5"
                      strokeWidth={2.5}
                    />
                    Back
                  </Button>
                )}
              </div>

              {/* Right Side: Price Summary and Primary Action */}
              <div className="flex flex-col items-stretch gap-3 sm:items-end">
                {step < 3 && (
                  <PriceSummary
                    basePrice={basePlanOption}
                    selectedAddOns={selectedAddOns}
                    compact
                    className="text-xl"
                  />
                )}
                <Button
                  onClick={
                    step === 3
                      ? () => {
                          onOpenChange(false);
                          router.push("/home?setup_complete=true");
                        }
                      : handleNext
                  }
                  size="xl"
                  variant="marketing"
                  className="w-full min-w-[200px] text-base sm:w-auto sm:text-lg"
                  disabled={isLoading}
                >
                  {step === 2
                    ? isLoading
                      ? "Processing..."
                      : "Start Free Trial"
                    : step === 3
                      ? "Complete Setup"
                      : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

"use client";

import { useState } from "react";
import { Pricing, PricingTier } from "@/design-system/components/ui/pricing-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/design-system/components/ui/card";
import { ExpressSetupModal } from "@/src/components/express-setup/ExpressSetupModal";

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    description:
      "Perfect for solo practitioners and new practices. Complete scheduling, EHR, patient portal, and billing in one platform.",
    price: 249,
    billingPeriod: "per provider/month",
    buttonText: "Get Started",
    buttonVariant: "outline-dark",
    hasAnnualToggle: true,
    creditOptions: ["1,000 messages / month", "2,500 messages / month", "5,000 messages / month"],
    defaultCredits: "1,000 messages / month",
    priceByOption: {
      "1,000 messages / month": 249,
      "2,500 messages / month": 299,
      "5,000 messages / month": 349,
    },
    featuresTitle: "Small Practice (1-2 providers):",
    features: [
      { text: "Full practice management platform included" },
      { text: "48-hour email support from PM experts" },
      { text: "AI automation for notes & scheduling" },
      { text: "Branded patient portal with self-booking" },
      { text: "Public-facing practice pages" },
    ],
  },
  {
    name: "Professional",
    description:
      "Designed for growing practices building together. Priority support, faster implementation, and workflows that adapt to your team.",
    price: 349,
    billingPeriod: "per provider/month",
    buttonText: "Get Started",
    buttonVariant: "marketing",
    isPrimary: true,
    popularTag: "Most Popular",
    hasAnnualToggle: true,
    creditOptions: ["5,000 messages / month", "10,000 messages / month", "15,000 messages / month"],
    defaultCredits: "5,000 messages / month",
    priceByOption: {
      "5,000 messages / month": 349,
      "10,000 messages / month": 449,
      "15,000 messages / month": 549,
    },
    featuresTitle: "Medium Practice (3-8 providers), plus:",
    features: [
      { text: "Priority phone + email support, 24hr response" },
      { text: "Priority implementation—get live faster" },
      { text: "Advanced patient portal capabilities" },
      { text: "Custom workflows that match your operations" },
      { text: "Role-based permissions for team security" },
      { text: "Secure private project workspace" },
    ],
  },
  {
    name: "Billing Services",
    description:
      "Full-service revenue cycle management for billing-intensive practices. Expert billing teams handle claims and collections.",
    priceLabel: "2.5%",
    billingPeriod: "of claims processed",
    buttonText: "Get Started",
    buttonVariant: "outline-dark",
    hasAnnualToggle: true,
    featuresTitle: "All features in Professional, plus:",
    creditOptions: ["$150K - $500K claims/month", "$500K - $1M claims/month", "$1M+ claims/month"],
    defaultCredits: "$150K - $500K claims/month",
    priceByOption: {
      "$150K - $500K claims/month": "2.5%",
      "$500K - $1M claims/month": "2.25%",
      "$1M+ claims/month": "2.0%",
    },
    features: [
      { text: "Full platform + professional billing services" },
      { text: "Your dedicated billing specialists team" },
      { text: "Expert claim scrubbing maximizes reimbursement" },
      { text: "Professional revenue cycle management" },
      { text: "Specialty-specific billing expertise & support" },
      { text: "Flexible billing workflows for unique contracts" },
    ],
  },
  {
    name: "Enterprise",
    description:
      "Built for large organizations needing flexibility and scale. Dedicated support, custom integrations, and enterprise security.",
    priceLabel: "Custom",
    billingPeriod: "contact for pricing",
    buttonText: "Book a Demo",
    buttonVariant: "outline-dark",
    featuresTitle: "Everything in Professional, plus:",
    features: [
      { text: "Dedicated account manager + concierge support" },
      { text: "Custom integrations connect your systems" },
      { text: "Multi-location management with unified oversight" },
      { text: "Advanced security meets regulatory requirements" },
      { text: "Streamlined group-based access controls" },
      { text: "Built for 10+ providers and expanding organizations" },
    ],
  },
];

interface AddOn {
  title: string;
  price: string;
  priceSuffix?: string;
  description: string;
}

// Add-ons without Professional Services
const ADD_ONS: AddOn[] = [
  {
    title: "AI Premium Suite",
    price: "+$99",
    priceSuffix: "/provider/month",
    description:
      "Advanced AI features including ready-for-review notes, claims optimization, and intelligent automation",
  },
  {
    title: "Enhanced Patient Portal",
    price: "+$49",
    priceSuffix: "/provider/month",
    description:
      "Advanced self-service features, custom branding, and enhanced patient communication tools",
  },
  {
    title: "Voice AI Assistant",
    price: "+$79",
    priceSuffix: "/provider/month",
    description:
      "Intelligent voice-based scheduling, patient intake, and appointment management automation",
  },
  {
    title: "AI Agents (Labor Model)",
    price: "$400",
    priceSuffix: "/week per agent",
    description:
      "AI agents positioned as digital employees for autonomous billing and administrative work",
  },
  {
    title: "Data Import Services",
    price: "One-time fee",
    description:
      "White-glove migration of historical patient data, scheduling history, and clinical records",
  },
];

export default function PricingDemoPage() {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const handleTierAction = (tier: PricingTier) => {
    if (tier.name === "Professional") {
      setIsSetupModalOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      {/* Header Image - Sticky, Native Size, Centered */}
      <div className="sticky top-0 z-50 w-full bg-white">
        <div className="flex justify-center">
          <img
            src="/assets/pricing/header.png"
            alt="Tebra Mental Health pricing plans - Choose the right plan for your practice"
            className="block flex-shrink-0"
            style={{
              width: "1698px",
              minWidth: "1698px",
              height: "auto",
            }}
          />
        </div>
      </div>

      {/* Express Setup Modal */}
      <ExpressSetupModal open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen} />

      {/* Pricing Module */}
      <div className="w-full">
        <Pricing
          title="Pricing"
          subtitle="Start for free. Upgrade to get the capacity that exactly matches your practice's needs."
          tiers={PRICING_TIERS}
          className="py-16"
          onTierAction={handleTierAction}
        />
      </div>

      {/* Add-ons Section */}
      <div className="text-foreground w-full bg-white px-4 pt-0 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-growth-1 mb-2 text-2xl font-bold">Strategic Premium Add-Ons</h2>
            <p className="text-growth-1">
              Enhance any tier with powerful capabilities designed to accelerate your practice
              growth
            </p>
          </div>

          {/* All 5 cards in one row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {ADD_ONS.map((addon, index) => (
              <Card
                key={index}
                className="bg-card border-border/60 flex flex-col border shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{addon.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                  <div className="text-vitality-1 text-xl font-bold">
                    {addon.price}
                    {addon.priceSuffix && (
                      <span className="text-muted-foreground text-sm font-normal">
                        {addon.priceSuffix}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {addon.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Image - Centered, Retina Size */}
      <div className="w-full pb-16">
        <div className="flex justify-center">
          <img
            src="/assets/pricing/footer.png"
            alt="Ready to get started? Contact us for a personalized demo"
            className="block flex-shrink-0"
            style={{
              width: "2064px",
              minWidth: "2064px",
              height: "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
}

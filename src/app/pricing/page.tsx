"use client";

import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock the full potential of your flashcard learning experience with our flexible pricing options
            </p>
          </div>

          {/* Clerk's Real Billing System */}
          <PricingTable 
            appearance={{
              elements: {
                pricingTableContainer: "w-full",
                pricingTableCard: "border rounded-lg shadow-sm",
                pricingTableButton: "w-full bg-primary hover:bg-primary/90"
              }
            }}
          />

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include secure data storage and cross-device synchronization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
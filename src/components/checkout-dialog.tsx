"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PricingTable } from "@clerk/nextjs";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutDialog({ isOpen, onClose }: CheckoutDialogProps) {

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] sm:w-[500px] p-0" showCloseButton={false}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Subscribe to Pro</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          {/* Use Clerk's actual billing system */}
          <PricingTable 
            appearance={{
              elements: {
                pricingTableContainer: "border-none shadow-none p-0",
                pricingTableCard: "border rounded-lg p-4 mb-4",
                pricingTableButton: "w-full"
              }
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
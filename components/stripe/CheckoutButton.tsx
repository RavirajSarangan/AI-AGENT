"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface PricingPlan {
  name: string;
  priceId: string;
  amount: number;
}

interface CheckoutButtonProps {
  readonly plan: PricingPlan;
  readonly children?: React.ReactNode;
  readonly variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive";
  readonly size?: "default" | "sm" | "lg" | "icon";
  readonly className?: string;
}

export function CheckoutButton({ 
  plan, 
  children, 
  variant = "default",
  size = "default",
  className 
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // Redirect to checkout
      window.location.href = `/api/checkout-redirect?sessionId=${sessionId}`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? "Processing..." : children || `Subscribe to ${plan.name}`}
    </Button>
  );
}

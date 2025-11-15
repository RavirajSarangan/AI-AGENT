import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.redirect(
        new URL("/billing?error=missing_session", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Redirect to success page
      return NextResponse.redirect(
        new URL("/billing?success=true", process.env.NEXT_PUBLIC_APP_URL!)
      );
    } else {
      // Redirect to billing page with error
      return NextResponse.redirect(
        new URL("/billing?error=payment_failed", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }
  } catch (error: any) {
    console.error("Checkout redirect error:", error);
    return NextResponse.redirect(
      new URL("/billing?error=session_expired", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}

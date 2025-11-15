/**
 * Script to create Stripe products and prices
 * Run this once to set up your pricing in Stripe
 * 
 * Usage: npx tsx scripts/setup-stripe-prices.ts
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

async function setupPrices() {
  try {
    console.log('🚀 Setting up Stripe products and prices...\n');

    // Create Starter Plan
    const starterProduct = await stripe.products.create({
      name: 'FlowReplyAI Starter',
      description: 'Solo founders + small teams',
      metadata: {
        plan: 'starter',
      },
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 4900, // $49.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Starter Monthly',
    });

    console.log('✅ Starter Plan created:');
    console.log(`   Product ID: ${starterProduct.id}`);
    console.log(`   Price ID: ${starterPrice.id}`);
    console.log('');

    // Create Pro Plan
    const proProduct = await stripe.products.create({
      name: 'FlowReplyAI Pro',
      description: 'Growing teams with multiple automations',
      metadata: {
        plan: 'pro',
      },
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 14900, // $149.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Pro Monthly',
    });

    console.log('✅ Pro Plan created:');
    console.log(`   Product ID: ${proProduct.id}`);
    console.log(`   Price ID: ${proPrice.id}`);
    console.log('');

    console.log('🎉 Setup complete! Update your .env.local with these values:\n');
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_STARTER=${starterPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO=${proPrice.id}`);
    console.log('');
    console.log('Then update app/(public)/pricing/page.tsx with these price IDs.');

  } catch (error) {
    console.error('❌ Error setting up prices:', error);
    process.exit(1);
  }
}

setupPrices();

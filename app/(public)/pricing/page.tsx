"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "Solo founders + small teams",
    price: "$49",
    priceId: "price_1STUs074LFZgProh3THnR4Mx",
    period: "/month",
    features: [
      "1 WhatsApp number",
      "5,000 messages/month",
      "AI auto-reply",
      "Basic workflows",
      "Shared inbox",
      "Email support",
    ],
  },
  {
    name: "Pro",
    description: "Growing teams with multiple automations",
    price: "$149",
    priceId: "price_1STUs174LFZgProhaTsIifUY",
    period: "/month",
    featured: true,
    features: [
      "Up to 3 WhatsApp numbers",
      "25,000 messages/month",
      "Advanced workflows & logs",
      "Team accounts (5 users)",
      "Priority support",
      "Custom integrations",
      "Analytics dashboard",
    ],
  },
  {
    name: "Agency",
    description: "Agencies managing multiple tenants",
    price: "Custom",
    priceId: "custom",
    period: "",
    features: [
      "Multi-tenant setup",
      "Unlimited WhatsApp numbers",
      "Unlimited messages",
      "White-label options",
      "Dedicated support",
      "Custom development",
      "SLA guarantees",
    ],
  },
];

const faqs = [
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "What happens if I exceed my message limit?",
    answer: "We'll notify you when you reach 80% of your limit. You can either upgrade your plan or purchase additional message credits.",
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! We offer a 14-day free trial on all plans. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and wire transfers for annual plans.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees. You only pay for your monthly subscription.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. No long-term contracts or commitments.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(79,57,246,0.25),_transparent_55%)]">
        <PublicHeader />

        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <Badge className="mb-4" variant="outline">
            Transparent Pricing
          </Badge>
          <h1 className="mb-4 text-5xl font-bold">
            Choose the right plan for your business
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Start free, scale as you grow. All plans include core features with no hidden fees.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 -mt-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.featured ? "border-primary shadow-lg" : ""}
            >
              {plan.featured && (
                <div className="bg-primary px-3 py-1 text-center text-sm font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.price === "Custom" ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    asChild
                  >
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                ) : (
                  <CheckoutButton
                    plan={{
                      name: plan.name,
                      priceId: plan.priceId,
                      amount: Number.parseInt(plan.price.replace("$", ""), 10),
                    }}
                    variant={plan.featured ? "default" : "outline"}
                    className="w-full"
                  >
                    Start Free Trial
                  </CheckoutButton>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <section className="mt-24">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Compare all features
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-semibold">Feature</th>
                      <th className="p-4 text-center font-semibold">Starter</th>
                      <th className="p-4 text-center font-semibold">Pro</th>
                      <th className="p-4 text-center font-semibold">Agency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">WhatsApp Numbers</td>
                      <td className="p-4 text-center">1</td>
                      <td className="p-4 text-center">3</td>
                      <td className="p-4 text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Messages/month</td>
                      <td className="p-4 text-center">5,000</td>
                      <td className="p-4 text-center">25,000</td>
                      <td className="p-4 text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Team Members</td>
                      <td className="p-4 text-center">2</td>
                      <td className="p-4 text-center">5</td>
                      <td className="p-4 text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Workflows</td>
                      <td className="p-4 text-center">5</td>
                      <td className="p-4 text-center">Unlimited</td>
                      <td className="p-4 text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">AI Auto-reply</td>
                      <td className="p-4 text-center"><Check className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="p-4 text-center"><Check className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="p-4 text-center"><Check className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Multi-tenant</td>
                      <td className="p-4 text-center">-</td>
                      <td className="p-4 text-center">-</td>
                      <td className="p-4 text-center"><Check className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mt-24">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 text-center">
          <Card className="bg-primary/10">
            <CardContent className="py-12">
              <h2 className="mb-4 text-3xl font-bold">
                Ready to get started?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg">Start Free Trial</Button>
                <Button size="lg" variant="outline">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

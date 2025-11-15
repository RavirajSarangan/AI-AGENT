"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import {
  Bot,
  Workflow,
  MessageSquare,
  Zap,
  Clock,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Auto-Reply 24/7",
    description: "GPT-powered responses that understand context, match your brand tone, and never sleep.",
  },
  {
    icon: Workflow,
    title: "Visual Workflow Builder",
    description: "Create automations with triggers, conditions, AI nodes, and webhooks - no code required.",
  },
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description: "Manage all WhatsApp conversations in one place. Tag, assign, and add internal notes.",
  },
  {
    icon: Zap,
    title: "Instant Integrations",
    description: "Connect to your CRM, ticketing system, or any API with HTTP webhook nodes.",
  },
  {
    icon: Clock,
    title: "Business Hours Control",
    description: "Set working hours, holidays, and after-hours auto-responses.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track response times, auto vs manual replies, and workflow performance in real-time.",
  },
];

const useCases = [
  {
    title: "Customer Support",
    description: "Answer FAQs instantly, route complex issues to humans, and maintain conversation history.",
    stat: "78% deflection rate",
    icon: Headphones,
  },
  {
    title: "Lead Generation",
    description: "Capture leads 24/7, qualify with AI questions, and push to your CRM automatically.",
    stat: "+45% lead capture",
    icon: TrendingUp,
  },
  {
    title: "E-commerce",
    description: "Provide order status, product recommendations, and handle cart abandonment recovery.",
    stat: "+31% conversions",
    icon: Globe,
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Connect WhatsApp",
    description: "Link your WhatsApp Business Account via Meta Cloud API in minutes.",
  },
  {
    step: "02",
    title: "Build Workflows",
    description: "Create automation flows with triggers, AI nodes, and actions using our visual builder.",
  },
  {
    step: "03",
    title: "AI Auto-Reply",
    description: "Configure your AI personality, tone, and knowledge base for smart responses.",
  },
  {
    step: "04",
    title: "Monitor & Optimize",
    description: "Track performance, view execution logs, and refine workflows for better results.",
  },
];

const testimonials = [
  {
    quote: "FlowReplyAI cut our response time from hours to seconds. Our customers love it and our team has more time for complex issues.",
    author: "Sarah Chen",
    role: "Head of Support",
    company: "TechCorp",
  },
  {
    quote: "We capture 3x more leads now. The AI qualifies them instantly and our sales team only sees hot prospects.",
    author: "Marcus Rodriguez",
    role: "VP of Sales",
    company: "GrowthLabs",
  },
  {
    quote: "The workflow builder is intuitive. We automated our entire order status system in one afternoon.",
    author: "Emily Watson",
    role: "Operations Manager",
    company: "ShopDirect",
  },
];

const stats = [
  { value: "1.3M+", label: "Messages automated/month" },
  { value: "2.4s", label: "Average response time" },
  { value: "94%", label: "Customer satisfaction" },
  { value: "640+", label: "Hours saved/month" },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    }
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <PublicHeader />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8 lg:pt-24">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4" variant="outline">
                <Sparkles className="mr-1 h-3 w-3" />
                AI-Powered WhatsApp Automation
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl"
              variants={fadeInUp}
            >
              Turn WhatsApp into your{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                24/7 AI agent
              </span>
            </motion.h1>
            
            <motion.p 
              className="mb-8 text-xl text-muted-foreground"
              variants={fadeInUp}
            >
              Auto-reply with GPT, build custom workflows, and manage conversations from a powerful dashboard. 
              Never miss a customer message again.
            </motion.p>
            
            <motion.div 
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              variants={fadeInUp}
            >
              <Button size="lg" className="group" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#demo">Watch Demo</Link>
              </Button>
            </motion.div>

            <motion.p 
              className="mt-4 text-sm text-muted-foreground"
              variants={fadeInUp}
            >
              No credit card required • 14-day free trial • Cancel anytime
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="mb-4" variant="secondary">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to automate WhatsApp
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From AI responses to complex workflows, we've got you covered.
            </p>
          </motion.div>

          <motion.div 
            className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="relative h-full overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardHeader>
                    <motion.div 
                      className="mb-4 inline-flex rounded-lg bg-primary/10 p-3"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="mb-4" variant="secondary">
              How it works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get started in 4 simple steps
            </h2>
          </motion.div>

          <motion.div 
            className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {workflowSteps.map((item) => (
              <motion.div 
                key={item.title} 
                className="relative"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <motion.div 
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
                  whileHover={{ scale: 1.1 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="mb-4" variant="secondary">
              Use Cases
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for teams that need results
            </h2>
          </motion.div>

          <motion.div 
            className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {useCases.map((useCase) => (
              <motion.div key={useCase.title} variants={fadeInUp}>
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <motion.div 
                      className="mb-4 inline-flex rounded-lg bg-primary/10 p-3"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring" as const, stiffness: 300 }}
                    >
                      <useCase.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <CardTitle>{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="default">{useCase.stat}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="mb-4" variant="secondary">
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by support teams worldwide
            </h2>
          </motion.div>

          <motion.div 
            className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial) => (
              <motion.div 
                key={testimonial.author}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <Card className="h-full transition-shadow hover:shadow-xl">
                  <CardContent className="pt-6">
                    <p className="mb-4 text-sm italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
          >
            <Card className="overflow-hidden border-2 border-primary">
              <CardContent className="relative p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
                <div className="relative mx-auto max-w-2xl text-center">
                  <motion.h2 
                    className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                    variants={fadeInUp}
                  >
                    Ready to automate your WhatsApp?
                  </motion.h2>
                  <motion.p 
                    className="mb-8 text-lg text-muted-foreground"
                    variants={fadeInUp}
                  >
                    Join hundreds of businesses using FlowReplyAI to deliver instant,
                    intelligent customer experiences.
                  </motion.p>
                  <motion.div 
                    className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    variants={fadeInUp}
                  >
                    <Button size="lg" asChild>
                      <Link href="/signup">Start Free Trial</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/pricing">View Pricing</Link>
                    </Button>
                  </motion.div>
                  <motion.div 
                    className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
                    variants={fadeInUp}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>14-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>No credit card</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Cancel anytime</span>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

import {
  UserPlus,
  Upload,
  Zap,
  BarChart3,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Join Early Adopters",
      description: "Sign up for our beta and be part of the healthcare revolution",
    },
    {
      number: "2",
      icon: Upload,
      title: "Share Your Health Data",
      description: "Securely upload your medical reports, records, or health information",
    },
    {
      number: "3",
      icon: Zap,
      title: "AI Does The Work",
      description: "Our intelligent system analyzes your data and finds key insights",
    },
    {
      number: "4",
      icon: BarChart3,
      title: "Get Actionable Insights",
      description: "Receive clear recommendations and understand your health better",
    },
  ];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Get Started in <span className="text-primary">4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
            From signup to actionable health insights in minutes
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex flex-col items-center animate-slide-in-up" style={{
                animationDelay: `${index * 0.1}s`,
              }}>
                {/* Step Card */}
                <div className="w-full text-center mb-8">
                  {/* Circle with icon and number */}
                  <div className="relative mx-auto mb-6 h-20 w-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white font-bold text-sm">
                      {step.number}
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute top-10 left-1/2 -right-1/2 h-1 bg-gradient-to-r from-primary to-accent hidden lg:block" />
                )}

                {/* Connector arrow for mobile and tablet */}
                {index < steps.length - 1 && (
                  <div className="flex lg:hidden mb-4 text-primary">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Lightbulb className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-primary">Early access available now</p>
          </div>
          <Link to="/contact">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              Start Your Journey
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

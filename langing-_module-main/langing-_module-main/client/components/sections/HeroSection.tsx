import { Rocket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-cyan-50/30 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Gradient background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center animate-fade-in space-y-6">
            {/* Startup badge */}
            <div className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Early Stage Startup</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
                The Healthcare Revolution Starts <span className="text-primary">Here</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl leading-relaxed">
                We're building the future of healthcare. CareNova is an AI-powered platform that empowers patients with intelligent medical insights, making healthcare accessible, understandable, and actionable for everyone.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  Get Early Access
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
                >
                  Learn Our Story
                </Button>
              </Link>
            </div>

            {/* Startup metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-2xl font-bold text-primary">100+</p>
                <p className="text-xs text-muted-foreground">Beta Testers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">6M+</p>
                <p className="text-xs text-muted-foreground">Reports Ready</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">98%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative hidden lg:flex items-center justify-center animate-float">
            <div className="relative w-full aspect-square max-w-md">
              {/* Main card */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 backdrop-blur-sm shadow-2xl overflow-hidden p-6 flex flex-col justify-between">
                {/* Top section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">AI Healthcare Platform</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Transforming how patients understand their health
                  </p>
                </div>

                {/* Feature list */}
                <div className="space-y-3">
                  {[
                    "📄 Medical Report Analysis",
                    "💊 Drug Information & Pricing",
                    "🩺 Symptom Checker",
                    "🔮 Health Risk Prediction",
                    "🧠 Mental Health Chatbot",
                    "🔐 Secure Doctor Access",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="text-primary">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating startup badge */}
              <div className="absolute -right-6 -bottom-6 bg-white border-2 border-primary rounded-xl shadow-lg p-4 backdrop-blur-sm">
                <p className="text-sm font-bold text-primary mb-1">Founding Mission</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Making healthcare AI accessible to everyone
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

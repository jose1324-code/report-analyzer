import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28 bg-gradient-to-r from-primary via-accent/50 to-primary">
      {/* Gradient overlay elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
        {/* Startup badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-sm font-semibold text-white">Limited Early Access</span>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Be Part of the Healthcare Revolution
          </h2>
          <p className="text-lg text-white/90 mx-auto max-w-2xl">
            Join our founding community and shape the future of AI-powered healthcare. We're offering early access to our beta platform—be among the first to experience smarter healthcare management.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-primary font-semibold min-w-48"
            >
              Get Early Access
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link to="/about">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold min-w-48"
            >
              Learn Our Mission
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 border-t border-white/20">
          <p className="text-white/80 text-sm mb-6">What early adopters are getting</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
            <div className="text-center">
              <p className="text-2xl font-bold">Free</p>
              <p className="text-xs">Lifetime Beta Access</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">Priority</p>
              <p className="text-xs">Support & Features</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">Founding</p>
              <p className="text-xs">Member Status</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

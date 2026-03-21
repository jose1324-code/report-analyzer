import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PlatformSection from "@/components/sections/PlatformSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import SecuritySection from "@/components/sections/SecuritySection";
import CTASection from "@/components/sections/CTASection";

export default function Index() {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />
      <PlatformSection />
      <HowItWorksSection />
      <SecuritySection />
      <CTASection />
    </div>
  );
}

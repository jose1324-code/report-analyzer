import {
  Zap,
  Users,
  Globe,
  Lock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const PlatformSection = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28 bg-secondary/30">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Our <span className="text-primary">Founding Vision</span>
          </h2>
          <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
            We're building the most intuitive AI-powered healthcare platform. Here's what makes us different.
          </p>
        </div>

        {/* Vision Pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Zap,
              title: "AI-First Approach",
              description: "Built from the ground up with AI at the core, not as an afterthought",
              color: "bg-orange-400",
            },
            {
              icon: Users,
              title: "Patient-Centric Design",
              description: "Every feature is built with real patient needs and feedback in mind",
              color: "bg-pink-500",
            },
            {
              icon: Lock,
              title: "Privacy by Default",
              description: "Your health data is yours. Full encryption and control over sharing",
              color: "bg-teal-500",
            },
            {
              icon: Globe,
              title: "Global Accessibility",
              description: "Making healthcare AI accessible worldwide, not just in wealthy countries",
              color: "bg-blue-500",
            },
            {
              icon: TrendingUp,
              title: "Continuously Learning",
              description: "Our AI improves with every interaction, providing better insights over time",
              color: "bg-purple-500",
            },
            {
              icon: CheckCircle2,
              title: "Healthcare Verified",
              description: "Built with input from healthcare professionals to ensure clinical accuracy",
              color: "bg-teal-500",
            },
          ].map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="animate-slide-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div
                  className={`inline-flex rounded-lg ${pillar.color} p-3 mb-4 text-white`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PlatformSection;

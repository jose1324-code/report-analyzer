import {
  FileText,
  Pill,
  Stethoscope,
  AlertCircle,
  MessageCircle,
  QrCode,
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Medical Report Analyzer",
      problem: "Can't understand medical reports?",
      solution: "AI instantly analyzes your reports and explains findings in plain language",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Pill,
      title: "Drug Information & Pricing",
      problem: "Confused about medications & costs?",
      solution: "Complete drug database with pricing, interactions, and alternatives",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Stethoscope,
      title: "Symptom Checker",
      problem: "Not sure if symptoms are serious?",
      solution: "AI-powered assessment tells you when to see a doctor",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: AlertCircle,
      title: "Health Risk Prediction",
      problem: "Worried about future health risks?",
      solution: "Predictive AI identifies risks before they become problems",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: MessageCircle,
      title: "Mental Health Chatbot",
      problem: "Need mental health support anytime?",
      solution: "24/7 AI assistant for wellness guidance and support",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: QrCode,
      title: "Secure Doctor Access",
      problem: "Hard to share reports securely?",
      solution: "QR-verified secure sharing with healthcare providers",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Solutions to <span className="text-primary">Real Healthcare Problems</span>
          </h2>
          <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
            We're solving the healthcare challenges patients face every day
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border bg-white/50 backdrop-blur-sm p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 animate-slide-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-accent/5" />

                {/* Icon */}
                <div
                  className={`inline-flex rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 text-white`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Problem */}
                <div className="mb-4">
                  <p className="text-sm text-red-600 font-semibold mb-1">The Problem:</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.problem}
                  </p>
                </div>

                {/* Solution */}
                <div>
                  <p className="text-sm text-accent font-semibold mb-1">Our Solution:</p>
                  <p className="text-sm text-foreground">
                    {feature.solution}
                  </p>
                </div>

                {/* Hover decoration */}
                <div className="absolute bottom-0 right-0 h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity -m-4" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

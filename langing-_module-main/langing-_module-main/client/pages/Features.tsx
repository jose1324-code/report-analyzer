import {
  FileText,
  Pill,
  Stethoscope,
  AlertCircle,
  MessageCircle,
  QrCode,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Features() {
  const detailedFeatures = [
    {
      icon: FileText,
      title: "Medical Report Analyzer",
      description: "Upload reports and get AI insights",
      details: [
        "Intelligent PDF parsing and analysis",
        "Automatic extraction of key medical data",
        "Detailed AI-powered insights and interpretations",
        "Comparison with historical records",
        "Support for multiple report formats",
      ],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Pill,
      title: "Drug Information & Price Detection",
      description: "Search drugs, price, composition, alternatives",
      details: [
        "Comprehensive drug database with real-time prices",
        "Ingredient composition and interaction analysis",
        "Alternative medication suggestions",
        "Cost comparison across pharmacies",
        "Side effects and contraindication warnings",
      ],
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      icon: Stethoscope,
      title: "Symptom Checker",
      description: "AI-based symptom analysis",
      details: [
        "Intelligent symptom assessment",
        "Potential condition identification",
        "Severity level determination",
        "When to seek professional help guidance",
        "Initial health recommendations",
      ],
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: AlertCircle,
      title: "Health Risk Prediction",
      description: "Predict future health risks using AI",
      details: [
        "Machine learning-based risk assessment",
        "Personalized health predictions",
        "Preventive care recommendations",
        "Risk factor identification",
        "Trend analysis and monitoring",
      ],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: MessageCircle,
      title: "Mental Health AI Chatbot",
      description: "AI assistant for mental wellness",
      details: [
        "24/7 mental health support",
        "Stress and anxiety assessment",
        "Meditation and wellness guides",
        "Professional resource connections",
        "Confidential conversation logs",
      ],
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: QrCode,
      title: "Secure Doctor Access with QR Verification",
      description: "Secure report sharing with doctors",
      details: [
        "QR code-based secure sharing",
        "Doctor verification and credentials check",
        "Encrypted data transmission",
        "Audit trail of access logs",
        "One-click report revocation",
      ],
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-gradient-to-br from-blue-50 via-background to-cyan-50/30">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            Powerful Features for <span className="text-primary">Complete Care</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover the comprehensive tools and capabilities that make CareNova the leading AI-powered healthcare platform
          </p>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl space-y-16">
          {detailedFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="space-y-6">
                    {/* Icon and Title */}
                    <div>
                      <div
                        className={`inline-flex rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 text-white`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {feature.title}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                      {feature.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button className="bg-primary hover:bg-primary/90 gap-2">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Visual Representation */}
                <div className={`hidden lg:flex ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div
                    className={`w-full rounded-2xl ${feature.bgColor} border border-primary/20 aspect-square flex items-center justify-center`}
                  >
                    <div className="text-center space-y-4 p-8">
                      <div
                        className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-6 text-white`}
                      >
                        <Icon className="h-16 w-16" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {feature.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integration Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border bg-white/50 backdrop-blur-sm p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              All Features Work Together Seamlessly
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our integrated platform combines all these powerful features into one unified experience, giving you complete control over your healthcare journey.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
              {[
                "Real-time Sync",
                "Secure Cloud Storage",
                "24/7 Monitoring",
                "Multi-Device Access",
                "Smart Notifications",
                "Export & Share",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-primary"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose CareNova Features?
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience healthcare management like never before
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered",
                description:
                  "Advanced machine learning algorithms provide accurate analysis and predictions",
                icon: "🤖",
              },
              {
                title: "User-Friendly",
                description:
                  "Intuitive interface designed for users of all technical levels",
                icon: "✨",
              },
              {
                title: "Privacy First",
                description:
                  "End-to-end encryption ensures your health data remains completely private",
                icon: "🔒",
              },
              {
                title: "Always Available",
                description:
                  "24/7 access to your health insights and AI assistance anytime",
                icon: "🕐",
              },
              {
                title: "Continuously Learning",
                description:
                  "Our AI improves over time, getting smarter with every interaction",
                icon: "📈",
              },
              {
                title: "Professional Grade",
                description:
                  "Verified by healthcare professionals and compliant with medical standards",
                icon: "⭐",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white/50 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-accent/50 to-primary">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Start Using These Features Today
            </h2>
            <p className="text-lg text-white/90">
              Join thousands of users transforming their healthcare with CareNova
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white hover:bg-white/90 text-primary font-semibold"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
}

import {
  Zap,
  Brain,
  Activity,
  TrendingUp,
  Shield,
  Users,
  Database,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Modules() {
  const modules = [
    {
      icon: Activity,
      title: "Health Monitoring Module",
      description: "Real-time health tracking and vital signs monitoring",
      features: [
        "Continuous vital sign tracking",
        "Wearable device integration",
        "Anomaly detection alerts",
        "Historical data analysis",
      ],
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Brain,
      title: "AI Analytics Engine",
      description: "Advanced machine learning for health predictions",
      features: [
        "Pattern recognition",
        "Predictive modeling",
        "Risk stratification",
        "Personalized insights",
      ],
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Users,
      title: "Provider Integration Module",
      description: "Seamless connection with healthcare professionals",
      features: [
        "Doctor appointment scheduling",
        "Secure messaging",
        "Prescription management",
        "Medical record sharing",
      ],
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Database,
      title: "Data Management Module",
      description: "Secure storage and organization of medical data",
      features: [
        "Cloud storage",
        "Data encryption",
        "Automatic backup",
        "Version control",
      ],
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Shield,
      title: "Security & Compliance Module",
      description: "Enterprise-grade security and regulatory compliance",
      features: [
        "HIPAA compliance",
        "Multi-factor authentication",
        "Audit logging",
        "Data privacy controls",
      ],
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
    },
    {
      icon: TrendingUp,
      title: "Reporting & Insights Module",
      description: "Comprehensive health reports and analytics dashboards",
      features: [
        "Custom reports",
        "Data visualization",
        "Export functionality",
        "Trend analysis",
      ],
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-50",
    },
    {
      icon: Clock,
      title: "Appointment & Schedule Module",
      description: "Manage appointments and health schedules efficiently",
      features: [
        "Calendar integration",
        "Appointment reminders",
        "Follow-up tracking",
        "Schedule optimization",
      ],
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-gradient-to-br from-blue-50 via-background to-cyan-50/30">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            CareNova <span className="text-primary">Modules</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our comprehensive suite of integrated modules designed to provide complete healthcare management solutions
          </p>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-white/50 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all p-8 group"
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex rounded-lg bg-gradient-to-br ${module.color} p-3 mb-6 text-white group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {module.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {module.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {module.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Button */}
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module Workflow Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How Our Modules Work Together
            </h2>
            <p className="text-lg text-muted-foreground">
              Each module is designed to integrate seamlessly with others
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white/50 backdrop-blur-sm p-12 overflow-hidden">
            <div className="grid md:grid-cols-5 gap-4 text-center">
              {[
                {
                  title: "Data Input",
                  description: "Upload health data & reports",
                  icon: "📤",
                },
                {
                  title: "Analysis",
                  description: "AI processes information",
                  icon: "🧠",
                },
                {
                  title: "Insights",
                  description: "Generate recommendations",
                  icon: "💡",
                },
                {
                  title: "Sharing",
                  description: "Securely share with doctors",
                  icon: "🔗",
                },
                {
                  title: "Monitoring",
                  description: "Track progress over time",
                  icon: "📊",
                },
              ].map((step, i) => (
                <div key={i}>
                  <div className="text-4xl mb-2">{step.icon}</div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                  {i < 4 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 text-2xl text-primary/30">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Module Capabilities */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              What You Can Achieve
            </h2>
            <p className="text-lg text-muted-foreground">
              With our integrated module system
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎯",
                title: "Better Health Decisions",
                description: "Make informed choices with AI-powered insights",
              },
              {
                icon: "⏱️",
                title: "Save Time",
                description: "Automate healthcare tasks and appointments",
              },
              {
                icon: "👨‍⚕️",
                title: "Connect with Providers",
                description: "Seamless collaboration with healthcare professionals",
              },
              {
                icon: "📈",
                title: "Track Progress",
                description: "Monitor your health improvements over time",
              },
              {
                icon: "🔒",
                title: "Privacy Control",
                description: "Full control over your sensitive health data",
              },
              {
                icon: "📱",
                title: "Access Anywhere",
                description: "Available on all your devices, anytime",
              },
              {
                icon: "⚡",
                title: "Real-time Alerts",
                description: "Instant notifications for important health changes",
              },
              {
                icon: "🏥",
                title: "Holistic Care",
                description: "Complete healthcare management in one platform",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white/50 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground">{item.description}</p>
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
              Experience All Modules Today
            </h2>
            <p className="text-lg text-white/90">
              Get access to our complete suite of healthcare management tools
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white hover:bg-white/90 text-primary font-semibold"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
}

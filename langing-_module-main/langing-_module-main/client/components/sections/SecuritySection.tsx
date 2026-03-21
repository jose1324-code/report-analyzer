import {
  Lock,
  Shield,
  Eye,
  FileCheck,
  CheckCircle2,
  Award,
} from "lucide-react";

const SecuritySection = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Military-Grade Encryption",
      description: "End-to-end encryption for all data in transit and at rest",
      color: "text-blue-600 bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Built from day one to meet healthcare privacy standards",
      color: "text-primary bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      icon: Eye,
      title: "You Own Your Data",
      description: "Complete control over who can access your health information",
      color: "text-emerald-600 bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      icon: FileCheck,
      title: "Transparent Operations",
      description: "Full audit trails and transparency about how your data is used",
      color: "text-purple-600 bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
  ];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Security & Trust</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Your Health Data is <span className="text-primary">Sacred</span>
          </h2>
          <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
            As a healthcare startup, we understand that patient privacy isn't negotiable. Security is built into our DNA.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl border ${feature.borderColor} ${feature.color} p-8 transition-all hover:shadow-lg hover:scale-105 animate-slide-in-up`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${feature.color}`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Our Commitment */}
        <div className="rounded-2xl border border-border bg-white/50 backdrop-blur-sm p-12 mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">Our Commitment to Privacy</h3>
          <div className="space-y-4">
            {[
              "We will never sell your data to third parties",
              "You can delete your account and all data at any time",
              "We use only essential cookies and no tracking pixels",
              "Regular security audits by independent third parties",
              "Transparent privacy policy written in plain English",
              "Your data stays in secure, geographically distributed servers",
            ].map((commitment, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{commitment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Building Trust Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-8 md:p-12 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">
            We're a Startup, Not a Silicon Valley Shortcut
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We understand that healthcare requires trust. Every decision we make—from the technologies we use to the partnerships we form—prioritizes your privacy and security. We're building CareNova to last, and that starts with protecting your most sensitive information.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;

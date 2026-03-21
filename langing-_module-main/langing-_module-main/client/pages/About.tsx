import { Lightbulb, Target, Rocket, Users, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Patient-First Approach",
      description: "We put patients at the center of everything we build, solving real problems they face",
      color: "from-red-500 to-pink-600",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging cutting-edge AI and technology to transform healthcare accessibility",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Lightbulb,
      title: "Simplicity",
      description: "Making complex healthcare management simple, intuitive, and accessible to everyone",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Target,
      title: "Impact",
      description: "Driven by the mission to improve health outcomes for millions globally",
      color: "from-green-500 to-emerald-600",
    },
  ];

  const problems = [
    {
      problem: "Medical Report Confusion",
      description: "Patients struggle to understand medical reports and their implications for their health",
      solution: "AI-powered report analysis with clear, actionable insights",
    },
    {
      problem: "Medication Management",
      description: "Hard to track drugs, prices, interactions, and find alternatives",
      solution: "Comprehensive drug database with real-time pricing and recommendations",
    },
    {
      problem: "Delayed Health Intervention",
      description: "People don't know when symptoms warrant professional help or preventive care",
      solution: "AI symptom checker and health risk prediction tools",
    },
    {
      problem: "Communication Gaps",
      description: "Limited secure communication between patients and healthcare providers",
      solution: "Secure QR-based sharing and doctor verification system",
    },
  ];

  const roadmap = [
    {
      phase: "Phase 1: MVP",
      status: "In Progress",
      items: [
        "Launch medical report analyzer",
        "Build drug information module",
        "Implement user authentication",
        "Initial user onboarding",
      ],
      color: "from-blue-500 to-cyan-600",
    },
    {
      phase: "Phase 2: Expansion",
      status: "Planned Q2 2025",
      items: [
        "Mobile app launch (iOS & Android)",
        "AI chatbot for mental health",
        "Doctor integration features",
        "Healthcare provider partnerships",
      ],
      color: "from-purple-500 to-pink-600",
    },
    {
      phase: "Phase 3: Scale",
      status: "Planned Q4 2025",
      items: [
        "International expansion",
        "Insurance integrations",
        "Advanced predictive analytics",
        "Series A fundraising",
      ],
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-gradient-to-br from-blue-50 via-background to-cyan-50/30">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Early Stage Startup</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            Transforming Healthcare with <span className="text-primary">AI Innovation</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            CareNova is a mission-driven startup using artificial intelligence to democratize access to intelligent healthcare management and empower individuals to take control of their health.
          </p>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              The Problem We're Solving
            </h2>
            <p className="text-lg text-muted-foreground">
              Healthcare today is fragmented, confusing, and inaccessible to many
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {problems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-white/50 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-red-600 mb-2">
                    ❌ {item.problem}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-1">Our Solution:</p>
                  <p className="text-sm text-accent">✓ {item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-foreground leading-relaxed">
                A world where every individual has instant access to intelligent healthcare insights, where medical knowledge is demystified, and where people can make informed decisions about their health without barriers. We envision a future where AI and human expertise work together to prevent disease, enable early detection, and empower individuals to live healthier lives.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/10 to-primary/10 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-foreground leading-relaxed">
                To build the world's most intuitive AI-powered healthcare platform, making advanced medical intelligence accessible to everyone. We're committed to solving real healthcare challenges through technology, making healthcare decisions easier, faster, and smarter for patients and providers alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              What guides us as we build CareNova
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/50 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`inline-flex rounded-lg bg-gradient-to-br ${value.color} p-3 mb-4 text-white`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founding Story */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border bg-white/50 backdrop-blur-sm p-12 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">How It Started</h2>
            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                CareNova was born from a personal frustration. The founders—a combination of AI engineers, healthcare enthusiasts, and frustrated patients—realized there was a massive gap in how people interact with healthcare.
              </p>
              <p>
                When one founder's family member received a complex medical report, they couldn't understand the implications. When another needed to find affordable alternatives to prescribed medications, the process was time-consuming and confusing. These weren't isolated incidents; they represented a widespread problem affecting millions globally.
              </p>
              <p>
                We knew that artificial intelligence could solve this. With access to vast medical knowledge and the ability to process complex health data instantly, AI could be the bridge between patients and healthcare understanding.
              </p>
              <p>
                That insight led to CareNova—a startup with a singular focus: making healthcare accessible, understandable, and actionable for everyone. We're early in our journey, but we're committed to building something that truly matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Roadmap */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Our Roadmap
            </h2>
            <p className="text-lg text-muted-foreground">
              Where we're headed in the coming months
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roadmap.map((phase, index) => (
              <div key={index} className="relative">
                <div className="rounded-xl border border-border bg-white/50 backdrop-blur-sm p-8">
                  <div
                    className={`inline-flex rounded-full bg-gradient-to-br ${phase.color} text-white px-4 py-2 text-sm font-semibold mb-4`}
                  >
                    {phase.status}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    {phase.phase}
                  </h3>
                  <ul className="space-y-3">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {index < roadmap.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-primary/30 text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call for Support */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Become An Early Adopter
            </h2>
            <p className="text-lg text-muted-foreground">
              We're looking for healthcare professionals and innovators who share our vision of transforming healthcare.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white/50 p-6 max-w-md mx-auto w-full">
            <h3 className="font-semibold text-foreground mb-2">📧 Get Early Access</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be among the first to try CareNova and shape our product
            </p>
            <Link to="/contact" className="text-primary font-semibold text-sm hover:text-primary/80 inline-block">
              Join the Beta →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-accent/50 to-primary">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Be Part of the Healthcare Revolution
            </h2>
            <p className="text-lg text-white/90">
              Help us build the future of AI-powered healthcare. Sign up now and get early access to CareNova.
            </p>
          </div>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-primary font-semibold"
            >
              Get Early Access
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

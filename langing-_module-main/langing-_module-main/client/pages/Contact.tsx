import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" });
    alert("Thank you for your message! We'll get back to you soon.");
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email and we'll respond within 24 hours",
      value: "hello@carenova.com",
      link: "mailto:hello@carenova.com",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call our support team during business hours",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: MapPin,
      title: "Address",
      description: "Visit our headquarters",
      value: "123 Healthcare Ave, San Francisco, CA 94107",
      link: "#",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Clock,
      title: "Hours",
      description: "Available Monday to Friday",
      value: "9:00 AM - 6:00 PM PST",
      link: "#",
      color: "from-orange-500 to-red-600",
    },
  ];

  const supportOptions = [
    {
      icon: "📚",
      title: "Knowledge Base",
      description: "Browse our comprehensive help articles and tutorials",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our support team in real-time",
    },
    {
      icon: "📧",
      title: "Email Support",
      description: "Send detailed inquiries to our support team",
    },
    {
      icon: "📞",
      title: "Phone Support",
      description: "Call our dedicated support hotline",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-gradient-to-br from-blue-50 via-background to-cyan-50/30">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <a
                  key={index}
                  href={method.link}
                  className="rounded-xl border border-border bg-white/50 hover:shadow-lg transition-shadow p-6 text-center group"
                >
                  <div
                    className={`inline-flex rounded-lg bg-gradient-to-br ${method.color} p-3 mb-4 text-white group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {method.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {method.description}
                  </p>
                  <p className="text-sm font-medium text-primary">{method.value}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="rounded-2xl border border-border bg-white/50 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a subject</option>
                    <option value="support">Support Request</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Support Options */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Other Ways to Get Help
                </h2>
              </div>

              <div className="space-y-4">
                {supportOptions.map((option, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-white/50 hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">{option.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Quick Links */}
              <div className="rounded-xl border border-border bg-white/50 p-6">
                <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    "How do I get started?",
                    "What payment methods do you accept?",
                    "How is my data secured?",
                    "Do you offer training?",
                  ].map((link, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-sm text-primary hover:text-primary/80 transition"
                      >
                        • {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find quick answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "What is CareNova?",
                answer:
                  "CareNova is an AI-powered healthcare platform that helps you analyze medical reports, manage medications, predict health risks, and connect with healthcare providers securely.",
              },
              {
                question: "How much does CareNova cost?",
                answer:
                  "We offer a free tier with basic features, and premium plans starting at $9.99/month. All plans come with a 30-day free trial.",
              },
              {
                question: "Is my data safe with CareNova?",
                answer:
                  "Yes. We use military-grade encryption, HIPAA compliance, and regular security audits to protect your sensitive health information.",
              },
              {
                question: "Can I share my data with my doctor?",
                answer:
                  "Absolutely. CareNova includes secure sharing features that allow you to share your data with healthcare providers through QR codes and encrypted links.",
              },
              {
                question: "What devices can I use CareNova on?",
                answer:
                  "CareNova is available on iOS, Android, and web browsers. You can access your data from any device, anytime.",
              },
              {
                question: "Do you offer customer support?",
                answer:
                  "Yes. We offer 24/7 email support, live chat, and phone support for premium members. Check our support page for more details.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-white/50 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
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
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/90">
              Join thousands of users who are transforming their healthcare with CareNova
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

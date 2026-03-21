import { Link } from "react-router-dom";
import { Activity, Linkedin, Github, Twitter, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary w-fit">
              <Activity className="h-5 w-5" />
              <span>CareNova</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered healthcare platform for smarter medical insights and better health outcomes.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Product</h3>
            <Link to="/features" className="text-sm text-muted-foreground transition hover:text-primary">
              Features
            </Link>
            <Link to="/modules" className="text-sm text-muted-foreground transition hover:text-primary">
              Modules
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <a href="#" className="text-sm text-muted-foreground transition hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground transition hover:text-primary">
              Terms of Service
            </a>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="text-muted-foreground transition hover:text-primary"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 fill-primary text-primary" /> by CareNova © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

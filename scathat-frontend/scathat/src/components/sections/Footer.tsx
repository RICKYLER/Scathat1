import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Scathat</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="#learn-more" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact-us" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Documentation
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2024 Scathat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

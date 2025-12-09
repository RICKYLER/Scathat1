import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-2xl" />
        {/* Shield silhouette */}
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 opacity-10">
          <Shield className="w-96 h-96 text-primary" strokeWidth={0.5} />
        </div>
      </div>

      <div className="container relative z-10 px-4 md:px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
            Who will protect you... when no one sees?
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            Web3 is revolutionizing finance and digital ownership, but this rapid growth comes with significant risks. 
            Users are losing millions to sophisticated hacks, insidious rugpulls, and dangerous malicious approvals. 
            The promise of decentralization is undermined when trust is repeatedly broken by bad actors. 
            We believe it&apos;s time for a new paradigm in Web3 security.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="glow-primary">
              Learn More
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Sparkles, ShieldCheck } from "lucide-react";

const ctaItems = [
  {
    icon: TrendingUp,
    title: "Invest in Scathat",
    description: "Join us in protecting millions of users and shaping the secure future of decentralized technology."
  },
  {
    icon: Sparkles,
    title: "Revolutionize Security",
    description: "Be at the forefront of the AI-driven smart contract security revolution, setting new industry benchmarks."
  },
  {
    icon: ShieldCheck,
    title: "Enable Safe Web3",
    description: "Help us make Web3 mass adoption safe, reliable, and trustworthy for all participants. Safe Web3 is now possible."
  }
];

const CTASection = () => {
  return (
    <section className="py-24" id="contact-us">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Join the AI-Driven Smart Contract Revolution
          </h2>
          <p className="text-lg text-muted-foreground">
            The future of Web3 is secure, and Scathat is leading the charge. We invite you to be a part of this transformative journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {ctaItems.map((item, index) => (
            <Card key={index} className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-8">
            Together, we can build a Web3 where innovation flourishes without fear, and users can navigate the decentralized world with absolute confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="glow-primary">
              Get Started
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

export default CTASection;

import { Card, CardContent } from "@/components/ui/card";
import { Layers, ShieldCheck, Globe } from "lucide-react";

const visionItems = [
  {
    icon: Layers,
    title: "Ubiquitous Security Layer",
    description: "To become the essential security layer for every Base app and smart wallet, setting a new standard for decentralized protection."
  },
  {
    icon: ShieldCheck,
    title: "Proactive Protection",
    description: "Shift the industry from reactive defense to proactive interception, preventing threats before they can ever impact users."
  },
  {
    icon: Globe,
    title: "Enable Mass Adoption",
    description: "Pave the way for true Web3 mass adoption by making the ecosystem genuinely safe and trustworthy for everyone, everywhere."
  }
];

const VisionSection = () => {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Our Vision: Security You Can Trust
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            At Scathat, we envision a Web3 future where innovation thrives on a foundation of absolute trust and security. 
            Our mission is to make this vision a reality.
          </p>

          <blockquote className="relative max-w-2xl mx-auto mb-12">
            <div className="absolute -left-4 -top-4 text-6xl text-primary/20">&quot;</div>
            <p className="text-2xl md:text-3xl font-medium italic text-foreground relative z-10">
              Scathat: Security you don&apos;t have to understand — just trust.
            </p>
            <div className="absolute -right-4 -bottom-4 text-6xl text-primary/20">&quot;</div>
          </blockquote>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {visionItems.map((item, index) => (
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
      </div>
    </section>
  );
};

export default VisionSection;

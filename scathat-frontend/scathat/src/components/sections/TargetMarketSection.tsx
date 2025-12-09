import { Card, CardContent } from "@/components/ui/card";
import { Users, Code2, Wallet, Layers } from "lucide-react";

const markets = [
  {
    icon: Users,
    title: "Everyday Web3 Users",
    description: "Shielding millions from scams, rugpulls, and phishing attempts, allowing them to explore dApps and manage assets with confidence."
  },
  {
    icon: Code2,
    title: "Developers",
    description: "Providing fast, AI-powered security checks during the development lifecycle, accelerating secure dApp creation and deployment."
  },
  {
    icon: Wallet,
    title: "Wallets & dApps",
    description: "Offering a plug-and-play security layer that enhances their platforms, attracting more users by guaranteeing a safer environment."
  },
  {
    icon: Layers,
    title: "Base Ecosystem",
    description: "Onboarding the next billion users safely onto the Base network, fostering trust and rapid, secure innovation within the ecosystem."
  }
];

const TargetMarketSection = () => {
  return (
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Empowering Web3 for Everyone: Our Target Market
          </h2>
          <p className="text-lg text-muted-foreground">
            Scathat is built to serve as the foundational security layer for the entire Web3 ecosystem, 
            bringing unparalleled protection and trust to diverse user groups.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {markets.map((market, index) => (
            <Card key={index} className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <market.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{market.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{market.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetMarketSection;

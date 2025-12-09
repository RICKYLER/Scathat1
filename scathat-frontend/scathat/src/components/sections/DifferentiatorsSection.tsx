import { Zap, Eye, Shield, Cpu } from "lucide-react";

const differentiators = [
  {
    icon: Zap,
    title: "Real-time AI Analysis",
    description: "Our proprietary AI engine conducts lightning-fast analysis of smart contract source code, bytecode, and behavioral patterns, identifying emerging threats before they materialize."
  },
  {
    icon: Eye,
    title: "Detecting Verified + Risky Contracts",
    description: "We go beyond surface-level checks, capable of uncovering hidden backdoors and subtle vulnerabilities even within seemingly verified or whitelisted contracts, thwarting sophisticated attacks."
  },
  {
    icon: Shield,
    title: "AgentKit Enforcement",
    description: "The true game-changer. Scathat doesn't just warn; it actively prevents unsafe transactions from occurring on-chain, acting as a direct shield for your assets."
  },
  {
    icon: Cpu,
    title: "Hybrid AI Engine",
    description: "Our system leverages a powerful combination of three distinct AI models, ensuring intelligence, speed, and accuracy in detecting a wide range of exploits and scams."
  }
];

const DifferentiatorsSection = () => {
  return (
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Unrivaled Protection: Scathat&apos;s Key Differentiators
          </h2>
          <p className="text-lg text-muted-foreground">
            Scathat stands apart from existing solutions by integrating predictive AI with on-chain enforcement, 
            offering a level of proactive security unmatched in the Web3 space.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {differentiators.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 p-3 h-fit rounded-lg bg-primary/10 border border-primary/20">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground">
            With Scathat, you&apos;re not just getting a warning; you&apos;re getting an <span className="text-primary font-semibold">active protector</span> that 
            intervenes to keep your Web3 experience secure.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;

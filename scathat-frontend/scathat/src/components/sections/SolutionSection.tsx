import { Card, CardContent } from "@/components/ui/card";
import { Bot, Search, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Agent",
    description: "Our advanced AI agent meticulously analyzes smart contracts in real-time, identifying hidden risks and malicious patterns that human auditors or traditional tools might miss."
  },
  {
    icon: Search,
    title: "BaseScan Integration",
    description: "Leveraging BaseScan data, Scathat gains deep insights into contract history, deployment patterns, and code integrity, providing a comprehensive risk assessment."
  },
  {
    icon: Zap,
    title: "AgentKit Enforcement",
    description: "Powered by AgentKit, our solution enforces security policies directly on-chain, enabling automatic blocking, limiting, or pausing of risky transactions before they impact your wallet."
  }
];

const SolutionSection = () => {
  return (
    <section className="py-24" id="learn-more">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 glow-subtle">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Scathat: Your Shield in the Web3 Universe
          </h2>
          <p className="text-lg text-muted-foreground">
            Introducing Scathat, a revolutionary Web3 security solution designed to protect users proactively. 
            We combine cutting-edge AI with robust on-chain enforcement to create an impenetrable defense against digital threats.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 hover:glow-subtle">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground">
            Scathat works <span className="text-primary font-semibold">before</span> you sign, providing crucial real-time protection and labeling contracts as 
            <span className="text-green-400 font-semibold"> Safe</span>, 
            <span className="text-yellow-400 font-semibold"> Warning</span>, or 
            <span className="text-red-400 font-semibold"> Dangerous</span>. 
            This proactive approach safeguards your assets and brings true peace of mind to your Web3 journey.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;

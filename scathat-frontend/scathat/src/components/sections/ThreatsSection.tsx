import { Card, CardContent } from "@/components/ui/card";
import { Code, ShieldAlert, Clock, FileWarning } from "lucide-react";

const threats = [
  {
    icon: Code,
    title: "Complexity of Smart Contracts",
    description: "Users are often asked to interact with complex smart contracts they cannot genuinely read or understand. The intricate code makes it nearly impossible for the average user to discern legitimate transactions from malicious ones."
  },
  {
    icon: ShieldAlert,
    title: "False Sense of Security",
    description: "Even \"verified\" contracts are not always safe. Malicious actors can hide backdoors or subtle vulnerabilities in seemingly legitimate code, bypassing standard verification processes and leading users into traps."
  },
  {
    icon: Clock,
    title: "Too Little, Too Late",
    description: "Current wallet warnings often appear only after a transaction has been initiated or is about to be confirmed. Users frequently press \"Confirm\" without truly understanding the underlying risks, blinded by the promise of opportunity."
  },
  {
    icon: FileWarning,
    title: "Reactive & Inefficient Audits",
    description: "Existing auditing tools are typically slow, expensive, and reactive. They focus on post-mortem analysis or pre-deployment checks that don't adapt to real-time threats, leaving a critical gap in live transaction protection."
  }
];

const ThreatsSection = () => {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            The Unseen Threat: Why Web3 Users Are Vulnerable
          </h2>
          <p className="text-lg text-muted-foreground">
            The current state of Web3 security leaves users exposed to an array of threats that are often invisible until it's too late. 
            Millions are lost annually due to increasingly sophisticated scams and exploits, eroding trust and hindering mainstream adoption.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {threats.map((threat, index) => (
            <Card key={index} className="card-gradient border-border/50 hover:border-primary/30 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <threat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{threat.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{threat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreatsSection;

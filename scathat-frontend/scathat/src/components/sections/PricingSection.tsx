import { Card, CardContent } from "@/components/ui/card";

const tiers = [
  {
    step: 1,
    title: "Freemium (Users)",
    description: "Basic real-time contract scanning and instant warnings, providing essential protection for all Web3 participants at no cost."
  },
  {
    step: 2,
    title: "Pro (Developers)",
    description: "Subscription-based deep analysis, automated deployment audits, and advanced vulnerability detection for secure dApp development."
  },
  {
    step: 3,
    title: "API (Wallets/dApps)",
    description: "Integrable risk scoring and approval-limit engines, allowing platforms to enhance their security offerings and protect their user base."
  },
  {
    step: 4,
    title: "Enterprise Solutions",
    description: "Tailored automated audit suites, continuous monitoring for complex systems, and high-volume API access for institutional clients and major protocols."
  }
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Scalable Security: Our Robust Revenue Model
          </h2>
          <p className="text-lg text-muted-foreground">
            Scathat&apos;s revenue model is designed for sustainable growth, catering to the diverse needs of the Web3 community, 
            from individual users to enterprise-level platforms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {tiers.map((tier, index) => (
            <Card key={index} className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-4">
                  {tier.step}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{tier.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground">
            This multi-tiered approach ensures that Scathat can deliver value across the entire spectrum of Web3 interaction, 
            fostering a safer digital landscape while building a resilient business.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

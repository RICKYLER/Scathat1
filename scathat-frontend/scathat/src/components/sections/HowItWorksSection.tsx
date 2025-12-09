import { Wallet, FileCode, Brain, Bell } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    step: 1,
    title: "Connect Wallet",
    description: "User links wallet to Scathat Extension"
  },
  {
    icon: FileCode,
    step: 2,
    title: "Capture Contract",
    description: "Extension intercepts contract interaction"
  },
  {
    icon: Brain,
    step: 3,
    title: "AI Analysis",
    description: "AI queries BaseScan and assesses risk"
  },
  {
    icon: Bell,
    step: 4,
    title: "Enforce & Notify",
    description: "AgentKit enforces actions; user sees label"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            How Scathat Works: A Seamless Security Flow
          </h2>
          <p className="text-lg text-muted-foreground">
            Scathat integrates effortlessly into your Web3 experience, providing a continuous layer of protection without interrupting your workflow.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-0 max-w-5xl mx-auto mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center text-center w-48">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-card border-2 border-primary/50 flex items-center justify-center mb-4 glow-subtle">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground leading-relaxed">
            From the moment you connect your wallet, Scathat begins its protective measures. Our AI agent instantly queries BaseScan for contract data, 
            performs deep analysis, and then, if necessary, AgentKit steps in to block or limit dangerous actions. 
            You receive clear, real-time risk labels (<span className="text-green-400">Green</span>, <span className="text-yellow-400">Orange</span>, <span className="text-red-400">Red</span>), 
            empowering you with critical information <span className="text-primary font-semibold">before</span> committing to any transaction.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

"use client"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer, scaleIn, viewportConfig } from "@/lib/animations/variants"

export function Solution() {
  const features = [
    "Scans contracts instantly",
    "Detects risky patterns, rugpull logic, and hidden exploits",
    "Shows a simple Safe/Warning/Dangerous risk score",
    "Uses AgentKit to block unsafe transactions and limit approvals"
  ]

  const userTypes = [
    { name: "Everyday Users", description: "Protection from scams and phishing" },
    { name: "Developers", description: "Fast AI security checks" },
    { name: "Wallets & dApps", description: "Plug-and-play safety layer" }
  ]

  return (
    <section id="solution" className="w-full px-4 py-20 sm:py-32 lg:py-40">
      <motion.div 
        className="mx-auto max-w-4xl space-y-12"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={staggerContainer}
      >
        <motion.div className="text-center space-y-4" variants={fadeInUp}>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">The Solution</h2>
          <motion.p 
            className="text-lg text-muted-foreground"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            AI that analyzes smart contracts in real time and protects you before you sign
          </motion.p>
        </motion.div>

        <motion.div className="space-y-6" variants={staggerContainer}>
          <motion.div 
            className="rounded-lg border border-border bg-card/50 p-8 space-y-4"
            variants={{
              hidden: scaleIn.hidden,
              visible: scaleIn.visible
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-xl font-bold text-accent">What Scathat does:</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start gap-3"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="grid gap-4 md:grid-cols-3"
            variants={staggerContainer}
          >
            {userTypes.map((user, index) => (
              <motion.div
                key={index}
                className="rounded-lg border border-border bg-card p-6 text-center space-y-2"
                variants={{
                  hidden: scaleIn.hidden,
                  visible: scaleIn.visible
                }}
                transition={{ 
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="text-sm text-muted-foreground"></div>
                <div className="font-bold text-foreground">{user.name}</div>
                <p className="text-sm text-muted-foreground">{user.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Protect Your Assets?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands of users who are already scanning contracts safely.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
            Download Extension
          </Button>
          <Button size="lg" variant="outline">
            Try Demo
          </Button>
        </div>
      </div>
    </section>
  )
}

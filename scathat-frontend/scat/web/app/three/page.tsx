export const dynamic = "force-static"
export const revalidate = 0

export default function ThreeDemo() {
  return (
    <main className="min-h-screen bg-background text-(--foreground)">
      <div className="p-4 border-b border-(--border)">
        <h1 className="text-2xl font-bold">Three.js Demo</h1>
        <p className="text-(--muted)">Drop orb.glb, shield.glb, particle_net.glb under /public/models</p>
      </div>
      <canvas id="three-canvas" className="block w-full h-[calc(100vh-64px)]"></canvas>
      <script type="module" src="/three/three-scene.js"></script>
    </main>
  )
}


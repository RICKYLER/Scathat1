"use client"
import { Suspense, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, ContactShadows, useGLTF } from "@react-three/drei"
import type { Group } from "three"

function Model() {
  const group = useRef<Group>(null)
  let gltf: any
  let shieldGltf: any
  try {   
    gltf = useGLTF("/models/scathat.glb") as any
  } catch (e) {
    gltf = null
  }
  try {
    shieldGltf = useGLTF("/models/shield.glb") as any
  } catch (e) {
    shieldGltf = null
  }
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.y = t * 0.2
      group.current.position.y = Math.sin(t * 0.8) * 0.12
    }
  })
  if (gltf?.scene) {
    return <primitive ref={group} object={gltf.scene} position={[0, 0, 0]} />
  }
  if (shieldGltf?.scene) {
    return <primitive ref={group} object={shieldGltf.scene} position={[0, 0, 0]} />
  }
  return (
    <group ref={group}>
      <Float speed={1} rotationIntensity={0.25} floatIntensity={0.55}>
        <mesh position={[0, 0, 0]} scale={[1.15, 1.0, 1.15]}>
          <torusGeometry args={[1.25, 0.12, 64, 160]} />
          <meshStandardMaterial color="#0f172a" emissive="#ff5bd3" emissiveIntensity={0.6} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.05, 0]} rotation={[0.15, 0, 0]} scale={[1.0, 0.9, 0.2]}>
          <octahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial color="#0b1020" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.1, 0.35]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.12, 0.22, 0.6]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </Float>
    </group>
  )
}

const DynamicCanvas = dynamic(async () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <Canvas camera={{ position: [0, 0.6, 4.5], fov: 42 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      {children}
    </Canvas>
  ),
}), { ssr: false })

export default function Hero3D() {
  return (
    <section className="w-full px-6 py-16 sm:py-24 lg:py-28 bg-transparent">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Who will protect you…
            <span className="block text-accent">In a world where no one sees?</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Scathat protects you with AI-powered real-time smart contract analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#download" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground">
              Download Extension
            </Link>
            <Link href="#demo" className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-border bg-transparent">
              View Demo
            </Link>
          </div>
        </div>

        <div className="relative h-[360px] sm:h-[420px] lg:h-[500px] rounded-xl border border-white/10 bg-transparent backdrop-blur-sm overflow-hidden">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading 3D…</div>}>
            <DynamicCanvas style={{ background: 'transparent' }}>
              <Model />
              <Environment preset="city" />
              <ContactShadows opacity={0.35} scale={10} blur={2.4} far={4} position={[0, -1.2, 0]} />
            </DynamicCanvas>
          </Suspense>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent mix-blend-soft-light" />
          <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-20" style={{ backgroundImage: `repeating-linear-gradient(20deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 18px)` }} />
        </div>
      </div>
    </section>
  )
}

useGLTF.preload("/models/scathat.glb")
useGLTF.preload("/models/shield.glb")

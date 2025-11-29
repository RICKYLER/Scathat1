"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float, Environment, useGLTF } from "@react-three/drei"

type OrbShieldCanvasProps = {
  useModels?: boolean
  height?: number
}

function Orb() {
  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial emissive="#22d3ee" emissiveIntensity={1.2} color="#0ea5e9" metalness={0.3} roughness={0.4} />
      </mesh>
    </Float>
  )
}

function Shield() {
  return (
    <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh position={[2.6, -0.2, -0.4]} rotation={[0.2, -0.6, 0.1]}>
        <torusGeometry args={[1.0, 0.18, 32, 100]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
    </Float>
  )
}

function Models() {
  const orb = useGLTF("/models/orb.glb") as any
  const shield = useGLTF("/models/shield.glb") as any
  return (
    <group>
      <primitive object={orb.scene} position={[0, 0, 0]} scale={1.5} />
      <primitive object={shield.scene} position={[2.6, -0.2, -0.4]} scale={1.4} />
    </group>
  )
}

export function OrbShieldCanvas({ useModels = false, height = 320 }: OrbShieldCanvasProps) {
  return (
    <div style={{ height }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        {useModels ? <Models /> : (<>
          <Orb />
          <Shield />
        </>)}
        <Environment preset="city" />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}


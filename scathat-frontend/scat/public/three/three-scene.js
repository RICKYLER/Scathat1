// three-scene.js (ES module style)
import * as THREE from 'https://unpkg.com/three@0.181.2/build/three.module.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.181.2/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'https://unpkg.com/three@0.181.2/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'https://unpkg.com/three@0.181.2/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://unpkg.com/three@0.181.2/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'https://unpkg.com/three@0.181.2/examples/jsm/postprocessing/UnrealBloomPass.js'

const canvas = document.querySelector('#three-canvas')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x050505)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 1.5, 6)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.3)
scene.add(hemi)

const point = new THREE.PointLight(0x66ff88, 1.2, 20)
point.position.set(2, 2, 2)
scene.add(point)

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.4, 0.85)
composer.addPass(bloomPass)

const loader = new GLTFLoader()
const models = {}

loader.load('/models/orb.glb', (gltf) => {
  const obj = gltf.scene
  obj.scale.set(1.2, 1.2, 1.2)
  obj.position.set(0, 0, 0)
  scene.add(obj)
  models.orb = obj
})

loader.load('/models/shield.glb', (gltf) => {
  const obj = gltf.scene
  obj.scale.set(1.2, 1.2, 1.2)
  obj.position.set(2.4, -0.2, -0.4)
  scene.add(obj)
  models.shield = obj
})

loader.load('/models/particle_net.glb', (gltf) => {
  const obj = gltf.scene
  obj.scale.set(1, 1, 1)
  obj.position.set(-2, -0.3, -0.6)
  scene.add(obj)
  models.network = obj
})

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onResize)

const clock = new THREE.Clock()
function animate() {
  const dt = clock.getDelta()
  controls.update()
  composer.render()
  requestAnimationFrame(animate)
}
animate()


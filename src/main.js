import * as THREE from "three";
import { createCamera } from "./camera.js";
import { PuzzleArea } from "./objects/PuzzleArea.js";

// Scene: root container for everything that gets rendered
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera: aimed at the puzzle area in camera.js
const camera = createCamera(window.innerWidth / window.innerHeight);
scene.add(camera);

// Renderer:
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting:
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const puzzleArea = new PuzzleArea();
scene.add(puzzleArea);

// Keep the render resolution/aspect in sync with the window
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

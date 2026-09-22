import * as THREE from "three";
import { createCamera } from "./camera.js";
import { PuzzleArea } from "./objects/PuzzleArea.js";
import { PuzzleGenerator } from "./objects/PuzzleGenerator.js";

/**
 * Sets up the scene, camera, renderer, and lighting, then starts the render loop
 * @author Peter Hajj
 */

// Scene: root container for everything that gets rendered
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera: aimed at the puzzle area in camera.js
const camera = createCamera(window.innerWidth / window.innerHeight);
scene.add(camera);

// Renderer:
const renderer = new THREE.WebGLRenderer({ antialias: true });
//renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting:
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const puzzleArea = new PuzzleArea(camera, 500);
scene.add(puzzleArea);

// Keep the render resolution/aspect in sync with the window
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Raycaster and mouse vector for detecting clicks on puzzle pieces
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedPiece = null;
let isDragging = false;

// 2D plane for dragging puzzle pieces
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const dragPoint = new THREE.Vector3();

// Event listeners for mouse events
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseup", onMouseUp);
window.addEventListener("mousedown", onMouseDown);

/**
 * Handles mouse move events to update the position of the selected puzzle piece
 * @param {*} event the mouse event
 */
function onMouseMove(event) {
  if (!isDragging || !selectedPiece) {
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Find mouse position on the puzzle plane
  if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
    selectedPiece.position.x = dragPoint.x + selectedPiece.dragOffset.x;

    selectedPiece.position.y = dragPoint.y + selectedPiece.dragOffset.y;
  }
}

//Generator for the puzzle pieces & points
const generator = new PuzzleGenerator(puzzleArea.radius);

// Generate and display the random points
const points = generator.generateRandomPoints();
points.position.z = 0.01;
scene.add(points);

const puzzleGroup = generator.generatePuzzleMesh();

scene.add(puzzleGroup);

/**
 * Handles mouse up events to stop dragging the selected puzzle piece
 */
function onMouseUp() {
  if (selectedPiece) {
    selectedPiece.snapToOriginalIfClose();
  }

  isDragging = false;
  selectedPiece = null;
}

/**
 * Handles mouse down events to start dragging the selected puzzle piece
 * @param {*} event the mouse event
 */
function onMouseDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(puzzleGroup.children, true);

  if (intersects.length > 0) {
    const mesh = intersects[0].object;

    selectedPiece = mesh.userData.puzzlePiece;

    if (selectedPiece) {
      isDragging = true;

      // Find where the mouse is on the XY plane
      raycaster.ray.intersectPlane(dragPlane, dragPoint);

      // Preserve the offset between the mouse and piece
      selectedPiece.dragOffset.subVectors(selectedPiece.position, dragPoint);
    }
  }
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

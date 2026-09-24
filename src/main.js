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

// Generate the random points used to carve up the puzzle pieces (not rendered)
generator.generateRandomPoints();

const puzzleGroup = generator.generatePuzzleMesh();

// Assisted by Claude
// Scatter pieces to random spawn positions within the visible viewport,
// avoiding overlap with the board or other pieces
const distance = camera.position.z;
const visibleHeight =
  2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
const visibleWidth = visibleHeight * camera.aspect;

generator.scatterPieces(
  puzzleGroup,
  visibleWidth / 2,
  visibleHeight / 2,
  puzzleArea.radius,
);

scene.add(puzzleGroup);

// Code grabbed from threejs website.
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );
// create a global audio source
const snapSound = new THREE.Audio( listener );
// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'src/sounds/snap.mp3', function( buffer ) {
	snapSound.setBuffer( buffer );
	snapSound.setLoop( false );
	snapSound.setVolume( 0.5 );
});

const completedListener = new THREE.AudioListener();
camera.add( completedListener );
const completedSound = new THREE.Audio( completedListener );
audioLoader.load( 'src/sounds/complete.mp3', function( buffer ) {
  completedSound.setBuffer( buffer );
  completedSound.setLoop( false );
  completedSound.setVolume( 0.5 );
});

let completedPieces = 0;

/**
 * Handles mouse up events to stop dragging the selected puzzle piece
 */
function onMouseUp() {
  if (selectedPiece) {
    restoreColor(selectedPiece);

    let snapped = selectedPiece.snapToOriginalIfClose();
    if (snapped) {
      snapSound.play();
      // Set snapped piece color to black
      selectedPiece.children[0].material.color.set(0x000000);
      completedPieces++;
      if (completedPieces == puzzleGroup.children.length) {
        // Set all pieces to white
        puzzleGroup.children.forEach((piece) => {
          piece.children[0].material.color.set(0xffffff);
        });
        completedSound.play();
      }
    }
  }

  isDragging = false;
  selectedPiece = null;
}

/**
 * Shifts the color of a puzzle piece to a similar shade by changing its
 * lightness by a uniform amount (hue and saturation stay the same)
 * @param {*} piece the puzzle piece to highlight
 */
function highlightColor(piece) {
  const amount = 0.15;

  piece.traverse((child) => {
    if (child.isMesh && child.material) {
      // Save the original color so it can be restored on mouse up
      child.userData.originalColor = child.material.color.clone();

      const hsl = {};
      child.material.color.getHSL(hsl);

      // Lighten the color, or darken it if it's already too light to lighten
      const offset = hsl.l + amount > 1 ? -amount : amount;
      child.material.color.offsetHSL(0, 0, offset);
    }
  });
}

/**
 * Restores a puzzle piece to the color it had before highlightColor was called
 * @param {*} piece the puzzle piece to restore
 */
function restoreColor(piece) {
  piece.traverse((child) => {
    if (child.isMesh && child.userData.originalColor) {
      child.material.color.copy(child.userData.originalColor);
      delete child.userData.originalColor;
    }
  });
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
      if (selectedPiece.isLocked) {
        selectedPiece = null;
      } else {
        isDragging = true;

        // Find where the mouse is on the XY plane
        raycaster.ray.intersectPlane(dragPlane, dragPoint);

        // Preserve the offset between the mouse and piece
        selectedPiece.dragOffset.subVectors(selectedPiece.position, dragPoint);

        highlightColor(selectedPiece);
      }
    }
  }
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

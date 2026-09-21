import * as THREE from "three";

/**
 * This object represents the octagon puzzle play area
 * @author Peter Hajj
 */
export class PuzzleArea extends THREE.Group {
  /**
   * @param {THREE.PerspectiveCamera} camera: scene's camera, used to size the octagon in pixels
   * @param {number} pixelSize = 500: screen pixel diameter of the octagon
   */
  constructor(camera, pixelSize = 500) {
    super();

    // Convert the desired pixel size into world units, based on how much vertical
    // world-space the camera's perspective projection covers at the octagon's depth (assisted by Claude Code)
    const distance = camera.position.z; // Octagon sits at z = 0
    const visibleHeight =
      2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const worldUnitsPerPixel = visibleHeight / window.innerHeight;
    const radius = (pixelSize / 2) * worldUnitsPerPixel;

    this.radius = radius;

    // Circle with 8 triangle segments to create an octogon shape
    const geometry = new THREE.CircleGeometry(radius, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x1f2430 });
    const octogon = new THREE.Mesh(geometry, material);

    // Outline of the play area, using a scaled up octogon
    const outlineScale = 1.15;
    const outlineGeometry = new THREE.CircleGeometry(radius * outlineScale, 8);
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x4a5568 });
    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
    // Outline is below the original in the z axis
    outline.position.z = -0.01;

    this.add(outline);
    this.add(octogon);

    // Rotate by pi/8 because pi = 180 degrees
    this.rotation.z = Math.PI / 8;
  }
}

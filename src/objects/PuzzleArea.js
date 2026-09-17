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
      const visibleHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const worldUnitsPerPixel = visibleHeight / window.innerHeight;
      const radius = (pixelSize / 2) * worldUnitsPerPixel;

      // Circle with 8 triangle segments to create an octogon shape
      const geometry = new THREE.CircleGeometry(radius, 8); 
      const material = new THREE.MeshBasicMaterial({color: 0x1F2430});
      const octogon = new THREE.Mesh(geometry,material);

      this.add(octogon);
   }
}

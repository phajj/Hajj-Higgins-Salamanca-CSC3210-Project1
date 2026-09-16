import * as THREE from "three";

export function createCamera(aspect) {
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 500);
  camera.position.z = 35;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}

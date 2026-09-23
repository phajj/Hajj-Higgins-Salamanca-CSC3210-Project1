import * as THREE from "three";

/**
 * Represents one piece of the octagon puzzle
 * Assisted by Chat GPT
 * @author Laura Salamanca
 */
export class PuzzlePiece extends THREE.Group {
  constructor(points, color, id, radius) {
    super();

    this.pieceIndex = id;

    // Save the original shape
    this.originalPoints = points.map((point) => point.clone());

    // Assisted by Claude
    // Centroid and bounding radius of the piece's solved-position polygon,
    // used when scattering the piece to a random spawn location.
    this.centroid = this.originalPoints
      .reduce((sum, p) => sum.add(p), new THREE.Vector2())
      .divideScalar(this.originalPoints.length);

    this.boundingRadius = Math.max(
      ...this.originalPoints.map((p) => p.distanceTo(this.centroid)),
    );

    const shape = new THREE.Shape();

    shape.moveTo(points[0].x, points[0].y);

    // Create the shape of the piece from the points
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }

    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);

    const material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Connect the mesh back to its PuzzlePiece
    mesh.userData.puzzlePiece = this;

    this.add(mesh);

    // Save starting position
    this.originalPosition = this.position.clone();

    // Distance to where the piece will snap back to if released close enough
    this.snapThreshold = radius * 0.05;

    this.dragOffset = new THREE.Vector3();

    this.isLocked = false;
  }

  /**
   * If the piece's current position is within its snap threshold of its
   * original position, snaps the piece back to its original position.
   * Called on drag release.
   * @returns { boolean } true if the piece snapped back
   */
  snapToOriginalIfClose() {
    const distance = this.position.distanceTo(this.originalPosition);

    if (distance <= this.snapThreshold) {
      this.position.copy(this.originalPosition);
      this.isLocked = true;
      return true;
    }

    return false;
  }
}

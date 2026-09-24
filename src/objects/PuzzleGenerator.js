import * as THREE from "three";
import { PuzzlePiece } from "./PuzzlePiece.js";
/**
 * This object is responsible for helping to generate the puzzle pieces for the octagon puzzle
 * @author Laura Salamanca
 */
export class PuzzleGenerator {
  constructor(radius) {
    this.radius = radius;
  }

  /**
   * Checks if a point is inside the octagon
   * @param {*} x the x coordinate of the point
   * @param {*} y the y coordinate of the point
   * @returns
   */
  isInsideOctagon(x, y) {
    const r = this.radius;

    return (
      Math.abs(x) <= r * Math.cos(Math.PI / 8) &&
      Math.abs(y) <= r * Math.cos(Math.PI / 8) &&
      Math.abs(x) + Math.abs(y) <= r * Math.sqrt(2) * Math.cos(Math.PI / 8)
    );
  }

  /**
   * Generates 10 random points inside the octagon and returns them as a THREE.Points object
   * The points are used to generate the random puzzle pieces
   * @returns
   */
  generateRandomPoints() {
    const vertices = new Float32Array(10 * 2);
    const colors = new Float32Array(10 * 3);

    this.points = [];

    //Generate random 10 points and colors
    for (let i = 0; i < 10; i++) {
      let x;
      let y;

      do {
        x = THREE.MathUtils.randFloat(-this.radius, this.radius);
        y = THREE.MathUtils.randFloat(-this.radius, this.radius);
      } while (!this.isInsideOctagon(x, y));

      this.points.push(new THREE.Vector2(x, y));

      vertices[i * 2] = x;
      vertices[i * 2 + 1] = y;

      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }

    const pointGeometry = new THREE.BufferGeometry();

    pointGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 2),
    );

    pointGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pointMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 1.0,
    });

    const pointMesh = new THREE.Points(pointGeometry, pointMaterial);

    return pointMesh;
  }

  /**
   * Gets the vertices of the octagon as an array of THREE.Vector2 objects
   * Used to generate the puzzle pieces by clipping the octagon with the random points
   * @returns
   */
  getOctagonVertices() {
    const vertices = [];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;

      vertices.push(
        new THREE.Vector2(
          this.radius * Math.cos(angle),
          this.radius * Math.sin(angle),
        ),
      );
    }

    return vertices;
  }

  /**
   * Clips a polygon with a line defined by two points
   * Assisted by ChatGPT
   * @param {*} polygon the polygon to clip
   * @param {*} a the first point defining the line
   * @param {*} b the second point defining the line
   * @returns the clipped polygon
   */
  clipPolygon(polygon, a, b) {
    const result = [];

    //Find direction between a and b
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const boundary = (b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y) / 2;

    for (let i = 0; i < polygon.length; i++) {
      const current = polygon[i];
      const previous = polygon[(i + polygon.length - 1) % polygon.length];

      const currentValue = dx * current.x + dy * current.y;

      const previousValue = dx * previous.x + dy * previous.y;

      const currentInside = currentValue <= boundary;
      const previousInside = previousValue <= boundary;

      if (currentInside && previousInside) {
        // Both points are inside
        result.push(current);
      } else if (previousInside && !currentInside) {
        // Leaving the polygon
        result.push(this.getIntersection(previous, current, dx, dy, boundary));
      } else if (!previousInside && currentInside) {
        // Entering the polygon
        result.push(this.getIntersection(previous, current, dx, dy, boundary));

        result.push(current);
      }
    }

    return result;
  }

  /**
   * Gets the intersection point of a line and a plane
   * Assisted by ChatGPT
   * @param {*} p1 the first point on the line
   * @param {*} p2 the second point on the line
   * @param {*} dx the x-component of the plane normal
   * @param {*} dy the y-component of the plane normal
   * @param {*} boundary the distance from the origin to the plane
   * @returns the intersection point
   */
  getIntersection(p1, p2, dx, dy, boundary) {
    const x1 = p1.x;
    const y1 = p1.y;

    const x2 = p2.x;
    const y2 = p2.y;

    const denominator = dx * (x2 - x1) + dy * (y2 - y1);

    const t = (boundary - dx * x1 - dy * y1) / denominator;

    return new THREE.Vector2(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
  }

  /**
   * Generates the puzzle pieces by clipping the octagon with the random points
   * Assisted by ChatGPT
   * @returns an array of arrays of THREE.Vector2 objects representing the puzzle pieces
   */
  generatePuzzlePieces() {
    const octagon = this.getOctagonVertices();
    const pieces = [];

    // Make sure random points exist
    if (!this.points || this.points.length === 0) {
      this.generateRandomPoints();
    }

    // Create one piece for each random point
    for (let i = 0; i < this.points.length; i++) {
      let polygon = [...octagon];

      const currentPoint = this.points[i];

      // Cut the octagon using every other point
      for (let j = 0; j < this.points.length; j++) {
        if (i === j) {
          continue;
        }

        const otherPoint = this.points[j];

        polygon = this.clipPolygon(polygon, currentPoint, otherPoint);

        // If the polygon disappears, stop
        if (polygon.length === 0) {
          break;
        }
      }

      pieces.push(polygon);
    }

    return pieces;
  }

  /**
   * Generates the puzzle mesh by creating a PuzzlePiece for each piece and adding it to a THREE.Group
   * @returns a THREE.Group containing the puzzle pieces
   */
  generatePuzzleMesh() {
    const pieces = this.generatePuzzlePieces();

    const group = new THREE.Group();

    for (let i = 0; i < pieces.length; i++) {
      const color = new THREE.Color(
        Math.random(),
        Math.random(),
        Math.random(),
      );

      const piece = new PuzzlePiece(pieces[i], color, i, this.radius);

      group.add(piece);
    }

    return group;
  }

  /**
   * Assisted by Claude
   * Assigns each piece in the group a random spawn position, redrawing the
   * coordinates whenever they overlap the puzzle board or an already-placed
   * piece.
   * @param {THREE.Group} group the group of PuzzlePiece objects to scatter
   * @param {number} halfWidth half the width of the visible viewport
   * @param {number} halfHeight half the height of the visible viewport
   * @param {number} boardRadius radius of the puzzle board to avoid overlapping
   */
  scatterPieces(group, halfWidth, halfHeight, boardRadius) {
    // Cap how many times we'll redraw a piece's coordinates - some pieces
    // are big enough (relative to a small window) that a perfectly
    // non-overlapping spot may not exist, so we fall back to the last
    // draw rather than looping forever.
    const maxAttempts = 300;

    for (let i = 0; i < group.children.length; i++) {
      const piece = group.children[i];

      // Keep the piece fully on-screen regardless of how big it is
      const marginWidth = Math.max(0, halfWidth - piece.boundingRadius);
      const marginHeight = Math.max(0, halfHeight - piece.boundingRadius);

      let x,
        y,
        overlaps,
        attempts = 0;

      do {
        x = THREE.MathUtils.randFloat(-marginWidth, marginWidth);
        y = THREE.MathUtils.randFloat(-marginHeight, marginHeight);

        // Overlaps the puzzle board if the drawn coordinates fall inside it
        overlaps = Math.hypot(x, y) < boardRadius;

        for (let j = 0; j < i && !overlaps; j++) {
          const other = group.children[j];
          const dist = Math.hypot(
            x - other.position.x - other.centroid.x,
            y - other.position.y - other.centroid.y,
          );
          overlaps = dist < piece.boundingRadius + other.boundingRadius;
        }

        attempts++;
      } while (overlaps && attempts < maxAttempts);

      // Offset the piece so its centroid lands at (x, y). originalPosition
      // was already captured as (0,0,0) at construction, so this only
      // changes where the piece starts — snapping back to (0,0,0) still works.
      piece.position.set(x - piece.centroid.x, y - piece.centroid.y, 0);
    }
  }
}

import * as THREE from 'three';

/** Deterministic hash noise — cheap, seedable, no external noise library needed. */
function hash(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Builds an irregular, hand-forged-looking ring rather than a
 * perfect mathematical torus. Every vertex is nudged by layered
 * hash noise sampled around the ring's circumference, so the
 * cross-section subtly swells and narrows like a real cast/
 * polished object instead of a CG primitive.
 *
 * Shared across the environmental scroll rings (WebGLScene) and
 * any future standalone ring-based components so the "sculptural"
 * look stays consistent site-wide.
 */
export function buildSculpturalRingGeometry(
  radius: number,
  tube: number,
  radialSeg = 220,
  tubularSeg = 48
): THREE.TorusGeometry {
  const geo = new THREE.TorusGeometry(radius, tube, tubularSeg, radialSeg);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    const majorAngle = Math.atan2(v.y, v.x);
    const n1 = hash(Math.cos(majorAngle) * 3.1, Math.sin(majorAngle) * 3.1, 1) - 0.5;
    const n2 = hash(Math.cos(majorAngle) * 7.3, Math.sin(majorAngle) * 7.3, 5) - 0.5;

    // Barely-there irregularity — a real polished ring is almost perfectly
    // smooth; too much noise here reads as lumpy rather than hand-finished.
    const bulge = 1 + n1 * 0.008 + n2 * 0.004;
    const centerR = Math.sqrt(v.x * v.x + v.y * v.y);
    const nx = v.x / centerR, ny = v.y / centerR;
    const localMajorR = radius * (1 + n1 * 0.003);

    const dx = v.x - nx * localMajorR;
    const dy = v.y - ny * localMajorR;

    pos.setXYZ(i, nx * localMajorR + dx * bulge, ny * localMajorR + dy * bulge, v.z * bulge);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

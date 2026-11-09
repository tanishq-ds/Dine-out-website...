import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * TandoorHero — the fire container, scaled and framed to sit as a hero
 * visual on the right side of the landing section, with real culinary
 * fire "escaping" through segments as the visitor's cursor passes near it.
 *
 * This owns a fully independent renderer/scene/camera from the main
 * scroll experience in WebGLScene.tsx — it's a self-contained decorative
 * piece, not part of the camera-path journey.
 */
export default function TandoorHero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth, H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Transparent background so it blends seamlessly into the page's
    // near-black backdrop instead of showing a distinct canvas rectangle.
    renderer.setClearColor(0x000000, 0);

    // Framed tighter / closer than the original standalone demo so the
    // tandoor reads as a substantial hero object, not a small inset.
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100);
    camera.position.set(0, -4.6, 3.1);
    camera.lookAt(0, 0, 0.7);

    /* ── LIGHTS ─────────────────────────────────────────────── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.08);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff5e0, 0.45);
    key.position.set(4, -3, 6);
    key.castShadow = true;
    scene.add(key);

    const innerLight1 = new THREE.PointLight(0xff7700, 8, 2.2);
    innerLight1.position.set(0, 0, 0.5);
    scene.add(innerLight1);
    const innerLight2 = new THREE.PointLight(0xff4400, 5, 1.8);
    innerLight2.position.set(0, 0, 1.1);
    scene.add(innerLight2);
    const innerLight3 = new THREE.PointLight(0xffaa00, 4, 1.5);
    innerLight3.position.set(0, 0, 0.2);
    scene.add(innerLight3);

    const leakLight = new THREE.PointLight(0xff6600, 0, 4);
    leakLight.position.set(0, 0, 0.75);
    scene.add(leakLight);
    const leakLight2 = new THREE.SpotLight(0xff8800, 0, 6, Math.PI / 2, 0.8);
    leakLight2.position.set(0, 0, 0.75);
    scene.add(leakLight2);

    /* ── CONCRETE TEXTURES ──────────────────────────────────── */
    function rng(s: number) { s = Math.sin(s) * 43758.5453; return s - Math.floor(s); }

    function makeTex(seed: number) {
      const sz = 256;
      const cv = document.createElement('canvas');
      cv.width = cv.height = sz;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#828078'; ctx.fillRect(0, 0, sz, sz);
      for (let i = 0; i < 4000; i++) {
        const x = rng(i * 7.3 + seed) * sz, y = rng(i * 13.7 + seed + 1) * sz, r = rng(i * 3.1 + seed + 2) * 5 + 1;
        const v = Math.floor(rng(i * 5.9 + seed + 3) * 90 + 70);
        ctx.fillStyle = `rgba(${v},${v},${v - 6},${rng(i * 2.3 + seed + 4) * 0.2 + 0.05})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      for (let c = 0; c < 14; c++) {
        ctx.strokeStyle = `rgba(40,38,34,${0.1 + rng(c * 17 + seed) * 0.2})`;
        ctx.lineWidth = rng(c * 11 + seed) * 1.8 + 0.3;
        ctx.beginPath();
        let cx = rng(c * 5 + seed) * sz, cy = rng(c * 7 + seed) * sz;
        ctx.moveTo(cx, cy);
        for (let s = 0; s < 7; s++) { cx += (rng(c * 31 + s + seed) - 0.5) * 45; cy += (rng(c * 23 + s + seed) - 0.5) * 45; ctx.lineTo(cx, cy); }
        ctx.stroke();
      }
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    function makeNorm(seed: number) {
      const sz = 256;
      const cv = document.createElement('canvas');
      cv.width = cv.height = sz;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = 'rgb(128,128,255)'; ctx.fillRect(0, 0, sz, sz);
      for (let i = 0; i < 1500; i++) {
        const x = rng(i * 9 + seed) * sz, y = rng(i * 6 + seed + 5) * sz, r = rng(i * 4 + seed + 2) * 7 + 2;
        const nx = Math.floor(rng(i * 7 + seed + 3) * 55 + 100), ny = Math.floor(rng(i * 5 + seed + 4) * 55 + 100);
        ctx.fillStyle = `rgba(${nx},${ny},255,0.45)`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      return new THREE.CanvasTexture(cv);
    }

    let seedC = 0;
    function concreteMat() {
      const s = seedC++;
      return new THREE.MeshStandardMaterial({
        map: makeTex(s), normalMap: makeNorm(s),
        normalScale: new THREE.Vector2(0.7, 0.7),
        roughness: 0.92, metalness: 0.02, color: 0xffffff,
        side: THREE.FrontSide,
      });
    }

    /* ── ROUNDED WEDGE GEOMETRY ─────────────────────────────── */
    function makeWedge(a0: number, a1: number, ri: number, ro: number, z0: number, z1: number) {
      const aS = 10, zS = 6, bv = 0.055;
      const v: number[] = [], idx: number[] = [];
      const push = (x: number, y: number, z: number) => { v.push(x, y, z); return v.length / 3 - 1; };
      const tri = (a: number, b: number, c: number) => idx.push(a, b, c);
      const quad = (a: number, b: number, c: number, d: number) => { tri(a, b, c); tri(a, c, d); };
      const bs = (t: number) => { const e = Math.min(t, 1 - t) / 0.18, s = Math.min(e, 1); return 1 - (1 - Math.sqrt(Math.max(0, s))) * bv * 2.5; };
      const ab = (i: number, n: number) => { const t = i / n, e = Math.min(t, 1 - t) / 0.15, s = Math.min(e, 1); return 1 - (1 - Math.sqrt(Math.max(0, s))) * bv * 3; };
      const grid: { ii: number; oi: number }[][] = [];
      for (let zi = 0; zi <= zS; zi++) {
        const zt = zi / zS, zp = z0 + (z1 - z0) * zt, zb = bs(zt), row: { ii: number; oi: number }[] = [];
        for (let ai = 0; ai <= aS; ai++) {
          const a = a0 + (a1 - a0) * ai / aS, ab2 = ab(ai, aS), sc = zb * ab2;
          const mR = (ri + ro) / 2, hT = (ro - ri) / 2, ca = Math.cos(a), sa = Math.sin(a);
          row.push({ ii: push((mR - hT * sc) * ca, (mR - hT * sc) * sa, zp), oi: push((mR + hT * sc) * ca, (mR + hT * sc) * sa, zp) });
        }
        grid.push(row);
      }
      for (let zi = 0; zi < zS; zi++) for (let ai = 0; ai < aS; ai++) {
        const a = grid[zi][ai], b = grid[zi][ai + 1], c = grid[zi + 1][ai + 1], d = grid[zi + 1][ai];
        quad(a.oi, b.oi, c.oi, d.oi); quad(b.ii, a.ii, d.ii, c.ii);
      }
      for (let ai = 0; ai < aS; ai++) {
        quad(grid[zS][ai].ii, grid[zS][ai].oi, grid[zS][ai + 1].oi, grid[zS][ai + 1].ii);
        quad(grid[0][ai].oi, grid[0][ai].ii, grid[0][ai + 1].ii, grid[0][ai + 1].oi);
      }
      for (let zi = 0; zi < zS; zi++) {
        quad(grid[zi][0].oi, grid[zi][0].ii, grid[zi + 1][0].ii, grid[zi + 1][0].oi);
        quad(grid[zi][aS].ii, grid[zi][aS].oi, grid[zi + 1][aS].oi, grid[zi + 1][aS].ii);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      return geo;
    }

    /* ── BUILD CONTAINER ────────────────────────────────────── */
    const outerR = 1.0, innerR = 0.80, totalH = 1.5, numRings = 6, numSegs = 12;
    const rh = totalH / numRings, gap = 0.028;
    type Block = { mesh: THREE.Mesh; ux: number; uy: number; cx: number; cy: number; tx: number; ty: number; push: number };
    const blocks: Block[] = [];
    const group = new THREE.Group();
    group.position.z = -0.75;
    scene.add(group);

    for (let ring = 0; ring < numRings; ring++) {
      const z0 = ring * rh, z1 = z0 + rh, rOff = (ring % 2) * (Math.PI / numSegs);
      for (let seg = 0; seg < numSegs; seg++) {
        const a0 = (seg / numSegs) * 2 * Math.PI + rOff + gap / 2;
        const a1 = ((seg + 1) / numSegs) * 2 * Math.PI + rOff - gap / 2;
        const amid = (a0 + a1) / 2;
        const mesh = new THREE.Mesh(makeWedge(a0, a1, innerR, outerR, 0, rh), concreteMat());
        mesh.position.z = z0; mesh.castShadow = true; mesh.receiveShadow = true;
        group.add(mesh);
        blocks.push({ mesh, ux: Math.cos(amid), uy: Math.sin(amid), cx: 0, cy: 0, tx: 0, ty: 0, push: 0 });
      }
    }
    const topRoff = (numRings % 2) * (Math.PI / numSegs);
    for (let seg = 0; seg < numSegs; seg++) {
      const a0 = (seg / numSegs) * 2 * Math.PI + topRoff + gap / 2;
      const a1 = ((seg + 1) / numSegs) * 2 * Math.PI + topRoff - gap / 2;
      const amid = (a0 + a1) / 2;
      const mesh = new THREE.Mesh(makeWedge(a0, a1, innerR, outerR, 0, rh * 0.5), concreteMat());
      mesh.position.z = totalH; mesh.castShadow = true;
      group.add(mesh);
      blocks.push({ mesh, ux: Math.cos(amid), uy: Math.sin(amid), cx: 0, cy: 0, tx: 0, ty: 0, push: 0 });
    }
    const bot = new THREE.Mesh(new THREE.CylinderGeometry(outerR, outerR, rh * 0.5, 64), concreteMat());
    bot.rotation.x = Math.PI / 2; bot.position.z = rh * 0.25;
    group.add(bot);

    /* ── FIRE PARTICLES ─────────────────────────────────────── */
    const N = 3600;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), sz = new Float32Array(N);
    type Particle = { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; maxL: number; esc: boolean; ea: number; t: number };
    const pS: Particle[] = [];

    function turbX(x: number, y: number, z: number, t: number) { return Math.sin(y * 2.1 + t * 1.3) * 0.008 + Math.cos(z * 1.7 + t * 0.9) * 0.005; }
    function turbY(x: number, y: number, z: number, t: number) { return Math.cos(x * 2.3 + t * 1.1) * 0.008 + Math.sin(z * 1.9 + t * 1.2) * 0.005; }

    function resetP(i: number, esc: boolean, ea: number) {
      const p = pS[i];
      const r = Math.random() * 0.60, a = Math.random() * Math.PI * 2;
      p.x = Math.cos(a) * r; p.y = Math.sin(a) * r;
      p.z = -0.75 + 0.05 + Math.random() * 0.1;
      p.maxL = 0.4 + Math.random() * 1.0; p.life = p.maxL;
      p.esc = esc; p.ea = ea; p.t = Math.random() * 100;
      if (esc) {
        p.vx = Math.cos(ea) * (0.022 + Math.random() * 0.025) + (Math.random() - 0.5) * 0.008;
        p.vy = Math.sin(ea) * (0.022 + Math.random() * 0.025) + (Math.random() - 0.5) * 0.008;
        p.vz = 0.025 + Math.random() * 0.03;
      } else {
        p.vx = (Math.random() - 0.5) * 0.01;
        p.vy = (Math.random() - 0.5) * 0.01;
        p.vz = 0.03 + Math.random() * 0.038;
      }
    }
    for (let i = 0; i < N; i++) {
      pS.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxL: 1, esc: false, ea: 0, t: 0 });
      resetP(i, false, 0);
      pS[i].life = Math.random() * pS[i].maxL;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    pGeo.setAttribute('psize', new THREE.BufferAttribute(sz, 1));

    const pMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float psize;attribute vec3 color;varying vec3 vCol;
        void main(){vCol=color;
          vec4 mv=modelViewMatrix*vec4(position,1.0);
          gl_PointSize=psize*(450.0/(-mv.z));
          gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `
        varying vec3 vCol;
        void main(){
          vec2 uv=gl_PointCoord-0.5;float r=length(uv)*2.0;
          if(r>1.0)discard;
          float core=pow(max(0.0,1.0-r*1.2),1.3);
          float glow=pow(max(0.0,1.0-r),0.6)*0.7;
          float a=clamp(core+glow,0.0,1.0);
          gl_FragColor=vec4(vCol*1.4,a);}`,
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, vertexColors: true,
    });
    const pts = new THREE.Points(pGeo, pMat);
    pts.renderOrder = 999;
    scene.add(pts);

    /* ── MOUSE (scoped to this component's own mount, not the page) ── */
    const mouse = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const wp = new THREE.Vector3();
    let mouseIn = false;

    const handleMove = (e: MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      mouseIn = true;
    };
    const handleLeave = () => { mouseIn = false; };
    mount.addEventListener('mousemove', handleMove);
    mount.addEventListener('mouseleave', handleLeave);

    /* ── RENDER LOOP ────────────────────────────────────────── */
    let autoAngle = 0, t = 0;
    const openSegs: { angle: number; s: number }[] = [];
    let totalPush = 0;
    let rafId: number;

    function animate() {
      rafId = requestAnimationFrame(animate);
      t += 0.016; autoAngle += 0.003;
      group.rotation.z = autoAngle;

      const flick = Math.sin(t * 11.3) * 0.18 + Math.sin(t * 7.7) * 0.12 + Math.sin(t * 19.1) * 0.06;
      const flick2 = Math.sin(t * 8.9) * 0.15 + Math.sin(t * 13.3) * 0.1;
      innerLight1.intensity = 7 + flick * 3;
      innerLight2.intensity = 4.5 + flick2 * 2;
      innerLight3.intensity = 3.5 + Math.sin(t * 23) * 0.8;
      innerLight1.color.setRGB(1, 0.38 + Math.sin(t * 6) * 0.1, 0);
      innerLight2.color.setRGB(1, 0.22 + Math.sin(t * 9) * 0.08, 0);
      innerLight1.position.set(Math.sin(t * 1.3) * 0.15, Math.cos(t * 1.7) * 0.15, 0.5 + Math.sin(t * 3.1) * 0.12);
      innerLight2.position.set(Math.cos(t * 2.1) * 0.12, Math.sin(t * 1.9) * 0.12, 1.1 + Math.sin(t * 4.3) * 0.1);

      raycaster.setFromCamera(mouse as THREE.Vector2, camera);
      raycaster.ray.intersectPlane(plane, wp);
      const cosA = Math.cos(-autoAngle), sinA = Math.sin(-autoAngle);
      const lwx = wp.x * cosA - wp.y * sinA, lwy = wp.x * sinA + wp.y * cosA;

      openSegs.length = 0; totalPush = 0;
      blocks.forEach((b) => {
        const mR = (outerR + innerR) / 2, bx = b.ux * mR, by = b.uy * mR;
        const dx = lwx - bx, dy = lwy - by, dist = Math.sqrt(dx * dx + dy * dy);
        if (mouseIn && dist < 1.65) {
          const s = Math.pow(1 - dist / 1.65, 2.5);
          b.tx = b.ux * s * 1.15; b.ty = b.uy * s * 1.15; b.push = s;
        } else { b.tx = 0; b.ty = 0; b.push = 0; }
        b.cx += (b.tx - b.cx) * 0.07; b.cy += (b.ty - b.cy) * 0.07;
        b.mesh.position.x = b.cx; b.mesh.position.y = b.cy;
        totalPush += b.push;
        if (b.push > 0.05) openSegs.push({ angle: Math.atan2(b.uy, b.ux), s: b.push });
      });

      const openI = Math.min(totalPush / 2.5, 1);
      leakLight.intensity = (12 + flick * 4) * openI;
      leakLight2.intensity = (8 + flick2 * 3) * openI;
      leakLight.color.setRGB(1, 0.35, 0);
      leakLight2.color.setRGB(1, 0.4, 0);

      const escF = Math.min(openSegs.length / 4, 1);
      for (let i = 0; i < N; i++) {
        const p = pS[i];
        p.life -= 0.016;
        if (p.life <= 0) {
          const esc = escF > 0 && Math.random() < escF * 0.88;
          let ea = 0;
          if (esc && openSegs.length) ea = openSegs[Math.floor(Math.random() * openSegs.length)].angle + (Math.random() - 0.5) * 0.4;
          resetP(i, esc, ea);
        }
        p.t += 0.016;
        p.vx += turbX(p.x, p.y, p.z, p.t) * 1.2 + (Math.random() - 0.5) * 0.003;
        p.vy += turbY(p.x, p.y, p.z, p.t) * 1.2 + (Math.random() - 0.5) * 0.003;
        p.vz += 0.0008;
        p.vx *= 0.97; p.vy *= 0.97; if (p.vz > 0.075) p.vz *= 0.96;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;

        const lr = p.life / p.maxL;
        let r, g, b;
        if (lr > 0.90) { r = 1; g = 0.98; b = 0.7; }
        else if (lr > 0.75) { r = 1; g = 0.88; b = 0.15; }
        else if (lr > 0.58) { r = 1; g = 0.65; b = 0.0; }
        else if (lr > 0.40) { r = 1; g = 0.38; b = 0.0; }
        else if (lr > 0.22) { r = 0.95; g = 0.15; b = 0.0; }
        else if (lr > 0.08) { r = 0.6; g = 0.04; b = 0.0; }
        else { r = 0.25; g = 0.01; b = 0.0; }

        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b;
        const sc = Math.sin(Math.max(lr, 0) * Math.PI);
        sz[i] = (p.esc ? 42 : 32) * sc + 7;
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.color.needsUpdate = true;
      pGeo.attributes.psize.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
      W = mount.clientWidth; H = mount.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
    resizeObserver.observe(mount);

    /* ── CLEANUP ────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mount.removeEventListener('mousemove', handleMove);
      mount.removeEventListener('mouseleave', handleLeave);
      blocks.forEach((b) => {
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
      });
      pGeo.dispose();
      pMat.dispose();
      bot.geometry.dispose();
      (bot.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[420px] sm:h-[500px] md:h-[620px] cursor-crosshair"
      aria-label="Interactive 3D tandoor with live fire — move your cursor over it"
    />
  );
}

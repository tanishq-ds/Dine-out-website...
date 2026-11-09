import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { buildSculpturalRingGeometry } from '../three/sculpturalRing';

interface WebGLSceneProps {
  scrollProgress: number;
  scrollVelocity: number;
  onSectionActive?: (sectionIndex: number) => void;
  onEnterReservationLedger?: (inside: boolean) => void;
}

export default function WebGLScene({
  scrollProgress,
  scrollVelocity,
  onSectionActive,
  onEnterReservationLedger
}: WebGLSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High performance state reference to avoid any React re-renders in rendering loops
  const stateRef = useRef({
    targetProgress: 0,
    currentProgress: 0,
    velocity: 0,
    mouse: { x: 0, y: 0 },
    targetMouse: { x: 0, y: 0 },
    time: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    // Smooth interactive variables
    currentMouseX: 0,
    currentMouseY: 0,
    currentScrollRoll: 0,
  });

  // Keep references synced with parent inputs
  useEffect(() => {
    stateRef.current.targetProgress = scrollProgress;
    stateRef.current.velocity = scrollVelocity;
  }, [scrollProgress, scrollVelocity]);

  // Window resize and cursor tracking
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      stateRef.current.width = containerRef.current.clientWidth;
      stateRef.current.height = containerRef.current.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to standard range (-1 to 1) with dampening offset
      stateRef.current.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Atmosphere Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#08080c'); // Luxurious deep midnight charcoal
    scene.fog = new THREE.FogExp2('#08080c', 0.055); // Rich volumetric fog

    // 2. Camera & Parent Camera Rig Group
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const cameraRig = new THREE.Group();
    cameraRig.add(camera);
    scene.add(cameraRig);

    // Initial camera placement relative to its rig
    camera.position.set(0, 0, 0);

    // 3. Renderer Initializer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Clamped for mobile and standard screens
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Studio-quality image-based lighting. This is the single most important
    // fix for the rings: MeshPhysicalMaterial with metalness near 1.0 has
    // almost nothing to reflect without an environment map, so it was
    // rendering as a thin glowing bloom outline instead of a solid,
    // readable metal surface.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.045).texture;
    pmremGenerator.dispose();

    // 4. Spline Path Assembly (Cinematic Trajectory)
    // The first stretch carries the camera past the standing HTML sections
    // (Home / About / Drinks / Ledger content). The final stretch is a
    // straight, gentle run where the three hierarchical rings live —
    // arranged one after another so the camera passes through each in turn.
    const splinePoints = [
      new THREE.Vector3(0, 0.5, 25),       // start buffer
      new THREE.Vector3(0, 0, 15),         // Home
      new THREE.Vector3(0, -3.5, 2),       // About
      new THREE.Vector3(4.5, -5.5, -4),    // Curve transitional
      new THREE.Vector3(-5.5, -7.5, -12),  // Drinks
      new THREE.Vector3(-3.0, -11.0, -20), // Curve transitional
      new THREE.Vector3(0, -14.0, -28.0),  // Ledger
      new THREE.Vector3(0, -14.0, -34.0),  // Ring A checkpoint
      new THREE.Vector3(0, -14.0, -40.0),  // Ring B checkpoint
      new THREE.Vector3(0, -14.0, -46.0),  // Ring C checkpoint
      new THREE.Vector3(0, -14.0, -52.0),  // end buffer
    ];
    const curve = new THREE.CatmullRomCurve3(splinePoints);

    // 5. Three hierarchical gold rings, arranged sequentially
    // Point indices 7, 8, 9 out of 10 segments → u = 0.7, 0.8, 0.9
    const ringCount = 3;
    const ringProgressValues = [7 / 10, 8 / 10, 9 / 10];

    const rings: {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      radius: number;
      uValue: number;
      alignedQuat: THREE.Quaternion;
      baseRot: THREE.Euler;
      angularVel: THREE.Vector3;
    }[] = [];

    // A single cohesive gold family rather than three unrelated colours —
    // hierarchy is conveyed through decreasing size as the camera
    // approaches the final ring, not through clashing materials.
    const ringMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#cda23a'),
        emissive: new THREE.Color('#3a2a0d'), // faint warm glow, not black inner
        emissiveIntensity: 0.16,
        roughness: 0.16,
        metalness: 1.0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.7,
        reflectivity: 1.0,
        ior: 1.9,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#c19540'),
        emissive: new THREE.Color('#33240c'),
        emissiveIntensity: 0.16,
        roughness: 0.14,
        metalness: 1.0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.75,
        reflectivity: 1.0,
        ior: 1.9,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#e0b24a'),
        emissive: new THREE.Color('#3d2a0c'),
        emissiveIntensity: 0.18,
        roughness: 0.12,
        metalness: 1.0,
        clearcoat: 0.7,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.8,
        reflectivity: 1.0,
        ior: 1.9,
      }),
    ];

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Front ring stays at the current size — the next two shrink noticeably
    // rather than nearly matching it, so the hierarchy actually reads.
    const ringRadii = [2.0, 1.4, 0.95];
    const ringTube = 0.18; // thin, elegant — same thickness on all three

    for (let i = 0; i < ringCount; i++) {
      const ringGeom = buildSculpturalRingGeometry(ringRadii[i], ringTube, 220, 56);
      const mesh = new THREE.Mesh(ringGeom, ringMaterials[i]);
      
      // Place ring exactly on its spline checkpoint position
      const u = ringProgressValues[i];
      const pos = curve.getPoint(u);
      mesh.position.copy(pos);

      // Align the ring's opening with the curve tangent at its checkpoint —
      // since this stretch of the path runs nearly straight along -Z, the
      // ring naturally ends up perpendicular to the camera's approach.
      const tangent = curve.getTangent(u).normalize();
      const alignedQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      mesh.quaternion.copy(alignedQuat);

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      ringGroup.add(mesh);

      // Random rotational seeds for unique layered idle swiping
      const baseRot = new THREE.Euler(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        Math.random() * Math.PI
      );

      rings.push({
        mesh,
        basePos: pos.clone(),
        radius: ringRadii[i],
        uValue: u,
        alignedQuat,
        baseRot,
        angularVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          0.08 + Math.random() * 0.12
        ),
      });
    }

    // 6. Double-layered particle volumetric system (Small Amber Ash & Soft Large Bokeh Dust)
    const environmentGroup = new THREE.Group();
    scene.add(environmentGroup);

    const ashCount = 450;
    const ashGeometry = new THREE.BufferGeometry();
    const ashPositions = new Float32Array(ashCount * 3);
    const ashSpeeds = new Float32Array(ashCount);
    const ashOffsets = new Float32Array(ashCount * 3);

    const bokehCount = 150;
    const bokehGeometry = new THREE.BufferGeometry();
    const bokehPositions = new Float32Array(bokehCount * 3);
    const bokehSpeeds = new Float32Array(bokehCount);
    const bokehOffsets = new Float32Array(bokehCount * 3);

    for (let i = 0; i < ashCount; i++) {
      ashPositions[i * 3] = (Math.random() - 0.5) * 16;
      ashPositions[i * 3 + 1] = (Math.random() - 0.5) * 16 - 3;
      ashPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 15;
      ashSpeeds[i] = 0.04 + Math.random() * 0.08;
      ashOffsets[i * 3] = Math.random() * Math.PI * 2;
      ashOffsets[i * 3 + 1] = Math.random() * Math.PI * 2;
      ashOffsets[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    // Create custom canvas soft radial dot for out-of-focus camera dust
    const createBokehTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const bokehTexture = createBokehTexture();

    for (let i = 0; i < bokehCount; i++) {
      bokehPositions[i * 3] = (Math.random() - 0.5) * 22;
      bokehPositions[i * 3 + 1] = (Math.random() - 0.5) * 22 - 3;
      bokehPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 15;
      bokehSpeeds[i] = 0.015 + Math.random() * 0.035;
      bokehOffsets[i * 3] = Math.random() * Math.PI * 2;
      bokehOffsets[i * 3 + 1] = Math.random() * Math.PI * 2;
      bokehOffsets[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    ashGeometry.setAttribute('position', new THREE.BufferAttribute(ashPositions, 3));
    bokehGeometry.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));

    const ashMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#e5b322'),
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const bokehMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#fcf3df'),
      size: 0.45,
      map: bokehTexture,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const ashPoints = new THREE.Points(ashGeometry, ashMaterial);
    const bokehPoints = new THREE.Points(bokehGeometry, bokehMaterial);

    environmentGroup.add(ashPoints);
    environmentGroup.add(bokehPoints);

    // 7. Interactive Floating Media Frames (Distance-based Silhouette & Fade)
    const mediaGroup = new THREE.Group();
    scene.add(mediaGroup);

    const mediaItems = [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7YIVBrWxwx0BdzUqaVGSjgIqyqV3Oio4bYzHyRQWi2taq0QFiSjB0Qb6k_rVndVsWFsGCUD9K2ApV9TxyuD8ZG_rHUS9mcjcspjtQhnxj_OrJdT-D5d-LfUdeIAAlLROpNhyBBYZhXvdErTEL453Efx8V3OjPp-1hqpbuSgWJyngRSx5ylofF8xS9ggBm7vH2l9i1QU3M15_R2saEctr0LnDzesJHHJbOWWmxRp8fY6Zdo6TztA80Nr-39J8iV_NlLd7qujv9Ze4',
        pos: new THREE.Vector3(-3.8, -3.2, -1.0),
        rot: new THREE.Euler(0, 0.35, -0.04),
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCsIz9mDvWtD6UlUwSxVkuuYvnXKW7sjhnmbW9hbhYWTa6rJspu4i3NvkvO6FUZdQQpKFyUEq4HvPIQjOBM5y-M_G3o4bsYA3fX5zgvWziX7Xfaz7aWY9_bD2ucBH8vVRxqCDkIPGXykwLU5j3ur_DVVgmq58_iISWotEZtSKg1OYvVYfDwFr0aYUSsu3zcIot9HZYATeut1-xr0EAZCFDAl3p08Qpz_gQqlZIEPO_cWIg8XYsltiXIDUNHLcUEQF35Hp7hLJ91w0',
        pos: new THREE.Vector3(3.8, -7.2, -14.0),
        rot: new THREE.Euler(0, -0.42, 0.06),
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlVlhZbW5zHC_x_55CqNyTvtYUtRSvxTYZJCRIfbXj685KiaRwcyw3rC4gB4qd29XefaMUcyOUAcbjDIll671QsNFA5wuF1h5zBmqmVQGNgrF3B8VLyATS6rif2wg916JBTrm807YwvvTI2kgdRkFVNRwR_bNC6tcK-F39HH1R75lrY-gLvH8oiYeRrPsghfhqAcq0BQRRzB3jX7qMMw-nOeBs40DLLqUC-PSGF10QzJSVSK706Pa2htFdEpVUPg-L5uAHlEP5zqQ',
        pos: new THREE.Vector3(-3.4, -13.6, -24.0), // Moved back — was colliding with the new Ring A checkpoint at Z=-34
        rot: new THREE.Euler(0, 0.28, -0.02),
      },
    ];

    const mediaMeshes: {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      imageMaterial: THREE.MeshStandardMaterial;
      borderMaterial: THREE.MeshPhysicalMaterial;
      rotSpeed: number;
    }[] = [];

    const texLoader = new THREE.TextureLoader();

    mediaItems.forEach((item) => {
      // 3D Glass Floating Panel
      const geom = new THREE.PlaneGeometry(2.85, 3.85);
      
      const imageMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.20,
        metalness: 0.10,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
      });

      const borderMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0e0d12'), // Dark smoked obsidian glass frame
        metalness: 0.35,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        transmission: 0.25,
        ior: 1.5,
        transparent: true,
        opacity: 0,
      });

      texLoader.load(
        item.url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          imageMaterial.map = texture;
          imageMaterial.needsUpdate = true;
        },
        undefined,
        () => {
          imageMaterial.color.setStyle('#f2ca50');
          imageMaterial.roughness = 0.15;
          imageMaterial.metalness = 0.9;
          imageMaterial.needsUpdate = true;
        }
      );

      const borderGeom = new THREE.BoxGeometry(3.0, 4.0, 0.06);
      const borderMesh = new THREE.Mesh(borderGeom, borderMaterial);
      
      const innerMesh = new THREE.Mesh(geom, imageMaterial);
      innerMesh.position.set(0, 0, 0.035);
      innerMesh.castShadow = true;
      innerMesh.receiveShadow = true;
      borderMesh.add(innerMesh);
      
      borderMesh.position.copy(item.pos);
      borderMesh.rotation.copy(item.rot);
      borderMesh.castShadow = true;
      borderMesh.receiveShadow = true;
      mediaGroup.add(borderMesh);

      mediaMeshes.push({
        mesh: borderMesh,
        basePos: item.pos.clone(),
        imageMaterial,
        borderMaterial,
        rotSpeed: 0.08 + Math.random() * 0.12,
      });
    });

    // 8. Abstract Sculptural Installation (Gallery Centerpiece)
    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.set(0.6, -14.2, -21.0); // Moved back — was overlapping the new ring cluster at Z=-34/-40/-46
    scene.add(sculptureGroup);

    // Outer flowing obsidian ribbon mesh
    const sculptureGeom = new THREE.TorusKnotGeometry(1.25, 0.22, 128, 32, 2, 3);
    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1c1e28'), // Deep polished slate basalt
      roughness: 0.14,
      metalness: 0.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      ior: 1.7,
      reflectivity: 0.9,
      transparent: true,
      opacity: 0.2,
    });
    const sculptureMesh = new THREE.Mesh(sculptureGeom, sculptureMaterial);
    sculptureMesh.castShadow = true;
    sculptureMesh.receiveShadow = true;
    sculptureGroup.add(sculptureMesh);

    // Inner suspended satin gold core
    const coreGeom = new THREE.SphereGeometry(0.48, 32, 32);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#382812'), // Satin gold core
      emissive: new THREE.Color('#4a3512'),
      emissiveIntensity: 0.3,
      roughness: 0.16,
      metalness: 0.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    sculptureGroup.add(coreMesh);

    // 9. Luxurious Plausible Lighting Layout
    const lightingGroup = new THREE.Group();
    scene.add(lightingGroup);

    // Balanced Hemisphere background sky/ground ambient bounce (prevents crushed shadows)
    const hemiLight = new THREE.HemisphereLight('#1a1c2e', '#241a12', 0.85);
    lightingGroup.add(hemiLight);

    // Warm key light
    const keyLight = new THREE.SpotLight('#ffd56b', 12.0);
    keyLight.position.set(8, 12, 10);
    keyLight.angle = Math.PI / 4.5;
    keyLight.penumbra = 0.85;
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.001;
    lightingGroup.add(keyLight);

    // Dramatic cool cobalt rim light
    const rimLight = new THREE.SpotLight('#4338ca', 14.0);
    rimLight.position.set(-10, -5, -15);
    rimLight.angle = Math.PI / 3.5;
    rimLight.penumbra = 0.75;
    lightingGroup.add(rimLight);

    // These sit at each ring's own center, inside the bore — their main job
    // now is giving the inner curvature a faint warm glow so it grades
    // into the brighter, shinier outer curvature instead of going flat black.
    const ring1Light = new THREE.PointLight('#ffdca0', 2.0, 10, 1.6);
    ring1Light.position.set(0, -14.0, -34.0);
    lightingGroup.add(ring1Light);

    const ring2Light = new THREE.PointLight('#ffdca0', 2.1, 11, 1.6);
    ring2Light.position.set(0, -14.0, -40.0);
    lightingGroup.add(ring2Light);

    const ring3Light = new THREE.PointLight('#ffdca0', 2.4, 12, 1.5);
    ring3Light.position.set(0, -14.0, -46.0);
    lightingGroup.add(ring3Light);

    // Focused spotlight highlighting gallery sculpture
    const sculptureSpot = new THREE.SpotLight('#ffe8ab', 6.0);
    sculptureSpot.position.set(-4, -10, -24);
    sculptureSpot.target = sculptureMesh;
    sculptureSpot.angle = Math.PI / 4;
    sculptureSpot.penumbra = 0.7;
    lightingGroup.add(sculptureSpot);

    // 10. Post-processing Composer Pipeline (EffectComposer)
    const composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Refined subtle bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.12, // strength
      0.30, // radius
      0.90  // threshold
    );
    composer.addPass(bloomPass);

    const cinematicPassShader = {
      name: 'CinematicPass',
      uniforms: {
        tDiffuse: { value: null },
        uChromaticAberration: { value: 0 },
        uNoiseIntensity: { value: 0.004 }, // Fine monochromatic grain
        uVignetteStrength: { value: 0.6 }, // Soft cinematic vignette
        uTime: { value: 0 },
        uLightScreenPos: { value: new THREE.Vector2(0, 0) },
        uLightInFront: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uChromaticAberration;
        uniform float uNoiseIntensity;
        uniform float uVignetteStrength;
        uniform float uTime;
        uniform vec2 uLightScreenPos;
        uniform float uLightInFront;
        varying vec2 vUv;

        float grainNoise(vec2 uv, float time) {
          return fract(sin(dot(uv, vec2(12.9898, 78.233) * time)) * 43758.5453) * 2.0 - 1.0;
        }

        void main() {
          vec2 uv = vUv;
          vec2 dUv = uv - 0.5;
          float dist = length(dUv);

          // Center 80% screen is 100% sharp; aberration occurs strictly on outer 20% corners
          float edgeFactor = smoothstep(0.38, 0.72, dist);
          float shift = uChromaticAberration * edgeFactor;

          vec4 cr = texture2D(tDiffuse, uv + vec2(shift, 0.0));
          vec4 cg = texture2D(tDiffuse, uv);
          vec4 cb = texture2D(tDiffuse, uv - vec2(shift, 0.0));
          vec3 color = vec3(cr.r, cg.g, cb.b);

          // Subtle lens flare, active ONLY when key light is in FOV
          if (uLightInFront > 0.5) {
            vec2 lightUV = uLightScreenPos * 0.5 + 0.5;
            if (lightUV.x > 0.0 && lightUV.x < 1.0 && lightUV.y > 0.0 && lightUV.y < 1.0) {
              vec2 center = vec2(0.5);
              vec2 toLight = lightUV - center;
              float distToLight = length(uv - lightUV);
              
              float sourceGlow = exp(-distToLight * 12.0) * 0.10;
              vec2 ghostPos = center - toLight * 0.5;
              float ghostDist = length(uv - ghostPos);
              float ghostGlow = exp(-ghostDist * 16.0) * 0.03;
              
              float boundaryFade = smoothstep(0.0, 0.1, lightUV.x) * smoothstep(1.0, 0.9, lightUV.x) *
                                   smoothstep(0.0, 0.1, lightUV.y) * smoothstep(1.0, 0.9, lightUV.y);
              
              vec3 flareColor = vec3(0.25, 0.20, 0.12) * (sourceGlow + ghostGlow) * boundaryFade;
              color += flareColor;
            }
          }

          // Fitted ACES Film Tone Mapping
          vec3 x = color * 1.1;
          vec3 mappedColor = clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);

          // Soft cinematic vignette (large radius, subtle edge darkening)
          float vignette = smoothstep(1.35, 0.45, dist * uVignetteStrength);
          mappedColor *= mix(1.0, vignette, 0.25);

          // Monochromatic fine film grain
          float grain = grainNoise(uv, sin(uTime * 0.0001) + 1.2) * uNoiseIntensity;
          float luminance = dot(mappedColor, vec3(0.2126, 0.7152, 0.0722));
          float grainFactor = smoothstep(0.02, 0.35, luminance) * smoothstep(0.98, 0.65, luminance);
          mappedColor += vec3(grain * grainFactor);

          // Subtle warm luxury grade
          mappedColor.r = pow(mappedColor.r, 0.99) * 1.01;
          mappedColor.b = pow(mappedColor.b, 1.01) * 0.98;

          gl_FragColor = vec4(mappedColor, cg.a);
        }
      `
    };

    const cinematicPass = new ShaderPass(cinematicPassShader);
    composer.addPass(cinematicPass);

    // 11. Core Animation, Spring Physics, Spline Travel & Rendering Loops
    let animationFrameId: number;
    let lastTime = 0;

    // Critically damped spring configuration for heavy inertial scroll drift
    let currentProgress = 0;
    let progressVelocity = 0;
    const springTension = 11.5; // Silky smooth inertial travel
    const springDamping = 4.8;

    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) * 0.001, 0.1); // Clamp dt to prevent massive jumps on background tabs
      lastTime = timestamp;

      const state = stateRef.current;
      state.time += dt;

      // Numerical integration of critically damped progress spring
      const targetProgress = state.targetProgress;
      const force = (targetProgress - currentProgress) * springTension - progressVelocity * springDamping;
      progressVelocity += force * dt;
      currentProgress += progressVelocity * dt;
      currentProgress = Math.max(0, Math.min(1, currentProgress));
      state.currentProgress = currentProgress;

      // Mouse parallax input smoothing
      state.mouse.x += (state.targetMouse.x - state.mouse.x) * 0.05;
      state.mouse.y += (state.targetMouse.y - state.mouse.y) * 0.05;

      const progress = currentProgress;
      const velocity = state.velocity;

      // Sync active menu zones after passing each content checkpoint.
      // NOTE: thresholds rescaled by 7/10 since the spline grew from 7 to
      // 10 segments (3 new hierarchical ring checkpoints appended at the
      // end) — these will get properly re-derived once the real Menu Book /
      // Gallery / Testimonial components replace these placeholder sections.
      if (onSectionActive) {
        if (progress < 0.18) {
          onSectionActive(0); // Section 0: Entrance Hall
        } else if (progress < 0.38) {
          onSectionActive(1); // Section 1: Crystal Chamber
        } else if (progress < 0.58) {
          onSectionActive(2); // Section 2: Mixology Archive
        } else {
          onSectionActive(3); // Section 3: Sanctuary Ledger
        }
      }

      if (onEnterReservationLedger) {
        onEnterReservationLedger(progress > 0.58);
      }

      // A. Dynamic Camera Rig Navigation Along Spline with Cinematic Inertia
      const rigPosition = curve.getPoint(progress);
      
      // Camera rig follows spline path with smooth lag
      cameraRig.position.lerp(rigPosition, 0.09);

      // Camera lookAhead to anticipate track S-curves smoothly
      const lookAheadProgress = Math.min(1.0, progress + 0.04);
      const lookAtTarget = curve.getPoint(lookAheadProgress);
      const targetQuat = new THREE.Quaternion();
      const m1 = new THREE.Matrix4();
      m1.lookAt(cameraRig.position, lookAtTarget, new THREE.Vector3(0, 1, 0));
      targetQuat.setFromRotationMatrix(m1);
      
      // Slerp camera rig orientation for organic rotational lag
      cameraRig.quaternion.slerp(targetQuat, 0.065);

      // B. Tiny Idle Breathing & Parallax Motion inside Rig
      const t = state.time;
      const idlePitch = Math.sin(t * 0.31) * 0.0035 + Math.sin(t * 0.12) * 0.0012;
      const idleYaw = Math.cos(t * 0.25) * 0.003 + Math.cos(t * 0.07) * 0.0018;
      const idleRoll = Math.sin(t * 0.17) * 0.002;
      const breathingPos = new THREE.Vector3(
        Math.sin(t * 0.35) * 0.010,
        Math.cos(t * 0.28) * 0.007,
        Math.sin(t * 0.14) * 0.009
      );

      // Rotational lean during rapid scrolling (kinetic scroll roll)
      const targetScrollRoll = progressVelocity * -0.14;
      state.currentScrollRoll += (targetScrollRoll - state.currentScrollRoll) * 0.08;

      // Parallax mouse sway
      const targetMouseX = -state.mouse.x * 0.032;
      const targetMouseY = -state.mouse.y * 0.032;
      state.currentMouseX += (targetMouseX - state.currentMouseX) * 0.07;
      state.currentMouseY += (targetMouseY - state.currentMouseY) * 0.07;

      camera.position.copy(breathingPos);
      camera.rotation.set(
        idlePitch + state.currentMouseY,
        idleYaw + state.currentMouseX,
        idleRoll + state.currentScrollRoll
      );

      // C. Predictive Alignment & Welcome Animations of Torus Rings (Phase 6)
      rings.forEach((ring, idx) => {
        const delta = ring.uValue - progress;
        
        // Anticipate arrival approx 12% spline distance before crossing
        const anticipationRange = 0.12;
        let alignmentWeight = 0;

        if (delta > 0 && delta < anticipationRange) {
          const approachT = 1.0 - (delta / anticipationRange);
          alignmentWeight = Math.sin(approachT * Math.PI * 0.5);
        } else if (delta <= 0 && delta > -0.06) {
          const releaseT = 1.0 - (Math.abs(delta) / 0.06);
          alignmentWeight = releaseT * releaseT;
        }

        // Tilt/nutation wobble — like a dropped ring settling, not a spin
        // around its own symmetry axis (which would be invisible on a
        // rotationally-symmetric torus). Each ring gets a unique frequency
        // and phase so none of the three ever move in sync.
        // (Frequency bumped significantly — the previous version had a
        // ~12 second period, which read as "not moving" on anything short
        // of a long, patient stare at the screen.)
        const idleRotX = Math.sin(t * 1.7 + idx * 1.8) * 0.13 + Math.cos(t * 0.9 + idx) * 0.05;
        const idleRotY = Math.cos(t * 1.4 + idx * 2.3) * 0.11 + Math.sin(t * 0.7 + idx) * 0.045;
        const idleRotZ = Math.sin(t * 1.1 + idx * 1.2) * 0.03;

        // Previously this could fall all the way to 0 during any active
        // scroll, which made the rings look frozen whenever the user was
        // actually scrolling past them. Floor it so wobble is always at
        // least partly visible.
        const velocityDamp = Math.max(0.6, 1.0 - Math.abs(velocity) * 1.0);
        const effectiveIdle = (1.0 - alignmentWeight) * velocityDamp;

        const idleQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(
          idleRotX * effectiveIdle,
          idleRotY * effectiveIdle,
          idleRotZ * effectiveIdle
        ));
        
        const targetRingQuat = new THREE.Quaternion().copy(ring.alignedQuat).multiply(idleQuat);
        const finalTargetQuat = new THREE.Quaternion().slerpQuaternions(targetRingQuat, ring.alignedQuat, alignmentWeight);

        // Faster catch-up (was 0.07) so the mesh actually tracks the now
        // higher-frequency wobble instead of the slerp lag smoothing it
        // away to near-nothing.
        ring.mesh.quaternion.slerp(finalTargetQuat, 0.14);

        // Micro scale response
        const scale = 1.0 + alignmentWeight * 0.04 + Math.sin(t * 0.35 + idx * 1.4) * 0.008;
        ring.mesh.scale.set(scale, scale, scale);
      });

      // D. Distance-Based Readability Fading for Media Items
      mediaMeshes.forEach((item, index) => {
        const dist = item.mesh.position.distanceTo(cameraRig.position);
        
        // Fade parameters: begins visibility at 22 units, fully legible at 6 units
        const fadeStart = 22;
        const fadeEnd = 6;
        const rawT = 1.0 - (THREE.MathUtils.clamp(dist, fadeEnd, fadeStart) - fadeEnd) / (fadeStart - fadeEnd);
        const fadeFactor = THREE.MathUtils.smoothstep(rawT, 0, 1);

        const targetOpacity = THREE.MathUtils.lerp(0.2, 1.0, fadeFactor);
        item.imageMaterial.opacity = targetOpacity;
        item.borderMaterial.opacity = targetOpacity;

        // Keep texture colors true and un-crushed
        item.imageMaterial.color.setRGB(1.0, 1.0, 1.0);

        // Low frequency multi-layered floating motion
        const floatY = Math.sin(t * 0.22 + index * 1.7) * 0.10;
        const floatZ = Math.cos(t * 0.16 + index * 1.3) * 0.08;
        item.mesh.position.y = item.basePos.y + floatY;
        item.mesh.position.z = item.basePos.z + floatZ;

        // Mouse sway tracking on each border plane
        item.mesh.rotation.y = item.mesh.rotation.y + (state.mouse.x * 0.015 - item.mesh.rotation.y) * 0.04;
        item.mesh.rotation.x = item.mesh.rotation.x + (-state.mouse.y * 0.012 - item.mesh.rotation.x) * 0.04;
      });

      // E. Multi-Layered Organic Motion for the Abstract Gallery Sculpture
      const sculptureDist = sculptureGroup.position.distanceTo(cameraRig.position);
      const sculpFadeStart = 22;
      const sculpFadeEnd = 5;
      const sculpRawT = 1.0 - (THREE.MathUtils.clamp(sculptureDist, sculpFadeEnd, sculpFadeStart) - sculpFadeEnd) / (sculpFadeStart - sculpFadeEnd);
      const sculpFactor = THREE.MathUtils.smoothstep(sculpRawT, 0, 1);
      const sculpOpacity = THREE.MathUtils.lerp(0.25, 1.0, sculpFactor);

      sculptureMaterial.opacity = sculpOpacity;
      coreMaterial.opacity = sculpOpacity;

      // Multi-axis incommensurate frequencies (resembles suspended museum piece)
      sculptureMesh.rotation.y = t * 0.035;
      sculptureMesh.rotation.x = Math.sin(t * 0.19) * 0.06;
      sculptureMesh.rotation.z = Math.cos(t * 0.14) * 0.04;

      coreMesh.position.x = Math.sin(t * 0.23) * 0.08;
      coreMesh.position.y = Math.cos(t * 0.31) * 0.06;

      sculptureGroup.position.y = -14.2 + Math.sin(t * 0.27) * 0.08;
      sculptureGroup.position.x = 0.6 + Math.cos(t * 0.21) * 0.05;

      // F. Dynamic Particles Swirling & Scroll Advection
      const ashPosArray = ashGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < ashCount; i++) {
        // Particles speed accelerates during active scrolls
        ashPosArray[i * 3 + 2] += ashSpeeds[i] + (velocity * 0.55);

        // Micro horizontal sinus drift
        const ox = ashOffsets[i * 3];
        const oy = ashOffsets[i * 3 + 1];
        ashPosArray[i * 3] += Math.sin(t * 0.4 + ox) * 0.006;
        ashPosArray[i * 3 + 1] += Math.cos(t * 0.35 + oy) * 0.006;

        // Recycle particles passing behind the camera plane
        if (ashPosArray[i * 3 + 2] > cameraRig.position.z + 1.0) {
          ashPosArray[i * 3 + 2] = cameraRig.position.z - 35;
          ashPosArray[i * 3] = (Math.random() - 0.5) * 16;
          ashPosArray[i * 3 + 1] = (Math.random() - 0.5) * 16 - 3;
        }
      }
      ashGeometry.attributes.position.needsUpdate = true;

      const bokehPosArray = bokehGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < bokehCount; i++) {
        bokehPosArray[i * 3 + 2] += bokehSpeeds[i] + (velocity * 0.25);

        const ox = bokehOffsets[i * 3];
        const oy = bokehOffsets[i * 3 + 1];
        bokehPosArray[i * 3] += Math.sin(t * 0.2 + ox) * 0.003;
        bokehPosArray[i * 3 + 1] += Math.cos(t * 0.18 + oy) * 0.003;

        if (bokehPosArray[i * 3 + 2] > cameraRig.position.z + 1.0) {
          bokehPosArray[i * 3 + 2] = cameraRig.position.z - 35;
          bokehPosArray[i * 3] = (Math.random() - 0.5) * 22;
          bokehPosArray[i * 3 + 1] = (Math.random() - 0.5) * 22 - 3;
        }
      }
      bokehGeometry.attributes.position.needsUpdate = true;

      // G. Balanced Dynamic Lighting
      const flicker = 1.0 + Math.sin(t * 0.95) * 0.04 + Math.cos(t * 2.3) * 0.02;
      keyLight.intensity = (12.0 * (0.65 + (1.0 - progress) * 0.35)) * flicker;
      rimLight.intensity = (14.0 * (0.65 + progress * 0.35)) * flicker;
      ring1Light.intensity = (2.0 + Math.sin(t * 1.1) * 0.3) * flicker;
      ring2Light.intensity = (2.1 + Math.cos(t * 0.9) * 0.3) * flicker;
      ring3Light.intensity = (2.4 + Math.sin(t * 1.2) * 0.35) * flicker;

      // Color shifts: gold warmth merging into sapphire/purple mixology night lounge
      const currentBg = new THREE.Color('#08080c');
      const mixBlue = new THREE.Color('#040510');
      const mixPurple = new THREE.Color('#0b0412');
      const targetColor = new THREE.Color();

      if (progress < 0.45) {
        targetColor.copy(currentBg);
      } else if (progress < 0.78) {
        const uRatio = (progress - 0.45) / 0.33;
        targetColor.lerpColors(currentBg, mixBlue, uRatio);
      } else {
        const uRatio = (progress - 0.78) / 0.22;
        targetColor.lerpColors(mixBlue, mixPurple, uRatio);
      }

      scene.background = targetColor;
      if (scene.fog) {
        scene.fog.color.copy(targetColor);
      }

      // H. Post-processing uniform updates
      // Calculate ring proximity to trigger subtle chromatic aberration peak upon passing through a ring checkpoint
      let ringProximity = 0;
      rings.forEach((ring) => {
        const d = Math.abs(ring.uValue - progress);
        if (d < 0.05) {
          const tRing = 1.0 - (d / 0.05);
          ringProximity = Math.max(ringProximity, Math.sin(tRing * Math.PI));
        }
      });

      // Target chromatic aberration is 85-95% more subtle than before (peaks at ~0.006 during movement)
      const targetAberration = (Math.abs(progressVelocity) * 0.04) + (ringProximity * 0.003);
      cinematicPass.uniforms.uChromaticAberration.value = THREE.MathUtils.lerp(
        cinematicPass.uniforms.uChromaticAberration.value,
        Math.min(0.008, targetAberration),
        0.1
      );
      cinematicPass.uniforms.uTime.value = timestamp;

      // Project keyLight 3D position to screenspace coordinates for camera-reactive cinematic lens flare
      camera.updateMatrixWorld(true);
      const lightPos = new THREE.Vector3(8, 12, 10);
      const projectedLight = lightPos.clone().project(camera);
      const isBehind = projectedLight.z > 1;

      cinematicPass.uniforms.uLightScreenPos.value.set(projectedLight.x, projectedLight.y);
      cinematicPass.uniforms.uLightInFront.value = isBehind ? 0.0 : 1.0;

      // Render the complete layered scene using EffectComposer
      composer.render();
    };

    animationFrameId = requestAnimationFrame(animate);

    // 12. Dynamic resize observer and composer viewport sync
    const handleResize = () => {
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = containerRef.current?.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // 13. Memory-Safe Resource Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      renderer.dispose();
      composer.dispose();

      // Recurse and dispose of core scene geometries and materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      mediaMeshes.forEach((item) => {
        if (item.imageMaterial.map) {
          item.imageMaterial.map.dispose();
        }
        item.imageMaterial.dispose();
        item.borderMaterial.dispose();
      });

      ashGeometry.dispose();
      ashMaterial.dispose();
      bokehGeometry.dispose();
      bokehMaterial.dispose();
      bokehTexture.dispose();
      sculptureGeom.dispose();
      sculptureMaterial.dispose();
      coreGeom.dispose();
      coreMaterial.dispose();
    };
  }, [onSectionActive, onEnterReservationLedger]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

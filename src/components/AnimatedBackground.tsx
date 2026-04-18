'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
// Simplex 3D Noise by Ashima Arts
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

uniform float time;
varying float vDepth;
varying float vOpacity;
varying vec3 vColor;

attribute float randomOffset;
attribute float sizeBase;
attribute vec3 color;

void main() {
    vColor = color;
    vec3 pos = position;
    
    // Antigravity drift modulo logic
    float speed = 1.0; // Movimiento más suave
    float currentY = pos.y + time * speed + randomOffset;
    
    // Wrap around (-20 a 20)
    pos.y = mod(currentY + 20.0, 40.0) - 20.0;
    
    // Modulación orgánica caótica con Simplex Noise (más suave)
    float nX = snoise(vec3(pos.x * 0.1, pos.y * 0.1, time * 0.1));
    float nZ = snoise(vec3(pos.z * 0.1, pos.y * 0.1 + 100.0, time * 0.1));
    
    pos.x += nX * 1.5;
    pos.z += nZ * 1.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    vDepth = -mvPosition.z;
    
    // Atenuación de tamaño
    gl_PointSize = sizeBase * (20.0 / vDepth);
    
    // Opacidad base variada
    vOpacity = 0.3 + (randomOffset * 0.005); 
}
`;

const fragmentShader = `
varying float vDepth;
varying float vOpacity;
varying vec3 vColor;

void main() {
    // Recorte circular
    vec2 pt = gl_PointCoord - vec2(0.5);
    if(length(pt) > 0.5) discard;
    
    // Atenuación de profundidad (Niebla/Fog)
    float fade = smoothstep(25.0, 10.0, vDepth);
    float finalAlpha = vOpacity * fade;
    
    // Aplicamos el color que viene de los atributos
    gl_FragColor = vec4(vColor, finalAlpha);
}
`;

export default function AnimatedBackground({ children }: { children?: React.ReactNode }) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Llenamos completamente el div contenedor
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    canvasContainerRef.current.appendChild(renderer.domElement);

    // PARTICLES GEOMETRY
    const particlesCount = 700;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particlesCount * 3);
    const randomOffsets = new Float32Array(particlesCount);
    const sizeBases = new Float32Array(particlesCount);
    const colors = new Float32Array(particlesCount * 3);

    // Paleta de colores inspirada en la imagen pero más tenues
    const colorPalette = [
      new THREE.Color('#4285F4').lerp(new THREE.Color('#ffffff'), 0.2), // Azul
      new THREE.Color('#EA4335').lerp(new THREE.Color('#ffffff'), 0.2), // Rojo
      new THREE.Color('#FBBC05').lerp(new THREE.Color('#ffffff'), 0.2), // Amarillo
      new THREE.Color('#34A853').lerp(new THREE.Color('#ffffff'), 0.2), // Verde
      new THREE.Color('#8B5CF6').lerp(new THREE.Color('#ffffff'), 0.2), // Púrpura
    ];

    for(let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;     // x (ancho)
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y (alto)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z (profundidad)

      randomOffsets[i] = Math.random() * 100;
      sizeBases[i] = Math.random() * 8.0 + 4.0; 

      // Asignar color aleatorio de la paleta
      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('randomOffset', new THREE.BufferAttribute(randomOffsets, 1));
    geometry.setAttribute('sizeBase', new THREE.BufferAttribute(sizeBases, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // CUSTOM SHADER MATERIAL
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending 
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // MOUSE TRACKING
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      // Normalizar coordenadas del mouse de -1 a 1 para Three.js
      mouseX = (event.clientX - windowHalfX) * 0.02; // Multiplicador ajusta qué tanto se mueve
      mouseY = (event.clientY - windowHalfY) * 0.02;
    };

    window.addEventListener('mousemove', onDocumentMouseMove);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update shader uniform
      material.uniforms.time.value = elapsedTime;

      // Movimiento ultrasuave de toda la geometría siguiendo al ratón
      targetX = mouseX;
      targetY = mouseY;

      // Easing (interpolación lineal suavizada)
      particles.position.x += (targetX - particles.position.x) * 0.02;
      // Invertimos Y porque en DOM el Y positivo es hacia abajo, en WebGL es hacia arriba
      particles.position.y += (-targetY - particles.position.y) * 0.02;

      // Pequeño giro o parallax para darle más tridimensionalidad al mover el mouse
      particles.rotation.y += (targetX * 0.1 - particles.rotation.y) * 0.02;
      particles.rotation.x += (-targetY * 0.1 - particles.rotation.x) * 0.02;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // RESIZE HANDLER
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvasContainerRef.current && canvasContainerRef.current.contains(renderer.domElement)) {
        canvasContainerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* CANVAS LAYER. Usamos un div aislado con z-0 para evitar errores de renderizado de React/DOM */}
      <div 
        ref={canvasContainerRef} 
        className="absolute inset-0 z-0 pointer-events-none" 
      />

      {/* CONTENT LAYER. z-10 asegura que esté por encima del canvas */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

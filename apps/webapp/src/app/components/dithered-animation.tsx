'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

function resolveCssVar(varName: string, fallback: string) {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (value) return value;
  }
  return fallback;
}

export default function DitheredAnimation({ speed = 0.1, style = {} }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === 'dark';
  const color1 = isDarkMode
    ? resolveCssVar('--color-foreground', '#c8d2c9')
    : resolveCssVar('--color-foreground', '#262e29');
  const color2 = isDarkMode
    ? resolveCssVar('--color-background', '#262e29')
    : resolveCssVar('--color-background', '#c8d2c9');

  useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    if (!canvasRef.current || !containerRef.current) return;

    let width = containerRef.current.offsetWidth;
    let height = containerRef.current.offsetHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, width, height, 0, -1, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true
    });
    renderer.setSize(width, height, false);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_color1: { value: new THREE.Color(color1) },
        u_color2: { value: new THREE.Color(color2) },
        u_speed: { value: speed },
        uDitherLevel: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform float u_speed;
        uniform float uDitherLevel;
        varying vec2 vUv;

        float bayer4x4(vec2 pos) {
          int x = int(mod(pos.x, 4.0));
          int y = int(mod(pos.y, 4.0));
          int index = x + y * 4;
          float[16] bayer = float[16](
            0.0,  8.0,  2.0, 10.0,
            12.0, 4.0, 14.0, 6.0,
            3.0, 11.0, 1.0, 9.0,
            15.0, 7.0, 13.0, 5.0
          );
          return bayer[index] / 16.0;
        }

        void main() {
          vec2 uv = vUv;
          float t = u_time * u_speed;
          float grad = smoothstep(0.0, 1.0, uv.y + 0.1 * sin(t + uv.x * 2.0));
          float fade = smoothstep(1.0, 0.7, uv.y);
          grad *= fade;
          float threshold = bayer4x4(gl_FragCoord.xy);
          float dithered = step(threshold * uDitherLevel, grad);
          vec3 color = mix(u_color1, u_color2, dithered);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    materialRef.current = material;

    let geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = width / 2;
    mesh.position.y = height / 2;
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      material.uniforms.u_time.value = performance.now() / 1000;
      if (material.uniforms.uDitherLevel.value < 1) {
        material.uniforms.uDitherLevel.value += 0.01;
      }
      renderer.render(scene, camera);
      if (!visible) setVisible(true);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      width = containerRef.current.offsetWidth;
      height = containerRef.current.offsetHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      renderer.setSize(width, height, false);
      camera.right = width;
      camera.top = height;
      camera.updateProjectionMatrix();
      material.uniforms.u_resolution.value.set(width, height);

      scene.remove(mesh);
      geometry.dispose();
      geometry = new THREE.PlaneGeometry(width, height);
      mesh.geometry = geometry;
      mesh.position.x = width / 2;
      mesh.position.y = height / 2;
      scene.add(mesh);
    };

    const resizeObserver = new window.ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      resizeObserver.disconnect();
    };
  }, [speed, color1, color2, visible, mounted, resolvedTheme]);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.u_color1.value.set(color1);
    materialRef.current.uniforms.u_color2.value.set(color2);
  }, [color1, color2]);

  if (!mounted || !resolvedTheme) {
    return <div style={{ width: '100%', height: '100%' }} />;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{
        background: color1,
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
        style={{
          imageRendering: 'pixelated',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s'
        }}
      />
    </div>
  );
}

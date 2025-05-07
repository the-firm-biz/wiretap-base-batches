'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface DitheredImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export default function DitheredImage({
  src,
  alt,
  width,
  height
}: DitheredImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 });

  const renderWidth = width || imgSize.width;
  const renderHeight = height || imgSize.height;

  useEffect(() => {
    if (!imgLoaded || !imgRef.current || !canvasRef.current) return;

    console.log('Three.js effect running', { imgLoaded, imgRef, canvasRef });

    // Set up Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      0,
      renderWidth,
      renderHeight,
      0,
      -1,
      1
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true
    });
    renderer.setSize(renderWidth, renderHeight);

    // Create texture from image
    const texture = new THREE.Texture(imgRef.current);
    texture.needsUpdate = true;

    // Dithering shader material with aspect ratio correction
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uResolution: { value: new THREE.Vector2(renderWidth, renderHeight) },
        uImageSize: { value: new THREE.Vector2(imgSize.width, imgSize.height) },
        uColor1: { value: new THREE.Color(0.7843, 0.8235, 0.78) }, // Our sage-200
        uColor2: { value: new THREE.Color(0.153, 0.18, 0.16) }, // Our sage-900
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
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform vec2 uImageSize;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uDitherLevel;
        varying vec2 vUv;

        // 4x4 Bayer matrix
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

        // Fit image into plane with letterboxing (contain)
        vec2 getContainUv(vec2 uv, vec2 plane, vec2 image) {
          float planeRatio = plane.x / plane.y;
          float imageRatio = image.x / image.y;
          vec2 newUv = uv;
          if (imageRatio > planeRatio) {
            float scale = planeRatio / imageRatio;
            newUv.y = (uv.y - 0.5) * scale + 0.5;
          } else {
            float scale = imageRatio / planeRatio;
            newUv.x = (uv.x - 0.5) * scale + 0.5;
          }
          return newUv;
        }

        void main() {
          vec2 uv = getContainUv(vUv, uResolution, uImageSize);
          vec4 color = texture2D(uTexture, uv);
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          float contrast = 1.3; // Increase for more contrast
          gray = (gray - 0.5) * contrast + 0.5;
          gray = clamp(gray, 0.0, 1.0);
          float threshold = bayer4x4(gl_FragCoord.xy);
          float dithered = step(threshold, gray * uDitherLevel);
          gl_FragColor = vec4(mix(uColor2, uColor1, dithered), 1.0);
        }
      `
    });

    // Plane with shader
    const geometry = new THREE.PlaneGeometry(renderWidth, renderHeight);
    const mesh = new THREE.Mesh(geometry, material);
    // Move the plane so its bottom-left corner is at (0, 0) -- without this, image is offset
    mesh.position.x = renderWidth / 2;
    mesh.position.y = renderHeight / 2;
    scene.add(mesh);

    renderer.render(scene, camera);

    // Dithering loading animation
    let animationFrame;
    function animateDither() {
      if (material.uniforms.uDitherLevel.value < 1) {
        material.uniforms.uDitherLevel.value += 0.08; // adjust speed as desired (faster)
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(animateDither);
      } else {
        material.uniforms.uDitherLevel.value = 1;
        renderer.render(scene, camera);
      }
    }
    animateDither();

    return () => {
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      texture.dispose();
    };
  }, [renderWidth, renderHeight, src, imgLoaded, imgSize]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && !imgLoaded) {
      // If the image is already loaded from cache, manually trigger onLoad logic
      console.log('Image was already loaded (from cache)');
      setImgLoaded(true);
      setImgSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight
      });
    }
  }, [imgLoaded]);

  return (
    <div
      style={{ position: 'relative', width: renderWidth, height: renderHeight }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={renderWidth}
        height={renderHeight}
        // The below style hides the image but still lets it load. If removed, it'll be visible briefly before the dithered version is rendered, which could be desirable in a different use case.
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
        onLoad={(e) => {
          setImgLoaded(true);
          setImgSize({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight
          });
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          imageRendering: 'pixelated',
          width: renderWidth,
          height: renderHeight
        }}
      />
    </div>
  );
}

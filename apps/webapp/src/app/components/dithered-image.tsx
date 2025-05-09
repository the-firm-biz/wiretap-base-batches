'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface DitheredImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  mode?: 'mono' | 'color';
  bayerMatrix?: 2 | 4 | 'auto'; // Lets us specify the Bayer Matrix grid size (resolution), but by default automatically uses a smaller matrix for smaller images
}

export default function DitheredImage({
  src,
  alt,
  width,
  height,
  mode = 'mono',
  bayerMatrix = 'auto'
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
        uDitherLevel: { value: 0 },
        uWidth: { value: renderWidth },
        uHeight: { value: renderHeight },
        uMode: { value: mode === 'color' ? 1 : 0 },
        uBayerSize: { value: bayerMatrix === 2 ? 2 : bayerMatrix === 4 ? 4 : 0 }
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
        uniform float uWidth;
        uniform float uHeight;
        uniform int uMode;
        uniform int uBayerSize;
        varying vec2 vUv;

        // 2x2 Bayer matrix
        float bayer2x2(vec2 pos) {
          int x = int(mod(pos.x, 2.0));
          int y = int(mod(pos.y, 2.0));
          int index = x + y * 2;
          float[4] bayer = float[4](0.0, 2.0, 3.0, 1.0);
          return bayer[index] / 4.0;
        }
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

        // Fit image into plane with cropping (cover)
        vec2 getCoverUv(vec2 uv, vec2 plane, vec2 image) {
          float planeRatio = plane.x / plane.y;
          float imageRatio = image.x / image.y;
          float scale = (imageRatio > planeRatio)
            ? plane.y / image.y
            : plane.x / image.x;
          vec2 scaledImage = image * scale;
          vec2 offset = (plane - scaledImage) * 0.5;
          vec2 coverUv = (uv * plane - offset) / scaledImage;
          return coverUv;
        }

        // Color quantization function
        vec3 quantizeColor(vec3 color, float levels) {
          return floor(color * levels + 0.5) / levels;
        }

        void main() {
          vec2 coverUv = getCoverUv(vUv, uResolution, uImageSize);
          if (coverUv.x < 0.0 || coverUv.x > 1.0 || coverUv.y < 0.0 || coverUv.y > 1.0) {
            discard;
          }
          vec4 color = texture2D(uTexture, coverUv);
          float levels = 4.0;
          float threshold;

          // Bayer matrix selection logic: automatically use a smaller matrix for smaller images
          if (uBayerSize == 2) {
            threshold = bayer2x2(gl_FragCoord.xy);
          } else if (uBayerSize == 4) {
            threshold = bayer4x4(gl_FragCoord.xy);
          } else {
            // Adjust the below threshold to change size at which matrix changes
            if (uWidth <= 48.0 || uHeight <= 48.0) { 
              threshold = bayer2x2(gl_FragCoord.xy);
            } else {
              threshold = bayer4x4(gl_FragCoord.xy);
            }
          }
          
          // If mode is color, use color dithering, otherwise use monochrome dithering
          if (uMode == 1) {
            // Color dithering
            vec3 quantized = quantizeColor(color.rgb, levels);
            vec3 dithered = quantized + (threshold - 0.5) * (1.0 / levels) * uDitherLevel;
            dithered = clamp(dithered, 0.0, 1.0);
            gl_FragColor = vec4(dithered, color.a);
          } else {
            // Monochrome dithering
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            float contrast = 1.5; // Increase for more contrast
            float gamma = 0.8;
            gray = (gray - 0.5) * contrast + 0.5;
            gray = pow(gray, gamma);
            gray = clamp(gray, 0.0, 1.0);
            float dithered = step(threshold, gray * uDitherLevel);
            if (gray <= 0.015) {
              gl_FragColor = vec4(uColor2, 1.0); // force dark
              return;
            }
            gl_FragColor = vec4(mix(uColor2, uColor1, dithered), 1.0);
          }
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
    function animateDither() {
      if (material.uniforms.uDitherLevel.value < 1) {
        material.uniforms.uDitherLevel.value += 0.08; // adjust speed as desired (faster)
        renderer.render(scene, camera);
        requestAnimationFrame(animateDither);
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
  }, [renderWidth, renderHeight, src, imgLoaded, imgSize, mode, bayerMatrix]);

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
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

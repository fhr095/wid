import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import "../styles/SceneConfig.scss";

export default function SceneConfig({ glbPath, setModelParts, selectedPart, resetTrigger }) {
  const mountRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const modelRef = useRef(null);
  const blinkRef = useRef({ intervalId: null, isBlinking: false, originalColor: null });

  useEffect(() => {
    let isMounted = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();

    loader.load(
      glbPath,
      (gltf) => {
        if (!isMounted) return;
        modelRef.current = gltf.scene;
        scene.add(modelRef.current);
        modelRef.current.rotation.y = Math.PI;
        camera.position.set(0, 10, 50);
        camera.lookAt(modelRef.current.position);

        const parts = [];
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            parts.push(child.name || child.uuid);
          }
        });
        setModelParts(parts);

        const animate = function () {
          if (!isMounted) return;
          requestAnimationFrame(animate);
          modelRef.current.rotation.y += 0.001;
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
        setLoadingProgress(100);
      },
      (xhr) => {
        if (!isMounted) return;
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          setLoadingProgress(Math.round(percentComplete));
        }
      },
      (error) => {
        console.error("Error loading GLB model:", error);
      }
    );

    const handleResize = () => {
      if (!isMounted) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [glbPath, resetTrigger]);

  useEffect(() => {
    if (selectedPart && modelRef.current) {
      if (blinkRef.current.isBlinking) {
        clearInterval(blinkRef.current.intervalId);
        blinkRef.current.isBlinking = false;
      }

      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = child.name === selectedPart ? 1 : 0.1;
        }
      });

      if (selectedPart) {
        const selectedObject = modelRef.current.getObjectByName(selectedPart);
        if (selectedObject) {
          blinkRef.current.isBlinking = true;
          blinkRef.current.originalColor = selectedObject.material.color.clone();
          selectedObject.material.color.set(0xff0000); // Red color

          blinkRef.current.intervalId = setInterval(() => {
            selectedObject.material.opacity =
              selectedObject.material.opacity === 1 ? 0.5 : 1;
          }, 500);
        }
      }
    } else {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = false;
            child.material.opacity = 1;
            if (blinkRef.current.originalColor) {
              child.material.color.copy(blinkRef.current.originalColor);
            }
          }
        });
      }
      if (blinkRef.current.isBlinking) {
        clearInterval(blinkRef.current.intervalId);
        blinkRef.current.isBlinking = false;
      }
    }
  }, [selectedPart]);

  return (
    <div ref={mountRef} className="sceneConfig-container">
      {loadingProgress < 100 && (
        <div className="loading-overlay">
          <div className="loading-text">Carregando: {loadingProgress}%</div>
        </div>
      )}
    </div>
  );
}
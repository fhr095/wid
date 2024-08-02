import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import TWEEN from "@tweenjs/tween.js";
import "../styles/SceneScreen.scss";
import ModelLoader from "./ModelLoader";
import FocusZoom from "./FocusZoom";

export default function SceneContainer({ glbPath }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  );
  const rendererRef = useRef(null);
  const labelRendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const [targetName, setTargetName] = useState("");

  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const labelRenderer = new CSS2DRenderer();
    const controls = new OrbitControls(camera, renderer.domElement);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";

    mountRef.current.appendChild(renderer.domElement);
    mountRef.current.appendChild(labelRenderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controlsRef.current = controls;

    camera.position.set(0, 20, 50);
    controls.target.set(0, 0, 0);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        mountRef.current.removeChild(labelRenderer.domElement);
      }
    };
  }, []);

  const handleModelLoad = (model) => {
    sceneRef.current.add(model);
    modelRef.current = model;
  };

  return (
    <div ref={mountRef} className="scene-container">
      <ModelLoader glbPath={glbPath} onLoad={handleModelLoad} />
      <FocusZoom targetName={targetName} scene={sceneRef.current} camera={cameraRef.current} controls={controlsRef.current} />
    </div>
  );
}

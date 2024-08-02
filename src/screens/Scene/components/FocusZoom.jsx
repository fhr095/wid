import React, { useEffect } from "react";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

export default function FocusZoom({ targetName, scene, camera, controls }) {
  useEffect(() => {
    const focusOnLocation = (targetName, duration = 2000) => {
      const targetMeshs = [];
      scene.traverse((child) => {
        if ((child.isMesh || child.isGroup) && child.name.includes(targetName)) {
          targetMeshs.push(child);
        }
      });

      if (targetMeshs.length > 0) {
        const boundingBox = new THREE.Box3();
        targetMeshs.forEach((mesh) => boundingBox.expandByObject(mesh));
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const aspect = camera.aspect;
        let cameraZ = maxDim / (2 * Math.tan(fov / 2));
        cameraZ = cameraZ / Math.min(1, aspect);

        const newCameraPosition = new THREE.Vector3(
          center.x,
          center.y + cameraZ * 0.5,
          center.z + cameraZ
        );

        new TWEEN.Tween(camera.position)
          .to(newCameraPosition, duration)
          .easing(TWEEN.Easing.Cubic.InOut)
          .onUpdate(() => {
            camera.lookAt(center);
            controls.target.copy(center);
            controls.update();
          })
          .start();
      }
    };

    if (targetName) {
      focusOnLocation(targetName);
    }
  }, [targetName, scene, camera, controls]);

  return null;
}

import React, { useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function ModelLoader({ glbPath, onLoad }) {
  useEffect(() => {
    if (glbPath) {
      const loader = new GLTFLoader();
      loader.load(
        glbPath,
        (gltf) => {
          onLoad(gltf.scene);
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log("Carregamento do modelo:", Math.round(percentComplete), "% completo");
          }
        },
        (error) => {
          console.error("Erro ao carregar o modelo GLB:", error);
        }
      );
    }
  }, [glbPath, onLoad]);

  return null;
}

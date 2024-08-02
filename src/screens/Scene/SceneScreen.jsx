import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import SceneContainer from "./components/SceneContainer";
import VoiceButton from "./components/VoiceButton";
import Widget from "./components/Widget";
import Response from "./components/Response";
import MapBackground from "./components/MapBackgroud";
import MiniMap from "./components/MiniMap";
import HomeButton from "./components/HomeButton";
import "./styles/SceneScreen.scss";
import LoadingScreen from "./components/LoadingScreen";
import { openDB, getFromDB, saveToDB } from "../../utils";

export default function SceneScreen() {
  const [glbPath, setGlbPath] = useState("");
  const [habitatId, setHabitatId] = useState("");
  const [responses, setResponses] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [fade, setFade] = useState("");
  const location = useLocation();
  const [resetTrigger, setResetTrigger] = useState(false);
  const [address, setAddress] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHabitatModel = async () => {
      const queryParams = new URLSearchParams(location.search);
      const id = queryParams.get("id");
      setHabitatId(id);

      if (id) {
        try {
          const dbInstance = await openDB("ModelDB", 1);
          const cachedModel = await getFromDB(dbInstance, "models", id);
          if (cachedModel) {
            console.log("Carregando modelo do cache do IndexedDB");
            const blob = new Blob([cachedModel], { type: "model/gltf-binary" });
            const blobUrl = URL.createObjectURL(blob);
            setGlbPath(blobUrl);
            const habitatDocRef = doc(db, "habitats", id);
            const habitatDoc = await getDoc(habitatDocRef);
            if (habitatDoc.exists()) {
              const habitatData = habitatDoc.data();
              setAddress(habitatData.address || "");
            }
            setIsLoading(false);
            return;
          }

          console.log("Carregando modelo do Firebase");
          const habitatDocRef = doc(db, "habitats", id);
          const habitatDoc = await getDoc(habitatDocRef);
          if (habitatDoc.exists()) {
            const habitatData = habitatDoc.data();
            const modelRef = ref(storage, habitatData.glbPath);
            const url = await getDownloadURL(modelRef);

            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";

            xhr.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                setProgress(Math.floor(percentComplete));
              }
            };

            xhr.onload = async () => {
              if (xhr.status === 200) {
                const arrayBuffer = xhr.response;
                const blob = new Blob([arrayBuffer], { type: "model/gltf-binary" });
                const blobUrl = URL.createObjectURL(blob);

                setGlbPath(blobUrl);
                setAddress(habitatData.address || "");

                console.log("Salvando modelo no IndexedDB");
                await saveToDB(dbInstance, "models", id, arrayBuffer);
              } else {
                console.error("Erro ao carregar o modelo do Firebase:", xhr.statusText);
              }
              setIsLoading(false);
            };

            xhr.onerror = () => {
              console.error("Erro ao carregar o modelo do Firebase");
              setIsLoading(false);
            };

            xhr.send();
          } else {
            console.error("Habitat não encontrado");
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Erro ao buscar modelo do habitat:", error);
          setIsLoading(false);
        }
      }
    };

    fetchHabitatModel();
  }, [location]);

  const handleHomeButtonClick = (event) => {
    event.preventDefault();
    setResetTrigger((prev) => !prev);
  };

  return (
    <div className="SceneScreen-container">
      {isLoading && <LoadingScreen progress={progress} />}
      {glbPath && (
        <SceneContainer
          glbPath={glbPath}
          habitatId={habitatId}
          transcript={transcript}
          setResponse={setResponses}
          fade={fade}
          resetTrigger={resetTrigger}
        />
      )}

      {address && <MapBackground address={address} />}

      <div className="buttons">
        <HomeButton onClick={handleHomeButtonClick} />
        <VoiceButton setTranscript={setTranscript} />
      </div>

      {address && <MiniMap address={address} />}

      <Widget habitatId={habitatId} />

      <Response habitatId={habitatId} transcript={transcript} responses={responses} setFade={setFade} />
    </div>
  );
}

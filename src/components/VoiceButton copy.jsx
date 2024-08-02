import React, { useEffect, useState, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import ScaleLoader from "react-spinners/ScaleLoader";

import "../styles/VoiceButton.scss";

export default function VoiceButton({ setTranscript, isDisabled }) {
  const [listening, setListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const recognitionRef = useRef(null);
  const [forceStop, setForceStop] = useState(false);
  const [audioCaptured, setAudioCaptured] = useState(false);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "pt-BR";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setListening(true);
        setAudioCaptured(false);  // Reset audio captured status
        setShowTooltip(false);  // Esconder o tooltip quando a gravação começa
      };

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setAudioCaptured(true);  // Audio foi captado
        setListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        if (!audioCaptured) {
          setShowTooltip(true);  // Mostrar tooltip se nenhum áudio foi captado
          setTimeout(() => {
            setShowTooltip(false);
          }, 2000);
        }
        setListening(false);
      };
    }
  }, [setTranscript, audioCaptured]);

  useEffect(() => {
    if (forceStop && listening) {
      handleStopListening();
    }
  }, [forceStop, listening]);

  const handleStartListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);  // Força a atualização imediata do estado
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setShowTooltip(false);
    setForceStop(false);
    handleStartListening();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setForceStop(true);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setShowTooltip(false);
    setForceStop(false);
    handleStartListening();
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setForceStop(true);
  };

  const handleMouseLeave = (e) => {
    e.preventDefault();
    handleStopListening();
  };

  const handleMouseClick = (e) => {
    e.preventDefault();
  };

  return (
    <div className="voice-button-container">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleMouseClick}
        disabled={isDisabled}
        className="voice-button"
      >
        {listening ? (
          <ScaleLoader color="white" height={15} width={3} radius={2} margin={2} />
        ) : (
          <FaMicrophone color="white" size={20} />
        )}
      </button>
      {showTooltip && <div className="tooltip">Segure para falar e depois solte</div>}
    </div>
  );
}

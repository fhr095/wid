import React, { useEffect, useRef, useState } from 'react';
import { FaHandPointUp } from 'react-icons/fa';
import "../styles/Convite.scss";
import Avatar from "../assets/images/Avatar.png"; // Atualize o caminho para o avatar

const Convite = ({ buttonPosition }) => {
  const conviteRef = useRef(null);
  const [conviteDimensions, setConviteDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (conviteRef.current) {
      const { width, height } = conviteRef.current.getBoundingClientRect();
      setConviteDimensions({ width, height });
    }
  }, []);

  console.log("Convite Position:", buttonPosition);
  console.log("Convite Dimensions:", conviteDimensions);

  return (
    <div
      className="convite-container"
      ref={conviteRef}
      style={{
        position: 'absolute',
        top: buttonPosition.top - conviteDimensions.height / 2, // Centraliza verticalmente
        left: buttonPosition.left + buttonPosition.width + 20, // Posiciona à direita do botão
      }}
    >
      <div className="message-wrapper">
        <div className="bot-icon">
          <img src={Avatar} alt="Avatar" className="avatar-image" />
        </div>
        <div className="message-container">
          <div className="convite">
            <p>Olá! Pressione no botão ao lado para fazer uma pergunta.</p>
          </div>
        </div>
      </div>
      <div
        className="hand-icon"
        style={{
          position: 'absolute',
          top: '100%', // Ajusta a posição do dedo para ficar abaixo do botão de áudio
          left: '-10%',
          transform: 'translate(60%) rotate(90deg)', // Rotaciona o ícone para apontar para cima
        }}
      >
        <FaHandPointUp size={40} color="#007bff" />
      </div>
    </div>
  );
};

export default Convite;

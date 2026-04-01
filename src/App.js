import "./App.css";
import Hero from "./components/Hero";
import RSVPForm from "./components/RSVPForm";
import Curtain from "./components/Curtain";
import lilMe from "./assets/lil-me.png";
import yertOld from "./assets/old.png";
import deadMe from "./assets/dead.png";
import barrelExplode from "./assets/barrel explode.wav";
import deathSound from "./assets/death.mp3";
import { useEffect, useRef, useState } from "react";

const App = () => {
  const [me, setMe] = useState(lilMe);
  const [showBlowUp, setShowBlowUp] = useState(false);
  const [driveAcross, setDriveAcross] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [flashSequence, setFlashSequence] = useState(0);
  const initialMeRef = useRef(me);

  useEffect(() => {
    if (me === initialMeRef.current) {
      return;
    }

    setFlashSequence((current) => current + 1);
  }, [me]);

  const handleCrash = () => {
    setTimeout(() => {
      new Audio(barrelExplode).play();
      setShowBlowUp(true);
    }, 9500);
    setTimeout(() => setShowBlowUp(false), 11000);
    setTimeout(() => setMe(yertOld), 10300);
  };

  const handleCurtainLift = () => {
    setDriveAcross(true);
  };

  const handleNo = () => {
    const deathAudio = new Audio(deathSound);

    deathAudio.loop = false;
    setMe(deadMe);
    deathAudio.play();
  };

  return (
    <div className="App" id="App">
      {flashSequence > 0 ? (
        <div key={flashSequence} className="app-flash-overlay" />
      ) : null}
      <Curtain
        handleCrash={handleCrash}
        handleCurtainLift={handleCurtainLift}
      />
      {!showRSVP ? (
        <Hero
          me={me}
          showBlowUp={showBlowUp}
          driveAcross={driveAcross}
          onYes={() => setShowRSVP(true)}
          onNo={handleNo}
        />
      ) : null}
      {showRSVP ? <RSVPForm /> : null}
    </div>
  );
};

export default App;

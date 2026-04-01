import "./App.css";
import Hero from "./components/Hero";
import RSVPForm from "./components/RSVPForm";
import Curtain from "./components/Curtain";
import lilMe from "./assets/lil-me.png";
import yertOld from "./assets/old.png";
import deadMe from "./assets/dead.png";
import barrelExplode from "./assets/barrel explode.wav";
import deathSound from "./assets/death.mp3";
import doorOpenSound from "./assets/door-open.mp3";
import { useEffect, useRef, useState } from "react";

const RSVP_COVER_DURATION_MS = 760;

const App = () => {
  const [me, setMe] = useState(lilMe);
  const [showBlowUp, setShowBlowUp] = useState(false);
  const [driveAcross, setDriveAcross] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [isRSVPCoveringHero, setIsRSVPCoveringHero] = useState(false);
  const [flashSequence, setFlashSequence] = useState(0);
  const initialMeRef = useRef(me);
  const rsvpCoverTimerRef = useRef(null);

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

  const handleYes = () => {
    const doorAudio = new Audio(doorOpenSound);

    doorAudio.play().catch(() => {
      // Ignore playback failures due to browser autoplay policy.
    });

    setIsRSVPCoveringHero(true);

    if (rsvpCoverTimerRef.current) {
      window.clearTimeout(rsvpCoverTimerRef.current);
    }

    rsvpCoverTimerRef.current = window.setTimeout(() => {
      setShowRSVP(true);
      setIsRSVPCoveringHero(false);
      rsvpCoverTimerRef.current = null;
    }, RSVP_COVER_DURATION_MS);
  };

  useEffect(() => {
    return () => {
      if (rsvpCoverTimerRef.current) {
        window.clearTimeout(rsvpCoverTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="App" id="App">
      {flashSequence > 0 ? (
        <div key={flashSequence} className="app-flash-overlay" />
      ) : null}
      <Curtain
        handleCrash={handleCrash}
        handleCurtainLift={handleCurtainLift}
      />
      {!showRSVP || isRSVPCoveringHero ? (
        <Hero
          me={me}
          showBlowUp={showBlowUp}
          driveAcross={driveAcross}
          onYes={handleYes}
          onNo={handleNo}
        />
      ) : null}
      {showRSVP || isRSVPCoveringHero ? (
        <div
          className={`app-rsvp-layer ${
            isRSVPCoveringHero ? "is-covering-hero" : ""
          }`}
        >
          <RSVPForm
            className={isRSVPCoveringHero ? "rsvp-shell--covering" : ""}
          />
        </div>
      ) : null}
    </div>
  );
};

export default App;

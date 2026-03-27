import "./App.css";
import Hero from "./components/Hero";
import RSVPForm from "./components/RSVPForm";
import Curtain from "./components/Curtain";
import lilMe from "./assets/lil-me.png";
import yertOld from "./assets/yert_old.png";
import { useState } from "react";

const App = () => {
  const [me, setMe] = useState(lilMe);
  const [showBlowUp, setShowBlowUp] = useState(false);
  const [driveAcross, setDriveAcross] = useState(false);

  const handleCrash = () => {
    setTimeout(() => setShowBlowUp(true), 9500);
    setTimeout(() => setShowBlowUp(false), 11000);
    setTimeout(() => setMe(yertOld), 10300);
  };

  const handleCurtainLift = () => {
    setDriveAcross(true);
  };

  return (
    <div className="App" id="App">
      <Curtain
        handleCrash={handleCrash}
        handleCurtainLift={handleCurtainLift}
      />
      <Hero me={me} showBlowUp={showBlowUp} driveAcross={driveAcross} />
      <RSVPForm />
    </div>
  );
};

export default App;

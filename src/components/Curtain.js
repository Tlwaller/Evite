import React, { useState, useRef, useEffect } from "react";
import "../styles/Curtain.css";
import song1 from "../assets/theDistance.mp3";
import unopenedMail from "../assets/unopened mail.gif";
import mail from "../assets/mail.webp";

const Curtain = (props) => {
  const [song, setSong] = useState(song1);
  const [mailOpened, setMailOpened] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElementRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const resumeTimeRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!isHidden) {
        window.scrollTo(0, 0);
      }
    };

    const disableScroll = () => {
      if (!isHidden) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        window.addEventListener("scroll", handleScroll);
      } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        window.removeEventListener("scroll", handleScroll);
      }
    };

    disableScroll();

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHidden]);

  const handleClick = () => {
    setMailOpened(true);
    setIsPlaying(true);
    audioElementRef.current.currentTime = 2;

    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(
        audioElementRef.current,
      );
      const gainNode = audioContextRef.current.createGain();
      sourceNodeRef.current.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
    }

    if (!isPlaying) {
      resumeTimeRef.current = audioElementRef.current.currentTime;
      audioElementRef.current.play();
    }
    setTimeout(() => {
      if (!isHiding) {
        setIsHiding(true);
        if (props.handleCurtainLift) {
          props.handleCurtainLift();
        }
        setTimeout(() => {
          setIsHidden(true);
        }, 2000);
      }
    }, 5290);
    props.handleCrash();
  };

  return (
    <div
      className={`curtain ${isHiding && "hiding"}`}
      onClick={handleClick}
      style={{ display: isHidden ? "none" : "flex" }}
    >
      <div className="mail-contain" style={{ display: isHiding ? "none" : "" }}>
        <span>U HAVE MAIL.</span>
        <img
          style={{ display: !mailOpened ? "block" : "none" }}
          src={unopenedMail}
          alt="mail"
          className="mail"
        />
        <img
          style={{ display: mailOpened ? "block" : "none" }}
          src={mail}
          alt="mail"
          className="mail"
        />
        <span>TAP TO OPEN</span>
      </div>
      <audio
        ref={audioElementRef}
        src={song}
        autoPlay={isPlaying}
        muted={!isPlaying}
        // onEnded={playNextSong}
      />
    </div>
  );
};

export default Curtain;

import React, { useEffect, useRef, useState } from "react";
import "../styles/Hero.css";
import blowup from "../assets/blowup.gif";
import drivinge from "../assets/drivinge.gif";
import scootin from "../assets/scootin.gif";
import gobeer from "../assets/gobeer.gif";

const HIDE_DELAY_MS = 1500;
const TYPE_INTERVAL_MS = 24;
const ACTION_REVEAL_DELAY_MS = 220;

const HERO_COPY = [
  "HI! I AM TURNING 27",
  "I want to go to K1 and race go-karts, it should be about $40-$50 per person.",
  "I would then like to go to either Community Brewing or Tanstaafl Pub afterwards.",
  "ARE YOU IN???",
];

const EMPTY_COPY = HERO_COPY.map(() => "");

const Hero = (props) => {
  const [hasTriggeredAnimation, setHasTriggeredAnimation] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [typedCopy, setTypedCopy] = useState(EMPTY_COPY);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const initialMeRef = useRef(props.me);
  const hasDeclinedRef = useRef(false);

  const handleNoClick = () => {
    hasDeclinedRef.current = true;
    setHasTriggeredAnimation(false);
    setBubbleVisible(false);
    setTypedCopy(EMPTY_COPY);
    setIsTyping(false);
    setShowActions(false);

    if (props.onNo) {
      props.onNo();
    }
  };

  useEffect(() => {
    if (props.me === initialMeRef.current || hasDeclinedRef.current) {
      return;
    }

    let hideTimerId;
    let typingTimerId;
    let actionsTimerId;
    let segmentIndex = 1;
    let charIndex = 0;

    setHasTriggeredAnimation(false);
    setBubbleVisible(false);
    setTypedCopy(EMPTY_COPY);
    setIsTyping(false);
    setShowActions(false);

    hideTimerId = window.setTimeout(() => {
      setHasTriggeredAnimation(true);
      setBubbleVisible(true);
      setTypedCopy([HERO_COPY[0], "", "", ""]);
      setIsTyping(true);

      typingTimerId = window.setInterval(() => {
        setTypedCopy((prevCopy) => {
          if (segmentIndex >= HERO_COPY.length) {
            window.clearInterval(typingTimerId);
            setIsTyping(false);
            actionsTimerId = window.setTimeout(() => {
              setShowActions(true);
            }, ACTION_REVEAL_DELAY_MS);
            return prevCopy;
          }

          const currentSegment = HERO_COPY[segmentIndex];
          const nextCopy = [...prevCopy];

          charIndex += 1;
          nextCopy[segmentIndex] = currentSegment.slice(0, charIndex);

          if (charIndex >= currentSegment.length) {
            segmentIndex += 1;
            charIndex = 0;
          }

          return nextCopy;
        });
      }, TYPE_INTERVAL_MS);
    }, HIDE_DELAY_MS);

    return () => {
      window.clearTimeout(hideTimerId);
      window.clearTimeout(actionsTimerId);
      window.clearInterval(typingTimerId);
    };
  }, [props.me]);

  return (
    <section className="hero">
      <img alt="me" src={props.me} className="me" />
      {hasTriggeredAnimation && bubbleVisible ? (
        <div className="hero-main is-visible">
          <aside
            className="race-modal"
            role="dialog"
            aria-label="Birthday plans"
          >
            <h2 className="race-modal__title">{HERO_COPY[0]}</h2>

            <p className="race-modal__paragraph">
              {typedCopy[1]}
              {isTyping && typedCopy[1].length < HERO_COPY[1].length ? (
                <span className="race-modal__cursor" aria-hidden="true">
                  |
                </span>
              ) : null}
            </p>
            <img src={scootin} alt="scootin" className="race-modal__divider" />

            <p className="race-modal__paragraph">
              {typedCopy[2]}
              {isTyping &&
              typedCopy[1].length === HERO_COPY[1].length &&
              typedCopy[2].length < HERO_COPY[2].length ? (
                <span className="race-modal__cursor" aria-hidden="true">
                  |
                </span>
              ) : null}
            </p>
            <img src={gobeer} alt="gobeer" className="race-modal__divider" />

            <p className="race-modal__paragraph race-modal__calendar-note">
              {typedCopy[3]}
              {isTyping &&
              typedCopy[2].length === HERO_COPY[2].length &&
              typedCopy[3].length < HERO_COPY[3].length ? (
                <span className="race-modal__cursor" aria-hidden="true">
                  |
                </span>
              ) : null}
            </p>

            {showActions ? (
              <div className="race-modal__actions">
                <button
                  type="button"
                  className="race-modal__btn race-modal__btn--yes"
                  onClick={props.onYes}
                >
                  YES
                </button>
                <button
                  type="button"
                  className="race-modal__btn race-modal__btn--no"
                  onClick={handleNoClick}
                >
                  ...no
                </button>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
      <img
        alt="blow up"
        src={blowup}
        style={{ display: props.showBlowUp ? "block" : "none" }}
        className="blowup"
      />
      <img
        src={drivinge}
        alt="drivinge"
        className={`drivinge ${props.driveAcross ? "drive-across" : ""}`}
      />
      {/* </div> */}
      {/* </div> */}
    </section>
  );
};

export default Hero;

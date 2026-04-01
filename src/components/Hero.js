import React from "react";
import "../styles/Hero.css";
import blowup from "../assets/blowup.gif";
import drivinge from "../assets/drivinge.gif";
import scootin from "../assets/scootin.gif";
import gobeer from "../assets/gobeer.gif";

const Hero = (props) => {
  return (
    <section className="hero">
      {/* <div className="box--gradient" /> */}
      {/* <div className="center panel"> */}
      {/* <div className="center-content"> */}
      <img alt="me" src={props.me} className="me" />
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

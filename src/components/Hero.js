import React from "react";
import "../styles/Hero.css";
import blowup from "../assets/blowup.gif";
import drivinge from "../assets/drivinge.gif";
import scootin from "../assets/scootin.gif";
import gobeer from "../assets/gobeer.gif";

const Hero = (props) => {
  return (
    <section className="hero">
      <div className="box--gradient" />
      <div className="left edge panel">
        <div className="left-content">
          <h2>
            I AM QUICKLY APPROACHING THE MIDDLE OF MY LIFE. COME HANG OUT AND
            CELEBRATE.
          </h2>
        </div>
      </div>
      <div className="center panel">
        <div className="center-content">
          <img alt="me" src={props.me} className="me" />
          <h1 lang="en">TREY IS TURNING 27. BE THERE.</h1>
          <img
            alt="blow up"
            style={{
              position: "absolute",
              height: "110%",
              left: "-10%",
              bottom: "-10%",
              display: props.showBlowUp ? "block" : "none",
            }}
            src={blowup}
            className="blowup"
          />
          <img
            src={drivinge}
            alt="drivinge"
            className={`drivinge ${props.driveAcross ? "drive-across" : ""}`}
          />
        </div>
      </div>
      <div className="right edge panel">
        <div className="right-content">
          <h3 style={{ marginBottom: "0px" }}>
            WE WILL RACE GO
            <br />
            KARTS AT K1
          </h3>
          <img src={scootin} alt="scootin" className="scootin" />
          <h3 style={{ margin: "0px" }}>
            THEN WE WILL GO
            <br />
            TANSTAAFL
          </h3>
          <img src={gobeer} alt="gobeer" className="gobeer" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

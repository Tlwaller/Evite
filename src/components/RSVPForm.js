import { useEffect, useMemo, useState } from "react";
import "../styles/RSVPForm.css";
import scootin from "../assets/scootin.gif";
import submitted from "../assets/get-powerup.mp3";
import switchOn from "../assets/switch-on.mp3";
import switchOff from "../assets/switch-off.mp3";

const DB_URL = process.env.REACT_APP_FIREBASE_DB_URL;

const POLL_DATES = [
  "FRI 4/10",
  "SAT 4/11",
  "FRI 4/17",
  "SAT 4/18",
  "FRI 5/1",
  "SAT 5/2",
];

const normalizeName = (value) => value.trim().toLowerCase();
const nameToKey = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const RSVPForm = ({ className = "" }) => {
  const [name, setName] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const normalizedName = normalizeName(name);

  const existingSubmission = useMemo(
    () =>
      submissions.find(
        (submission) => normalizeName(submission.name) === normalizedName,
      ),
    [normalizedName, submissions],
  );

  const dateVotes = useMemo(() => {
    const baseVotes = POLL_DATES.reduce((acc, date) => {
      acc[date] = [];
      return acc;
    }, {});

    submissions.forEach((submission) => {
      submission.dates.forEach((date) => {
        baseVotes[date].push(submission.name);
      });
    });

    return baseVotes;
  }, [submissions]);

  const totalVotes = useMemo(
    () =>
      Object.values(dateVotes).reduce((sum, voters) => sum + voters.length, 0),
    [dateVotes],
  );

  const handleDateToggle = (date, isChecked) => {
    const toggleAudio = new Audio(isChecked ? switchOn : switchOff);

    toggleAudio.play().catch(() => {
      // Ignore playback failures due to browser autoplay policy.
    });

    setSelectedDates((current) => {
      if (isChecked) {
        return current.includes(date) ? current : [...current, date];
      }

      return current.filter((selectedDate) => selectedDate !== date);
    });
  };

  const handleTallyToggle = (event) => {
    const tallyAudio = new Audio(
      event.currentTarget.open ? switchOn : switchOff,
    );

    tallyAudio.play().catch(() => {
      // Ignore playback failures due to browser autoplay policy.
    });
  };

  const showStatus = (message) => {
    setStatusMessage(message);
    setErrorMessage("");
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 1700);
  };

  const loadAvailability = () => {
    if (!DB_URL) {
      setErrorMessage("Missing REACT_APP_FIREBASE_DB_URL in .env.");
      return;
    }

    fetch(`${DB_URL}/availability.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Load failed");
        }

        return response.json();
      })
      .then((data) => {
        if (!data) {
          setSubmissions([]);
          return;
        }

        const people = Object.values(data)
          .filter((entry) => entry?.name && Array.isArray(entry?.dates))
          .map((entry) => ({
            name: String(entry.name),
            dates: entry.dates.filter((date) =>
              POLL_DATES.includes(String(date)),
            ),
          }));

        setSubmissions(people);
      })
      .catch((requestError) => {
        console.error(requestError);
        setErrorMessage("Could not load RSVP data right now.");
      });
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleLoadPrevious = () => {
    if (!existingSubmission) {
      return;
    }

    setSelectedDates(existingSubmission.dates);
    showStatus("Loaded your previous RSVP picks.");
  };

  const handleClearPrevious = () => {
    if (!existingSubmission) {
      return;
    }

    if (!DB_URL) {
      setErrorMessage("Missing REACT_APP_FIREBASE_DB_URL in .env.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    fetch(`${DB_URL}/availability/${nameToKey(existingSubmission.name)}.json`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Clear failed");
        }

        setSelectedDates([]);
        showStatus("Your previous RSVP picks were cleared.");
        loadAvailability();
      })
      .catch((requestError) => {
        console.error(requestError);
        setErrorMessage("Could not clear your RSVP right now.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName || selectedDates.length === 0) {
      return;
    }

    if (!DB_URL) {
      setErrorMessage("Missing REACT_APP_FIREBASE_DB_URL in .env.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    fetch(`${DB_URL}/availability/${nameToKey(trimmedName)}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: existingSubmission?.name || trimmedName,
        dates: [...new Set(selectedDates)],
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Save failed");
        }

        const submittedAudio = new Audio(submitted);
        submittedAudio.play().catch(() => {
          // Ignore blocked autoplay; user interaction already happened in most cases.
        });

        setName("");
        setSelectedDates([]);
        showStatus("Your vote has been uploaded at 56k speed.");
        loadAvailability();
      })
      .catch((requestError) => {
        console.error(requestError);
        setErrorMessage("Could not save RSVP right now.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <section
      className={`rsvp-shell ${className}`.trim()}
      aria-label="RSVP voting board"
    >
      <div className="rsvp-window">
        <header className="rsvp-titlebar">
          <span className="rsvp-titlebar__dot" aria-hidden="true" />
          <h2 className="rsvp-titlebar__text">RSVP POLL</h2>
        </header>

        <div className="rsvp-marquee" aria-hidden="true">
          <span>* ENTER YOUR NAME AND PICK ALL DATES YOU CAN MAKE *</span>
        </div>

        <form className="rsvp-form" onSubmit={handleSubmit}>
          <label className="rsvp-field" htmlFor="rsvp-name">
            Your Name
          </label>
          <input
            id="rsvp-name"
            className="rsvp-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
          />

          {existingSubmission ? (
            <div className="rsvp-returning-tools">
              <p className="rsvp-returning-note">
                Previous RSVP found for {existingSubmission.name}.
              </p>
              <div className="rsvp-returning-actions">
                <button
                  type="button"
                  className="rsvp-small-btn"
                  onClick={handleLoadPrevious}
                  disabled={isSaving}
                >
                  Load My Picks
                </button>
                <button
                  type="button"
                  className="rsvp-small-btn rsvp-small-btn--danger"
                  onClick={handleClearPrevious}
                  disabled={isSaving}
                >
                  Clear My Picks
                </button>
              </div>
            </div>
          ) : null}

          <p className="rsvp-instruction">Select every day you can attend:</p>
          <div
            className="rsvp-options"
            role="group"
            aria-label="Available dates"
          >
            {POLL_DATES.map((date) => (
              <label
                key={date}
                className="rsvp-option"
                htmlFor={`date-${date}`}
              >
                <input
                  id={`date-${date}`}
                  type="checkbox"
                  checked={selectedDates.includes(date)}
                  onChange={(event) =>
                    handleDateToggle(date, event.target.checked)
                  }
                />
                <span>{date}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="rsvp-submit"
            disabled={!name.trim() || selectedDates.length === 0 || isSaving}
          >
            {isSaving ? "SAVING..." : "SUBMIT RSVP"}
          </button>

          {showSuccess ? (
            <p className="rsvp-success" role="status">
              {statusMessage}
            </p>
          ) : null}

          {errorMessage ? <p className="rsvp-error">{errorMessage}</p> : null}
        </form>

        <div className="rsvp-divider" aria-hidden="true">
          <img src={scootin} alt="" className="rsvp-divider__gif" />
        </div>

        <section className="vote-board" aria-live="polite">
          <div className="vote-board__header">
            <h3>Vote Tally</h3>
            <p>{totalVotes} total vote(s)</p>
          </div>

          <div className="vote-grid">
            {POLL_DATES.map((date) => {
              const voters = dateVotes[date];
              return (
                <article key={date} className="vote-card">
                  <div className="vote-card__top">
                    <strong>{date}</strong>
                    <span className="vote-badge">{voters.length} vote(s)</span>
                  </div>

                  <details className="vote-voters" onToggle={handleTallyToggle}>
                    <summary>
                      {voters.length > 0
                        ? `View voters (${voters.length})`
                        : "No voters yet"}
                    </summary>
                    {voters.length > 0 ? (
                      <ul>
                        {voters.map((voter, index) => (
                          <li key={`${date}-${voter}-${index}`}>{voter}</li>
                        ))}
                      </ul>
                    ) : null}
                  </details>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
};

export default RSVPForm;

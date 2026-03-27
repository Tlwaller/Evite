import React, { useEffect, useMemo, useState } from "react";
import "../styles/RSVPForm.css";

// Add REACT_APP_FIREBASE_DB_URL to your .env file.
// e.g. REACT_APP_FIREBASE_DB_URL=https://your-project-default-rtdb.firebaseio.com
const DB_URL = process.env.REACT_APP_FIREBASE_DB_URL;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const monthLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const displayDateLabel = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const getMonthDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingEmpty = firstDay.getDay();
  const days = [];

  for (let i = 0; i < leadingEmpty; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
};

const nameToKey = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const RSVPForm = () => {
  const [monthCursor, setMonthCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [nameInput, setNameInput] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [availabilityByPerson, setAvailabilityByPerson] = useState([]);
  const [error, setError] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const monthDays = useMemo(() => getMonthDays(monthCursor), [monthCursor]);

  const dateToPeople = useMemo(() => {
    const map = {};

    availabilityByPerson.forEach(({ name, dates }) => {
      dates.forEach((dateKey) => {
        if (!map[dateKey]) {
          map[dateKey] = [];
        }

        if (
          !map[dateKey].some(
            (item) => item.toLowerCase() === name.toLowerCase(),
          )
        ) {
          map[dateKey].push(name);
        }
      });
    });

    return map;
  }, [availabilityByPerson]);

  const activeDatePeople = activeDate ? dateToPeople[activeDate] || [] : [];

  const getAvailability = () => {
    fetch(`${DB_URL}/availability.json`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) {
          setAvailabilityByPerson([]);
          return;
        }
        const people = Object.values(data)
          .filter((entry) => entry?.name && Array.isArray(entry?.dates))
          .map((entry) => ({
            name: String(entry.name),
            dates: entry.dates.filter((d) => typeof d === "string"),
          }));
        setAvailabilityByPerson(people);
      })
      .catch((requestError) => {
        console.error(requestError);
        setError("Could not load availability right now.");
      });
  };

  useEffect(() => {
    getAvailability();
  }, []);

  const toggleDateSelection = (dateKey) => {
    setError("");
    setSelectedDates((currentDates) =>
      currentDates.includes(dateKey)
        ? currentDates.filter((value) => value !== dateKey)
        : [...currentDates, dateKey],
    );
    setActiveDate(dateKey);
  };

  const submitAvailability = (event) => {
    event.preventDefault();
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      setError("Please add your name before saving availability.");
      return;
    }

    if (selectedDates.length === 0) {
      setError("Select at least one date that works for you.");
      return;
    }

    const cleanedDates = [...new Set(selectedDates)].sort();
    const key = nameToKey(trimmedName);
    setIsSaving(true);

    fetch(`${DB_URL}/availability/${key}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, dates: cleanedDates }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        setNameInput("");
        setSelectedDates([]);
        setError("");
        setActiveDate(cleanedDates[0]);
        getAvailability();
      })
      .catch((requestError) => {
        console.error(requestError);
        setError("Could not save availability right now.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const clearSelections = () => {
    setSelectedDates([]);
    setError("");
  };

  return (
    <div className="rsvp-wrapper">
      <section className="rsvp-container schedule-container">
        <h2 className="schedule-title">WHEN R U FREE</h2>
        <p className="schedule-subtitle">
          Add your name n pick some days that work for you.
        </p>

        <form className="schedule-form" onSubmit={submitAvailability}>
          <input
            className="name-input"
            placeholder="Your name"
            value={nameInput}
            onChange={(event) => {
              setError("");
              setNameInput(event.target.value);
            }}
          />
          <button
            className="save-availability-btn"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save availability"}
          </button>
          <button
            className="clear-selection-btn"
            type="button"
            onClick={clearSelections}
          >
            Clear picked dates
          </button>
        </form>

        {error && <p className="error-txt">{error}</p>}

        <div className="calendar-controls">
          <button
            className="month-nav"
            type="button"
            onClick={() =>
              setMonthCursor(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
          >
            Previous
          </button>
          <h3 className="month-label">{monthLabel(monthCursor)}</h3>
          <button
            className="month-nav"
            type="button"
            onClick={() =>
              setMonthCursor(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
          >
            Next
          </button>
        </div>

        <div
          className="calendar-grid"
          role="grid"
          aria-label="Availability calendar"
        >
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="weekday-label">
              {label}
            </div>
          ))}
          {monthDays.map((date, index) => {
            if (!date) {
              return (
                <div key={`empty-${index}`} className="calendar-cell empty" />
              );
            }

            const dateKey = formatDateKey(date);
            const selectedByCurrentUser = selectedDates.includes(dateKey);
            const availablePeople = dateToPeople[dateKey] || [];

            return (
              <button
                key={dateKey}
                type="button"
                className={`calendar-cell day-cell ${
                  selectedByCurrentUser ? "picked" : ""
                }`}
                onClick={() => toggleDateSelection(dateKey)}
              >
                <span className="day-number">{date.getDate()}</span>
                <span className="availability-count">
                  {availablePeople.length} available
                </span>
                {availablePeople.length > 0 && (
                  <span className="availability-preview">
                    {availablePeople.slice(0, 2).join(", ")}
                    {availablePeople.length > 2
                      ? ` +${availablePeople.length - 2}`
                      : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="date-detail-panel">
          {activeDate ? (
            <>
              <h4>{displayDateLabel(activeDate)}</h4>
              <p>{activeDatePeople.length} people available</p>
              {activeDatePeople.length ? (
                <ul>
                  {activeDatePeople.map((person) => (
                    <li key={`${activeDate}-${person}`}>{person}</li>
                  ))}
                </ul>
              ) : (
                <p>No one has selected this date yet.</p>
              )}
            </>
          ) : (
            <p>Select a day to view everyone available on that date.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default RSVPForm;

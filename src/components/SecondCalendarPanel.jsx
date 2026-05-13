import { useEffect, useRef, useState } from "react";
import "../styles/seconddatepicker.css";

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function isSameDay(a, b) {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
  if (!date) return "Выберите дату";

  return date.toLocaleDateString("ru-RU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generateCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const arr = [];

  for (let i = 0; i < firstDay; i++) {
    arr.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    arr.push(new Date(year, month, d));
  }

  return arr;
}

function Calendar({ year, month, selected, onSelect, onPrev, onNext }) {
  const cells = generateCalendar(year, month);
  const today = startOfDay(new Date());

  return (
    <div className="cal-box">
      <div className="cal-header">
        <button className="cal-arrow" onClick={onPrev}>
          ‹
        </button>

        <span className="cal-title">
          {MONTHS[month]} {year}
        </span>

        <button className="cal-arrow" onClick={onNext}>
          ›
        </button>
      </div>

      <div className="cal-grid cal-weekdays">
        {DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((date, index) => {
          if (!date) return <span key={index}></span>;

          const current = startOfDay(date);
          const active = isSameDay(current, selected);
          const todayClass = isSameDay(current, today);
          const future = current > today;

          const classes = [
            "cal-date",
            active ? "active" : "",
            todayClass ? "today" : "",
            future ? "disabled" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={index}
              className={classes}
              disabled={future}
              onClick={() => !future && onSelect(current)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SecondCalendarPanel({ onChange, value }) {
  const now = new Date();
  const initialDate = value || now;

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [month, setMonth] = useState(initialDate.getMonth());
  const [year, setYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (value && !isSameDay(value, selectedDate)) {
      setSelectedDate(value);
      setMonth(value.getMonth());
      setYear(value.getFullYear());
    }
  }, [value]);

  const wrapperRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  function selectDate(date) {
    setSelectedDate(date);

    if (onChange) onChange(date);

    setTimeout(() => setOpen(false), 150);
  }

  function clearDate(e) {
    e.stopPropagation();

    setSelectedDate(null);

    if (onChange) onChange(null);
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  }

  return (
    <div className="cal-root" ref={wrapperRef}>
      <button
        className={`
                    cal-trigger
                    ${open ? "active" : ""}
                    ${selectedDate ? "selected" : ""}
                `}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <rect
            x="1"
            y="3"
            width="14"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M5 1v4M11 1v4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span>{formatDate(selectedDate)}</span>

        {selectedDate && (
          <span className="cal-clear" onClick={clearDate}>
            ×
          </span>
        )}
      </button>

      {open && (
        <div className="cal-popup">
          <Calendar
            year={year}
            month={month}
            selected={selectedDate}
            onSelect={selectDate}
            onPrev={prevMonth}
            onNext={nextMonth}
          />
        </div>
      )}
    </div>
  );
}

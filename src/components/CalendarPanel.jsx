import { useEffect, useRef, useState, useCallback } from "react";
import "../styles/datepicker.css";

// ==================== CONFIG ====================
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const formatDate = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// ==================== HELPERS ====================
const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
};

const isBetween = (date, start, end) => {
  if (!start || !end) return false;
  const [s, e] = start <= end ? [start, end] : [end, start];
  return date > s && date < e;
};

// ==================== CALENDAR BUILDER ====================
const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  // Bo'sh joylar
  for (let i = 0; i < firstDay; i++) cells.push(null);
  // Kunlar
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
};

// ==================== MAIN COMPONENT ====================
export default function DateRangePicker({ onChange, value }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const ref = useRef(null);

  // External value boshqarish
  useEffect(() => {
    if (value?.startDate) {
      setStartDate(parseDate(value.startDate));
      setViewYear(parseDate(value.startDate).getFullYear());
      setViewMonth(parseDate(value.startDate).getMonth());
    }
    if (value?.endDate) {
      setEndDate(parseDate(value.endDate));
    }
  }, [value]);

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSelecting(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDayClick = useCallback((date) => {
    if (!selecting) {
      setStartDate(date);
      setEndDate(null);
      setSelecting(true);
      setHoverDate(null);
    } else {
      const [s, e] = date >= startDate ? [startDate, date] : [date, startDate];
      setStartDate(s);
      setEndDate(e);
      setSelecting(false);
      
      onChange?.({
        startDate: formatDate(s),
        endDate: formatDate(e)
      });
      
      setTimeout(() => setOpen(false), 150);
    }
  }, [selecting, startDate, onChange]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const clearRange = (e) => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
    setSelecting(false);
    onChange?.({ startDate: null, endDate: null });
  };

  const today = startOfDay(new Date());
  const hasRange = !!startDate && !!endDate;

  const displayText = hasRange 
    ? `${formatDate(startDate)} — ${formatDate(endDate)}`
    : startDate 
      ? formatDate(startDate) 
      : "Выберите диапазон";

  return (
    <div className="dp-root" ref={ref}>
      <button
        className={`dp-trigger ${open ? "open" : ""} ${hasRange ? "has-range" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span>{displayText}</span>
        {hasRange && (
          <span className="dp-clear" onClick={clearRange} title="Очистить">×</span>
        )}
      </button>

      {open && (
        <div className="dp-dropdown">
          <div className="dp-calendar">
            {/* Calendar Header */}
            <div className="dp-nav">
              <button className="dp-nav__btn" onClick={prevMonth}>‹</button>
              <span className="dp-nav__label">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button className="dp-nav__btn" onClick={nextMonth}>›</button>
            </div>

            {/* Day Names */}
            <div className="dp-grid dp-daynames">
              {DAYS.map(day => <span key={day}>{day}</span>)}
            </div>

            {/* Days Grid */}
            <div className="dp-grid dp-days">
              {buildCalendar(viewYear, viewMonth).map((date, i) => {
                if (!date) return <span key={`empty-${i}`} className="empty" />;

                const d = startOfDay(date);
                const isStart = isSameDay(d, startDate);
                const isEnd = isSameDay(d, endDate);
                const inRange = isBetween(d, startDate, endDate || (selecting ? hoverDate : null));
                const isToday = isSameDay(d, today);
                const isFuture = d > today;

                return (
                  <button
                    key={i}
                    className={`dp-day 
                      ${isStart ? "start" : ""} 
                      ${isEnd ? "end" : ""} 
                      ${inRange ? "in-range" : ""} 
                      ${isToday ? "today" : ""} 
                      ${isFuture ? "future" : ""}
                    `.trim()}
                    onClick={() => !isFuture && handleDayClick(d)}
                    onMouseEnter={() => selecting && setHoverDate(d)}
                    disabled={isFuture}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <div className="dp-hint">
              {!startDate && "Выберите дату начала"}
              {startDate && selecting && "Выберите дату окончания"}
              {hasRange && `Выбрано ${Math.round((endDate - startDate) / 86400000) + 1} дней`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
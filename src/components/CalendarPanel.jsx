import { useState, useRef, useEffect } from 'react';
import '../styles/datepicker.css';


const MONTHS = [
    'Январь','Февраль','Март','Апрель','Май','Июнь',
    'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];
const DAYS = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

function isSameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth()    === b.getMonth()    &&
        a.getDate()     === b.getDate();
}

function isBetween(date, start, end) {
    if (!start || !end) return false;
    const [s, e] = start <= end ? [start, end] : [end, start];
    return date > s && date < e;
}

function startOfDay(d) {
    const c = new Date(d);
    c.setHours(0,0,0,0);
    return c;
}

function formatDisplay(start, end) {
    if (!start && !end) return 'Выберите период';
    const fmt = (d) => d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    if (start && !end) return fmt(start) + ' → ...';
    if (isSameDay(start, end)) return fmt(start);
    return fmt(start) + ' → ' + fmt(end);
}

function buildCalendar(year, month) {
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
    return cells;
}

function CalendarPanel({ viewYear, viewMonth, startDate, endDate, hoverDate, onDayClick, onHover, onPrevMonth, onNextMonth }) {
    const cells = buildCalendar(viewYear, viewMonth);
    const today = startOfDay(new Date());

    return (
        <div className="dp-panel">
            <div className="dp-nav">
                <button className="dp-nav__btn" onClick={onPrevMonth}>‹</button>
                <span className="dp-nav__label">
          {MONTHS[viewMonth]} {viewYear}
        </span>
                <button className="dp-nav__btn" onClick={onNextMonth}>›</button>
            </div>

            <div className="dp-grid dp-daynames">
                {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="dp-grid dp-days">
                {cells.map((date, i) => {
                    if (!date) return <span key={`e${i}`} />;

                    const d       = startOfDay(date);
                    const isStart = isSameDay(d, startDate);
                    const isEnd   = isSameDay(d, endDate);
                    const inRange = isBetween(d, startDate, endDate || hoverDate);
                    const isToday = isSameDay(d, today);
                    const isFuture= d > today;

                    const cls = [
                        'dp-day',
                        isStart  ? 'start'    : '',
                        isEnd    ? 'end'      : '',
                        inRange  ? 'in-range' : '',
                        isToday  ? 'today'    : '',
                        isFuture ? 'future'   : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <button
                            key={i}
                            className={cls}
                            onClick={() => !isFuture && onDayClick(d)}
                            onMouseEnter={() => onHover(d)}
                            disabled={isFuture}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function getPreset(key) {
    const today = startOfDay(new Date());
    const sub   = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };

    switch (key) {
        case 'today':    return { start: today,   end: today };
        case '7d':       return { start: sub(6),  end: today };
        case '30d':      return { start: sub(29), end: today };
        case 'thisMonth':{
            const s = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start: s, end: today };
        }
        case 'lastMonth':{
            const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const e = new Date(today.getFullYear(), today.getMonth(), 0);
            return { start: s, end: e };
        }
        default: return null;
    }
}

const PRESETS = [
    { key: 'today',     label: 'Сегодня' },
    { key: '7d',        label: 'Последние 7 дней' },
    { key: '30d',       label: 'Последние 30 дней' },
    { key: 'thisMonth', label: 'Этот месяц' },
    { key: 'lastMonth', label: 'Прошлый месяц' },
];

export default function DateRangePicker({ onChange }) {
    const today    = new Date();
    const [open, setOpen]           = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate]     = useState(null);
    const [hoverDate, setHoverDate] = useState(null);
    const [selecting, setSelecting] = useState(false);
    const [viewYear, setViewYear]   = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const ref = useRef(null);

    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function handleDayClick(date) {
        if (!selecting || !startDate) {
            setStartDate(date);
            setEndDate(null);
            setSelecting(true);
        } else {
            const [s, e] = date >= startDate ? [startDate, date] : [date, startDate];
            setStartDate(s);
            setEndDate(e);
            setSelecting(false);
            onChange && onChange({ startDate: s, endDate: e });
            setTimeout(() => setOpen(false), 160);
        }
    }

    function applyPreset(key) {
        const p = getPreset(key);
        if (!p) return;
        setStartDate(p.start);
        setEndDate(p.end);
        setSelecting(false);
        setViewYear(p.start.getFullYear());
        setViewMonth(p.start.getMonth());
        onChange && onChange({ startDate: p.start, endDate: p.end });
        setTimeout(() => setOpen(false), 160);
    }

    function clearRange() {
        setStartDate(null);
        setEndDate(null);
        setSelecting(false);
        onChange && onChange({ startDate: null, endDate: null });
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }
    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    const hasRange = startDate && endDate;

    const getDaysText = (count) => {
        const lastDigit = count % 10;
        const lastTwo = count % 100;
        if (lastTwo >= 11 && lastTwo <= 19) return `${count} дней`;
        if (lastDigit === 1) return `${count} день`;
        if (lastDigit >= 2 && lastDigit <= 4) return `${count} дня`;
        return `${count} дней`;
    };

    return (
        <div className="dp-root" ref={ref}>
            <button
                className={`dp-trigger ${open ? 'open' : ''} ${hasRange ? 'has-range' : ''}`}
                onClick={() => setOpen(v => !v)}
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span>{formatDisplay(startDate, endDate)}</span>
                {hasRange && (
                    <span
                        className="dp-clear"
                        onClick={(e) => { e.stopPropagation(); clearRange(); }}
                        title="Очистить"
                    >×</span>
                )}
            </button>
            {open && (
                <div className="dp-dropdown">
                    <div className="dp-calendar">
                        <CalendarPanel
                            viewYear={viewYear}
                            viewMonth={viewMonth}
                            startDate={startDate}
                            endDate={endDate}
                            hoverDate={selecting ? hoverDate : null}
                            onDayClick={handleDayClick}
                            onHover={setHoverDate}
                            onPrevMonth={prevMonth}
                            onNextMonth={nextMonth}
                        />

                        <div className="dp-hint">
                            {!startDate
                                ? 'Выберите дату начала'
                                : selecting
                                    ? 'Теперь выберите дату окончания'
                                    : hasRange
                                        ? `Выбрано: ${getDaysText(Math.round((endDate - startDate) / 86400000) + 1)}`
                                        : ''}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
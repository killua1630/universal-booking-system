import { useState, useMemo, useRef, useEffect } from 'react';

const MONTHS_BG = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември',
];

const WEEKDAYS_BG = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function formatDateISO(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export default function DatePickerCalendar({
  value,
  onChange,
  bookedDates = [],
  maxYear = 2026,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const todayISO = formatDateISO(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const initialYear = Math.min(today.getFullYear(), maxYear);
  const initialMonth = today.getFullYear() > maxYear ? 11 : today.getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const canGoPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const canGoNextMonth =
    viewYear < maxYear || (viewYear === maxYear && viewMonth < 11);

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = formatDateISO(viewYear, viewMonth, day);
      const isPast = iso < todayISO;
      const isBooked = bookedSet.has(iso);
      const isDisabled = isPast || isBooked;

      cells.push({
        type: 'day',
        key: iso,
        day,
        iso,
        isPast,
        isBooked,
        isDisabled,
        isSelected: value === iso,
      });
    }

    return cells;
  }, [viewYear, viewMonth, todayISO, bookedSet, value]);

  const handleSelectDay = (cell) => {
    if (cell.isDisabled) return;
    onChange(cell.iso);
    setIsOpen(false);
  };

  return (
    <div className="calendar-picker" ref={wrapperRef}>
      <button
        type="button"
        className="date-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>{value ? `Дата: ${value}` : 'Избери дата от календара'}</span>
        <span className="calendar-icon">📅</span>
      </button>

      <input
        type="text"
        name="date"
        value={value}
        onChange={() => {}}
        required
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only-input"
      />

      {isOpen && (
        <div className="calendar-dropdown" role="dialog" aria-label="Календар за резервации">
          <div className="calendar-header">
            <button
              type="button"
              className="cal-nav-btn"
              onClick={handlePrevMonth}
              disabled={!canGoPrevMonth}
              title="Предишен месец"
            >
              ‹
            </button>
            <div className="cal-month-label">
              {MONTHS_BG[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              className="cal-nav-btn"
              onClick={handleNextMonth}
              disabled={!canGoNextMonth}
              title="Следващ месец"
            >
              ›
            </button>
          </div>

          <div className="calendar-weekdays">
            {WEEKDAYS_BG.map((wd) => (
              <div key={wd} className="cal-weekday">
                {wd}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="cal-empty" />;
              }

              const classes = ['cal-day'];
              if (cell.isPast) classes.push('is-past');
              if (cell.isBooked) classes.push('is-booked');
              if (cell.isSelected) classes.push('is-selected');

              let titleText = `Избери ${cell.iso}`;
              if (cell.isPast) titleText = 'Минала дата (недостъпна)';
              else if (cell.isBooked) titleText = 'Вече заета дата';

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={classes.join(' ')}
                  disabled={cell.isDisabled}
                  onClick={() => handleSelectDay(cell)}
                  title={titleText}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span className="legend-item">
              <span className="legend-swatch swatch-past">Минали</span>
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-booked">Заети</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
import { memo } from 'react';

function TimeSlotPicker({ slots, selectedStart, onSelect }) {
  if (slots.length === 0) {
    return <p className="empty-state">Няма часове за тази дата.</p>;
  }

  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <button
          key={slot.startMin}
          type="button"
          className={`slot-btn${slot.startMin === selectedStart ? ' is-selected' : ''}`}
          disabled={!slot.available}
          onClick={() => onSelect(slot.startMin)}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}

export default memo(TimeSlotPicker);
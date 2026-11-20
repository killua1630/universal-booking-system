import DatePickerCalendar from './DatePickerCalendar';
export default function BookingForm({
  selectedService,
  clientInfo,
  isSubmitted,
  bookings = [],
  bookedDates = [],
  onInputChange,
  onDateSelect,
  onSubmit,
  onReset,
  onCancelBooking,
}) {
  return (
    <aside className="booking-panel">
      {!selectedService && (
        <div className="empty">
          <h2>Резервация</h2>
          <p>Изберете услуга от списъка вляво, за да запазите час.</p>
        </div>
      )}

      {selectedService && isSubmitted && (
        <div className="success">
          <h2>Успешна резервация!</h2>
          <p>
            Услуга: <strong>{selectedService.title}</strong> ({selectedService.price} лв.)
          </p>
          <p>Клиент: {clientInfo.name}</p>
          <p>Имейл: {clientInfo.email}</p>
          <p>Телефон: {clientInfo.phone}</p>
          <p>Дата: {clientInfo.date}</p>
          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={onReset}>
              Нова резервация
            </button>
          </div>
        </div>
      )}

      {selectedService && !isSubmitted && (
        <div>
          <h2>Запазване на час</h2>
          <p className="selected-badge">
            Избрано: <strong>{selectedService.title}</strong> — {selectedService.price} лв. ({selectedService.duration})
          </p>

          <form onSubmit={onSubmit} className="booking-form">
            <label>
              Вашето име
              <input
                type="text"
                name="name"
                placeholder="Иван Иванов"
                value={clientInfo.name}
                onChange={onInputChange}
                required
              />
            </label>

            <label>
              Имейл адрес
              <input
                type="email"
                name="email"
                placeholder="ivan@example.com"
                value={clientInfo.email}
                onChange={onInputChange}
                required
              />
            </label>

            <label>
              Телефонен номер
              <input
                type="tel"
                name="phone"
                placeholder="+359 88 123 4567"
                value={clientInfo.phone}
                onChange={onInputChange}
                required
              />
            </label>

            <div className="form-field-block">
              <span className="field-label-text">Дата на посещение (до края на 2026 г.)</span>
              <DatePickerCalendar
                value={clientInfo.date}
                onChange={onDateSelect}
                bookedDates={bookedDates}
                maxYear={2026}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Потвърди резервацията
              </button>
              <button type="button" className="btn-secondary" onClick={onReset}>
                Отказ
              </button>
            </div>
          </form>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="bookings-list">
          <h3>Потвърдени резервации ({bookings.length})</h3>
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id} className="booking-item">
                <div>
                  <strong>{booking.serviceTitle}</strong> — {booking.date}
                  <div className="booking-meta">
                    {booking.name} ({booking.email}) · Тел.: {booking.phone} · {booking.price} лв.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-cancel-booking"
                  onClick={() => onCancelBooking(booking.id)}
                >
                  Откажи резервацията
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
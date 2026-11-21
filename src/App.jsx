
import { useState } from 'react';
import { businessData } from './data/businessData';
import { initialReservations } from './data/reservations';
import { generateAvailableSlots } from './utils/availability';
import './App.css';

function App() {
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-11-23');
  const [selectedResource, setSelectedResource] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [reservations, setReservations] = useState(initialReservations);
  const [message, setMessage] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editResource, setEditResource] = useState('');
  const [editStartTime, setEditStartTime] = useState('');

  const currentBusiness = businessData[selectedBusiness];

  function handleBusinessChange(business) {
    setSelectedBusiness(business);
    setSelectedResource(
      String(businessData[business].resources[0].id)
    );
    setMessage('');
    setEditingId(null);
  }

  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.businessType === selectedBusiness &&
      reservation.date === selectedDate &&
      reservation.resourceId === Number(selectedResource) &&
      reservation.status === 'active'
  );

  const availableSlots =
    currentBusiness && selectedResource
      ? generateAvailableSlots(
          currentBusiness.workingHours,
          currentBusiness.slotDuration,
          filteredReservations
        )
      : [];

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function handleBooking(slot) {
    if (!customerName.trim()) {
      setMessage('Моля, въведете име на клиента.');
      return;
    }

    const hasConflict = filteredReservations.some((reservation) => {
      return (
        timeToMinutes(slot.startTime) <
          timeToMinutes(reservation.endTime) &&
        timeToMinutes(slot.endTime) >
          timeToMinutes(reservation.startTime)
      );
    });

    if (hasConflict) {
      setMessage('Този час вече е зает. Изберете друг час.');
      return;
    }

    const newReservation = {
      id: Date.now(),
      businessType: selectedBusiness,
      resourceId: Number(selectedResource),
      date: selectedDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      customerName: customerName.trim(),
      status: 'active',
    };

    setReservations((previous) => [
      ...previous,
      newReservation,
    ]);

    setCustomerName('');
    setMessage('Резервацията е създадена успешно!');
  }

  function handleCancel(reservationId) {
    setReservations((previous) =>
      previous.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: 'cancelled' }
          : reservation
      )
    );

    if (editingId === reservationId) {
      setEditingId(null);
    }

    setMessage('Резервацията е отказана успешно!');
  }

  function handleEdit(reservation) {
    setEditingId(reservation.id);
    setEditName(reservation.customerName);
    setEditDate(reservation.date);
    setEditResource(String(reservation.resourceId));
    setEditStartTime(reservation.startTime);
    setMessage('');
  }

  const editingReservations = reservations.filter(
    (reservation) =>
      reservation.id !== editingId &&
      reservation.businessType === selectedBusiness &&
      reservation.date === editDate &&
      reservation.resourceId === Number(editResource) &&
      reservation.status === 'active'
  );

  const editingSlots =
    currentBusiness && editDate && editResource
      ? generateAvailableSlots(
          currentBusiness.workingHours,
          currentBusiness.slotDuration,
          editingReservations
        )
      : [];

  function handleSaveEdit() {
    if (!editName.trim()) {
      setMessage('Моля, въведете име на клиента.');
      return;
    }

    const selectedSlot = editingSlots.find(
      (slot) =>
        slot.startTime === editStartTime &&
        slot.available
    );

    if (!selectedSlot) {
      setMessage('Изберете свободен час за резервацията.');
      return;
    }

    setReservations((previous) =>
      previous.map((reservation) =>
        reservation.id === editingId
          ? {
              ...reservation,
              customerName: editName.trim(),
              date: editDate,
              resourceId: Number(editResource),
              startTime: selectedSlot.startTime,
              endTime: selectedSlot.endTime,
            }
          : reservation
      )
    );

    // Обновяваме главния екран с новите дата и ресурс.
    setSelectedDate(editDate);
    setSelectedResource(editResource);

    setEditingId(null);
    setMessage('Резервацията е променена успешно!');
  }

  return (
    <div className="app">
      <header>
        <h1>Универсална система за резервации</h1>
        <p>Изберете тип бизнес</p>
      </header>

      <main>
        <div className="business-options">
          <button onClick={() => handleBusinessChange('medical')}>
            Медицински кабинет
          </button>

          <button onClick={() => handleBusinessChange('salon')}>
            Фризьорски салон
          </button>

          <button onClick={() => handleBusinessChange('hall')}>
            Зала под наем
          </button>
        </div>

        {currentBusiness && (
          <div className="selected-business">
            <h2>{currentBusiness.name}</h2>

            <p>
              Работно време: {currentBusiness.workingHours.start} -{' '}
              {currentBusiness.workingHours.end}
            </p>

            <p>
              Продължителност на резервацията:{' '}
              {currentBusiness.slotDuration} минути
            </p>

            <h3>Изберете дата:</h3>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <h3>Изберете ресурс:</h3>

            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
            >
              {currentBusiness.resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>

            <h3>Име на клиента:</h3>

            <input
              type="text"
              placeholder="Въведете име"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <h3>Свободни часове:</h3>

            <div className="slots-list">
              {availableSlots.map((slot) => (
                <div
                  key={slot.startTime}
                  className={`slot ${
                    slot.available ? 'available' : 'occupied'
                  }`}
                >
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>

                  {slot.available ? (
                    <button onClick={() => handleBooking(slot)}>
                      Резервирай
                    </button>
                  ) : (
                    <strong>Заето</strong>
                  )}
                </div>
              ))}
            </div>

            {message && (
              <p className="booking-message">{message}</p>
            )}

            <h3>Съществуващи резервации:</h3>

            {filteredReservations.length > 0 ? (
              <ul>
                {filteredReservations.map((reservation) => (
                  <li key={reservation.id}>
                    {reservation.customerName} -{' '}
                    {reservation.startTime} до {reservation.endTime}

                    <button
                      className="edit-button"
                      onClick={() => handleEdit(reservation)}
                    >
                      Редактирай
                    </button>

                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(reservation.id)}
                    >
                      Откажи
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Няма направени резервации за избраните критерии.
              </p>
            )}

            {editingId !== null && (
              <div className="edit-form">
                <h3>Редактиране на резервация</h3>

                <label>Име на клиента:</label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />

                <label>Дата:</label>

                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => {
                    setEditDate(e.target.value);
                    setEditStartTime('');
                  }}
                />

                <label>Ресурс:</label>

                <select
                  value={editResource}
                  onChange={(e) => {
                    setEditResource(e.target.value);
                    setEditStartTime('');
                  }}
                >
                  {currentBusiness.resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>

                <label>Свободен час:</label>

                <select
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                >
                  <option value="">Изберете час</option>

                  {editingSlots
                    .filter((slot) => slot.available)
                    .map((slot) => (
                      <option key={slot.startTime} value={slot.startTime}>
                        {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                </select>

                <div className="edit-actions">
                  <button onClick={handleSaveEdit}>
                    Запази промените
                  </button>

                  <button
                    className="cancel-edit-button"
                    onClick={() => setEditingId(null)}
                  >
                    Отказ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

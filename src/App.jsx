
import { useState } from 'react';
import { businessData } from './data/businessData';
import { initialReservations } from './data/reservations';
import { generateAvailableSlots } from './utils/availability';
import './App.css';

function App() {
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-11-23');
  const [selectedResource, setSelectedResource] = useState('');

  const currentBusiness = businessData[selectedBusiness];

  function handleBusinessChange(business) {
    setSelectedBusiness(business);
    setSelectedResource(String(businessData[business].resources[0].id));
  }

  const filteredReservations = initialReservations.filter(
    (reservation) =>
      reservation.businessType === selectedBusiness &&
      reservation.date === selectedDate &&
      reservation.resourceId === Number(selectedResource) &&
      reservation.status === 'active'
  );

  const availableSlots = currentBusiness && selectedResource
    ? generateAvailableSlots(
        currentBusiness.workingHours,
        currentBusiness.slotDuration,
        filteredReservations
      )
    : [];

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

            <h3>Свободни часове:</h3>

            <div className="slots-list">
              {availableSlots.map((slot) => (
                <div
                  key={slot.startTime}
                  className={`slot ${slot.available ? 'available' : 'occupied'}`}
                >
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>

                  <strong>
                    {slot.available ? 'Свободно' : 'Заето'}
                  </strong>
                </div>
              ))}
            </div>

            <h3>Съществуващи резервации:</h3>

            {filteredReservations.length > 0 ? (
              <ul>
                {filteredReservations.map((reservation) => (
                  <li key={reservation.id}>
                    {reservation.customerName} -{' '}
                    {reservation.startTime} до {reservation.endTime}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Няма направени резервации за избраните критерии.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

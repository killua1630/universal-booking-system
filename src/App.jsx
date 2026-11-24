import { useState, useMemo, useEffect } from 'react';
import { businessData } from './data/businessData';
import { initialReservations } from './data/reservations';
import { generateAvailableSlots } from './utils/availability';
import BusinessSettings from './BusinessSettings';
import BusinessOverview from './BusinessOverview';
import './App.css';

function getTodayLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isSlotInPast(date, startTime) {
  const today = getTodayLocalDate();

  if (date < today) return true;
  if (date > today) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [hours, minutes] = startTime.split(':').map(Number);

  return hours * 60 + minutes <= currentMinutes;
}

function App() {
  const [selectedBusiness, setSelectedBusiness] = useState('');

  // Зареждане и запазване на избраната тема
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('booking-system-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('booking-system-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((previousTheme) =>
      previousTheme === 'light' ? 'dark' : 'light'
    );
  }

  const [selectedDate, setSelectedDate] = useState('2026-11-23');
  const [selectedResource, setSelectedResource] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [participantCount, setParticipantCount] = useState('1');

  const [businessConfig, setBusinessConfig] = useState(() => {
    try {
      const savedConfig = localStorage.getItem(
        'booking-system-business-config'
      );

      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);

        if (
          parsedConfig &&
          parsedConfig.medical &&
          parsedConfig.salon &&
          parsedConfig.hall
        ) {
          return parsedConfig;
        }
      }
    } catch (error) {
      console.error('Грешка при зареждане на конфигурациите:', error);
    }

    return businessData;
  });

  const [reservations, setReservations] = useState(() => {
    try {
      const savedReservations = localStorage.getItem(
        'booking-system-reservations'
      );

      if (savedReservations !== null) {
        const parsedReservations = JSON.parse(savedReservations);

        if (Array.isArray(parsedReservations)) {
          return parsedReservations;
        }
      }
    } catch (error) {
      console.error('Грешка при зареждане на резервациите:', error);
    }

    return initialReservations;
  });

  const [message, setMessage] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editResource, setEditResource] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editParticipantCount, setEditParticipantCount] = useState('1');

  // Запазване на резервациите
  useEffect(() => {
    try {
      localStorage.setItem(
        'booking-system-reservations',
        JSON.stringify(reservations)
      );
    } catch (error) {
      console.error('Грешка при запазване на резервациите:', error);
    }
  }, [reservations]);

  // Запазване на бизнес конфигурациите
  useEffect(() => {
    try {
      localStorage.setItem(
        'booking-system-business-config',
        JSON.stringify(businessConfig)
      );
    } catch (error) {
      console.error('Грешка при запазване на конфигурациите:', error);
    }
  }, [businessConfig]);

  const currentBusiness = businessConfig[selectedBusiness];

  const currentResource = currentBusiness?.resources.find(
    (resource) => resource.id === Number(selectedResource)
  );

  const currentCapacity = currentResource?.capacity ?? 1;

  const editingResource = currentBusiness?.resources.find(
    (resource) => resource.id === Number(editResource)
  );

  const editingCapacity = editingResource?.capacity ?? 1;

  // Ако избраният ресурс бъде премахнат, избира първия наличен ресурс
  useEffect(() => {
    if (!currentBusiness) return;

    const resourceStillExists = currentBusiness.resources.some(
      (resource) => resource.id === Number(selectedResource)
    );

    if (!resourceStillExists && currentBusiness.resources.length > 0) {
      setSelectedResource(String(currentBusiness.resources[0].id));
    }
  }, [currentBusiness, selectedResource]);

  function handleBusinessChange(business) {
    setSelectedBusiness(business);
    setSelectedResource(
      String(businessConfig[business].resources[0].id)
    );
    setParticipantCount('1');
    setMessage('');
    setEditingId(null);
  }

  function handleUpdateBusiness(updatedBusiness) {
    setBusinessConfig((previous) => ({
      ...previous,
      [selectedBusiness]: updatedBusiness,
    }));

    setMessage('');
  }

  const filteredReservations = useMemo(() => {
    return reservations.filter(
      (reservation) =>
        reservation.businessType === selectedBusiness &&
        reservation.date === selectedDate &&
        reservation.resourceId === Number(selectedResource) &&
        reservation.status === 'active'
    );
  }, [
    reservations,
    selectedBusiness,
    selectedDate,
    selectedResource,
  ]);

  const availableSlots = useMemo(() => {
    if (!currentBusiness || !selectedResource) {
      return [];
    }

    return generateAvailableSlots(
      currentBusiness.workingHours,
      currentBusiness.slotDuration,
      filteredReservations
    );
  }, [
    currentBusiness,
    selectedResource,
    filteredReservations,
  ]);

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function handleBooking(slot) {
    const numberOfParticipants = Number(participantCount);

    if (!customerName.trim()) {
      setMessage('Моля, въведете име на клиента.');
      return;
    }

    if (
      !Number.isInteger(numberOfParticipants) ||
      numberOfParticipants < 1
    ) {
      setMessage('Броят участници трябва да бъде поне 1.');
      return;
    }

    if (numberOfParticipants > currentCapacity) {
      setMessage(
        `Капацитетът на този ресурс е ${currentCapacity} участник(а).`
      );
      return;
    }

    if (selectedDate < getTodayLocalDate()) {
      setMessage('Не можете да резервирате за минала дата.');
      return;
    }

    if (isSlotInPast(selectedDate, slot.startTime)) {
      setMessage('Не можете да резервирате час, който вече е минал.');
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
      participantCount: numberOfParticipants,
      status: 'active',
    };

    setReservations((previous) => [...previous, newReservation]);
    setCustomerName('');
    setParticipantCount('1');
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
    setEditParticipantCount(
      String(reservation.participantCount ?? 1)
    );
    setMessage('');
  }

  const editingReservations = useMemo(() => {
    return reservations.filter(
      (reservation) =>
        reservation.id !== editingId &&
        reservation.businessType === selectedBusiness &&
        reservation.date === editDate &&
        reservation.resourceId === Number(editResource) &&
        reservation.status === 'active'
    );
  }, [
    reservations,
    editingId,
    selectedBusiness,
    editDate,
    editResource,
  ]);

  const editingSlots = useMemo(() => {
    if (!currentBusiness || !editDate || !editResource) {
      return [];
    }

    return generateAvailableSlots(
      currentBusiness.workingHours,
      currentBusiness.slotDuration,
      editingReservations
    );
  }, [
    currentBusiness,
    editDate,
    editResource,
    editingReservations,
  ]);

  function handleSaveEdit() {
    const numberOfParticipants = Number(editParticipantCount);

    if (!editName.trim()) {
      setMessage('Моля, въведете име на клиента.');
      return;
    }

    if (
      !Number.isInteger(numberOfParticipants) ||
      numberOfParticipants < 1
    ) {
      setMessage('Броят участници трябва да бъде поне 1.');
      return;
    }

    if (numberOfParticipants > editingCapacity) {
      setMessage(
        `Капацитетът на този ресурс е ${editingCapacity} участник(а).`
      );
      return;
    }

    if (editDate < getTodayLocalDate()) {
      setMessage('Не можете да преместите резервация на минала дата.');
      return;
    }

    const selectedSlot = editingSlots.find(
      (slot) => slot.startTime === editStartTime && slot.available
    );

    if (!selectedSlot) {
      setMessage('Изберете свободен час за резервацията.');
      return;
    }

    if (isSlotInPast(editDate, selectedSlot.startTime)) {
      setMessage('Не можете да изберете час, който вече е минал.');
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
              participantCount: numberOfParticipants,
            }
          : reservation
      )
    );

    setSelectedDate(editDate);
    setSelectedResource(editResource);
    setEditingId(null);
    setMessage('Резервацията е променена успешно!');
  }

  return (
    <div className={`app theme-${theme}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Тъмна тема' : '☀️ Светла тема'}
      </button>

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

            <BusinessSettings
              key={selectedBusiness}
              businessKey={selectedBusiness}
              business={currentBusiness}
              reservations={reservations}
              onUpdate={handleUpdateBusiness}
            />

            <BusinessOverview
              businessKey={selectedBusiness}
              business={currentBusiness}
              reservations={reservations}
              date={selectedDate}
            />

            <h3>Изберете дата:</h3>

            <input
              type="date"
              min={getTodayLocalDate()}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />

            <h3>Изберете ресурс:</h3>

            <select
              value={selectedResource}
              onChange={(event) => {
                setSelectedResource(event.target.value);
                setParticipantCount('1');
              }}
            >
              {currentBusiness.resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>

            <p>
              Капацитет на избрания ресурс:{' '}
              <strong>{currentCapacity}</strong>
              {currentCapacity === 1 ? ' клиент' : ' души'}
            </p>

            <h3>Име на клиента:</h3>

            <input
              type="text"
              placeholder="Въведете име"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />

            <h3>Брой участници:</h3>

            <input
              type="number"
              min="1"
              max={currentCapacity}
              value={participantCount}
              onChange={(event) =>
                setParticipantCount(event.target.value)
              }
            />

            <p>Максимален брой участници: {currentCapacity}</p>

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

                  {slot.available &&
                  !isSlotInPast(selectedDate, slot.startTime) ? (
                    <button onClick={() => handleBooking(slot)}>
                      Резервирай
                    </button>
                  ) : (
                    <strong>
                      {slot.available ? 'Минал час' : 'Заето'}
                    </strong>
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
                    {' '}({reservation.participantCount ?? 1}{' '}
                    {(reservation.participantCount ?? 1) === 1
                      ? 'участник'
                      : 'участници'})

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
                  onChange={(event) => setEditName(event.target.value)}
                />

                <label>Дата:</label>

                <input
                  type="date"
                  min={getTodayLocalDate()}
                  value={editDate}
                  onChange={(event) => {
                    setEditDate(event.target.value);
                    setEditStartTime('');
                  }}
                />

                <label>Ресурс:</label>

                <select
                  value={editResource}
                  onChange={(event) => {
                    setEditResource(event.target.value);
                    setEditStartTime('');
                  }}
                >
                  {currentBusiness.resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>

                <p>
                  Капацитет на избрания ресурс:{' '}
                  <strong>{editingCapacity}</strong>
                  {editingCapacity === 1 ? ' клиент' : ' души'}
                </p>

                <label>Брой участници:</label>

                <input
                  type="number"
                  min="1"
                  max={editingCapacity}
                  value={editParticipantCount}
                  onChange={(event) =>
                    setEditParticipantCount(event.target.value)
                  }
                />

                <label>Свободен час:</label>

                <select
                  value={editStartTime}
                  onChange={(event) =>
                    setEditStartTime(event.target.value)
                  }
                >
                  <option value="">Изберете час</option>

                  {editingSlots
                    .filter(
                      (slot) =>
                        slot.available &&
                        !isSlotInPast(editDate, slot.startTime)
                    )
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
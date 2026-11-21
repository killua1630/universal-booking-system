import { useState } from 'react';
function BusinessSettings({ businessKey, business, reservations, onUpdate }) {
  const [resourceName, setResourceName] = useState('');
  const [resourceCapacity, setResourceCapacity] = useState('1');

  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editResourceName, setEditResourceName] = useState('');
  const [editResourceCapacity, setEditResourceCapacity] = useState('1');

  const [workingStart, setWorkingStart] = useState(business.workingHours.start);
  const [workingEnd, setWorkingEnd] = useState(business.workingHours.end);
  const [slotDuration, setSlotDuration] = useState(String(business.slotDuration));

  const [settingsMessage, setSettingsMessage] = useState('');

  const activeReservations = reservations.filter(
    (reservation) =>
      reservation.businessType === businessKey &&
      reservation.status === 'active'
  );

  function updateBusiness(changes) {
    onUpdate({
      ...business,
      ...changes,
    });
  }

  function handleAddResource(event) {
    event.preventDefault();

    const capacity = Number(resourceCapacity);

    if (!resourceName.trim()) {
      setSettingsMessage('Въведете име на ресурса.');
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      setSettingsMessage('Капацитетът трябва да бъде цяло число поне 1.');
      return;
    }

    const nextId =
      business.resources.length > 0
        ? Math.max(...business.resources.map((resource) => resource.id)) + 1
        : 1;

    updateBusiness({
      resources: [
        ...business.resources,
        {
          id: nextId,
          name: resourceName.trim(),
          capacity,
        },
      ],
    });

    setResourceName('');
    setResourceCapacity('1');
    setSettingsMessage('Ресурсът е добавен успешно!');
  }

  function handleStartEdit(resource) {
    setEditingResourceId(resource.id);
    setEditResourceName(resource.name);
    setEditResourceCapacity(String(resource.capacity ?? 1));
    setSettingsMessage('');
  }

  function handleSaveResourceEdit(resourceId) {
    const capacity = Number(editResourceCapacity);

    if (!editResourceName.trim()) {
      setSettingsMessage('Името на ресурса не може да бъде празно.');
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      setSettingsMessage('Капацитетът трябва да бъде цяло число поне 1.');
      return;
    }

    const largestExistingBooking = activeReservations
      .filter((reservation) => reservation.resourceId === resourceId)
      .reduce(
        (largest, reservation) =>
          Math.max(largest, reservation.participantCount ?? 1),
        0
      );

    if (capacity < largestExistingBooking) {
      setSettingsMessage(
        `Има активна резервация за ${largestExistingBooking} участници. Не можете да зададете по-малък капацитет.`
      );
      return;
    }

    updateBusiness({
      resources: business.resources.map((resource) =>
        resource.id === resourceId
          ? {
              ...resource,
              name: editResourceName.trim(),
              capacity,
            }
          : resource
      ),
    });

    setEditingResourceId(null);
    setSettingsMessage('Ресурсът е редактиран успешно!');
  }

  function handleDeleteResource(resourceId) {
    const hasReservations = activeReservations.some(
      (reservation) => reservation.resourceId === resourceId
    );

    if (hasReservations) {
      setSettingsMessage(
        'Не можете да изтриете ресурс с активни резервации.'
      );
      return;
    }

    if (business.resources.length <= 1) {
      setSettingsMessage('Всеки бизнес трябва да има поне един ресурс.');
      return;
    }

    updateBusiness({
      resources: business.resources.filter(
        (resource) => resource.id !== resourceId
      ),
    });

    if (editingResourceId === resourceId) {
      setEditingResourceId(null);
    }

    setSettingsMessage('Ресурсът е премахнат успешно!');
  }

  function handleSaveSchedule(event) {
    event.preventDefault();

    const [startHour, startMinute] = workingStart.split(':').map(Number);
    const [endHour, endMinute] = workingEnd.split(':').map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    const duration = Number(slotDuration);

    if (startTotal >= endTotal) {
      setSettingsMessage(
        'Краят на работното време трябва да е след началото.'
      );
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 480
    ) {
      setSettingsMessage(
        'Продължителността трябва да е цяло число между 1 и 480 минути.'
      );
      return;
    }

    const hasReservationOutsideHours = activeReservations.some(
      (reservation) => {
        const [reservationStartHour, reservationStartMinute] =
          reservation.startTime.split(':').map(Number);

        const [reservationEndHour, reservationEndMinute] =
          reservation.endTime.split(':').map(Number);

        const reservationStart =
          reservationStartHour * 60 + reservationStartMinute;

        const reservationEnd =
          reservationEndHour * 60 + reservationEndMinute;

        return (
          reservationStart < startTotal ||
          reservationEnd > endTotal
        );
      }
    );

    if (hasReservationOutsideHours) {
      setSettingsMessage(
        'Не можете да промените работното време така, че активна резервация да остане извън него.'
      );
      return;
    }

    updateBusiness({
      workingHours: {
        start: workingStart,
        end: workingEnd,
      },
      slotDuration: duration,
    });

    setSettingsMessage('Работното време и слотовете са обновени!');
  }

  return (
    <section className="business-settings">
      <h3>Управление на бизнес конфигурацията</h3>

      <h4>Ресурси</h4>

      {business.resources.map((resource) => (
        <div className="resource-settings-item" key={resource.id}>
          {editingResourceId === resource.id ? (
            <div className="resource-edit-fields">
              <label>
                Име на ресурса:
                <input
                  value={editResourceName}
                  onChange={(event) =>
                    setEditResourceName(event.target.value)
                  }
                />
              </label>

              <label>
                Капацитет:
                <input
                  type="number"
                  min="1"
                  value={editResourceCapacity}
                  onChange={(event) =>
                    setEditResourceCapacity(event.target.value)
                  }
                />
              </label>

              <button
                type="button"
                onClick={() => handleSaveResourceEdit(resource.id)}
              >
                Запази
              </button>

              <button
                type="button"
                className="settings-secondary-button"
                onClick={() => setEditingResourceId(null)}
              >
                Отказ
              </button>
            </div>
          ) : (
            <div className="resource-settings-row">
              <span>
                <strong>{resource.name}</strong>
                {' – капацитет: '}
                {resource.capacity ?? 1}
              </span>

              <div>
                <button
                  type="button"
                  onClick={() => handleStartEdit(resource)}
                >
                  Редактирай
                </button>

                <button
                  type="button"
                  className="settings-delete-button"
                  onClick={() => handleDeleteResource(resource.id)}
                >
                  Изтрий
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <h4>Добавяне на ресурс</h4>

      <form onSubmit={handleAddResource} className="settings-form">
        <label>
          Име на новия ресурс:
          <input
            value={resourceName}
            onChange={(event) => setResourceName(event.target.value)}
            placeholder="Например: Зала 4"
          />
        </label>

        <label>
          Капацитет:
          <input
            type="number"
            min="1"
            value={resourceCapacity}
            onChange={(event) =>
              setResourceCapacity(event.target.value)
            }
          />
        </label>

        <button type="submit">Добави ресурс</button>
      </form>

      <h4>Работно време и продължителност</h4>

      <form onSubmit={handleSaveSchedule} className="settings-form">
        <label>
          Начало на работното време:
          <input
            type="time"
            value={workingStart}
            onChange={(event) => setWorkingStart(event.target.value)}
            required
          />
        </label>

        <label>
          Край на работното време:
          <input
            type="time"
            value={workingEnd}
            onChange={(event) => setWorkingEnd(event.target.value)}
            required
          />
        </label>

        <label>
          Продължителност на слота в минути:
          <input
            type="number"
            min="1"
            max="480"
            value={slotDuration}
            onChange={(event) => setSlotDuration(event.target.value)}
            required
          />
        </label>

        <button type="submit">Запази настройките</button>
      </form>

      {settingsMessage && (
        <p className="settings-message">{settingsMessage}</p>
      )}
    </section>
  );
}

export default BusinessSettings;

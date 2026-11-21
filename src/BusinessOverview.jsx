
import { useMemo } from 'react';
import { generateAvailableSlots } from './utils/availability';

function isPastSlot(date, startTime) {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const today = `${year}-${month}-${day}`;

  if (date < today) return true;
  if (date > today) return false;

  const [hours, minutes] = startTime.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return hours * 60 + minutes <= currentMinutes;
}

function BusinessOverview({ businessKey, business, reservations, date }) {
  const overview = useMemo(() => {
    const activeReservations = reservations.filter(
      (reservation) =>
        reservation.businessType === businessKey &&
        reservation.date === date &&
        reservation.status === 'active'
    );

    const resourceStatistics = business.resources.map((resource) => {
      const resourceReservations = activeReservations.filter(
        (reservation) => reservation.resourceId === resource.id
      );

      const slots = generateAvailableSlots(
        business.workingHours,
        business.slotDuration,
        resourceReservations
      );

      const occupiedSlots = slots.filter((slot) =>
        resourceReservations.some(
          (reservation) =>
            reservation.startTime < slot.endTime &&
            reservation.endTime > slot.startTime
        )
      ).length;

      const pastUnoccupiedSlots = slots.filter(
        (slot) =>
          isPastSlot(date, slot.startTime) &&
          !resourceReservations.some(
            (reservation) =>
              reservation.startTime < slot.endTime &&
              reservation.endTime > slot.startTime
          )
      ).length;

      const availableSlots = Math.max(
        0,
        slots.length - occupiedSlots - pastUnoccupiedSlots
      );

      const participants = resourceReservations.reduce(
        (total, reservation) =>
          total + (Number(reservation.participantCount) || 1),
        0
      );

      const capacity = resource.capacity ?? 1;

      const reservedCapacity = resourceReservations.reduce(
        (total) => total + capacity,
        0
      );

      return {
        id: resource.id,
        name: resource.name,
        capacity,
        reservations: resourceReservations.length,
        participants,
        occupiedSlots,
        availableSlots,
        totalSlots: slots.length,
        reservedCapacity,
      };
    });

    const totalReservations = activeReservations.length;

    const totalParticipants = activeReservations.reduce(
      (total, reservation) =>
        total + (Number(reservation.participantCount) || 1),
      0
    );

    const totalOccupiedSlots = resourceStatistics.reduce(
      (total, resource) => total + resource.occupiedSlots,
      0
    );

    const totalAvailableSlots = resourceStatistics.reduce(
      (total, resource) => total + resource.availableSlots,
      0
    );

    const totalSlots = resourceStatistics.reduce(
      (total, resource) => total + resource.totalSlots,
      0
    );

    const totalReservedCapacity = resourceStatistics.reduce(
      (total, resource) => total + resource.reservedCapacity,
      0
    );

    const capacityUsage =
      totalReservedCapacity > 0
        ? Math.round(
            (totalParticipants / totalReservedCapacity) * 100
          )
        : 0;

    return {
      totalReservations,
      totalParticipants,
      totalOccupiedSlots,
      totalAvailableSlots,
      totalSlots,
      capacityUsage,
      resourceStatistics,
    };
  }, [businessKey, business, reservations, date]);

  return (
    <section className="business-overview">
      <h3>Статистика и заетост</h3>

      <p className="overview-date">
        Обобщение за дата: <strong>{date}</strong>
      </p>

      <div className="overview-cards">
        <div className="overview-card">
          <span>Активни резервации</span>
          <strong>{overview.totalReservations}</strong>
        </div>

        <div className="overview-card">
          <span>Общо участници</span>
          <strong>{overview.totalParticipants}</strong>
        </div>

        <div className="overview-card">
          <span>Заети часове</span>
          <strong>{overview.totalOccupiedSlots}</strong>
        </div>

        <div className="overview-card">
          <span>Свободни часове</span>
          <strong>{overview.totalAvailableSlots}</strong>
        </div>
      </div>

      <div className="overview-total">
        <p>
          Общо времеви слотове:{' '}
          <strong>{overview.totalSlots}</strong>
        </p>

        <p>
          Използване на капацитета при активните резервации:{' '}
          <strong>{overview.capacityUsage}%</strong>
        </p>
      </div>

      <h4>Заетост по ресурси</h4>

      <div className="resource-statistics">
        {overview.resourceStatistics.map((resource) => (
          <div
            className="resource-statistics-card"
            key={resource.id}
          >
            <h5>{resource.name}</h5>

            <p>
              Активни резервации:{' '}
              <strong>{resource.reservations}</strong>
            </p>

            <p>
              Участници: <strong>{resource.participants}</strong>
            </p>

            <p>
              Капацитет на ресурса:{' '}
              <strong>{resource.capacity}</strong>
            </p>

            <p>
              Заети часове:{' '}
              <strong>{resource.occupiedSlots}</strong>
            </p>

            <p>
              Свободни часове:{' '}
              <strong>{resource.availableSlots}</strong>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BusinessOverview;

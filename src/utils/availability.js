
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return (
    String(hours).padStart(2, '0') +
    ':' +
    String(remainingMinutes).padStart(2, '0')
  );
}

export function generateAvailableSlots(
  workingHours,
  slotDuration,
  reservations
) {
  const startMinutes = timeToMinutes(workingHours.start);
  const endMinutes = timeToMinutes(workingHours.end);

  // Преобразуваме резервациите в числови интервали само веднъж.
  const sortedReservations = reservations
    .map((reservation) => ({
      start: timeToMinutes(reservation.startTime),
      end: timeToMinutes(reservation.endTime),
    }))
    .sort((a, b) => a.start - b.start);

  const slots = [];
  let reservationIndex = 0;

  for (
    let start = startMinutes;
    start + slotDuration <= endMinutes;
    start += slotDuration
  ) {
    const end = start + slotDuration;

    // Пропускаме резервациите, които вече са приключили.
    while (
      reservationIndex < sortedReservations.length &&
      sortedReservations[reservationIndex].end <= start
    ) {
      reservationIndex++;
    }

    // Проверяваме дали следващата резервация се припокрива.
    const nextReservation = sortedReservations[reservationIndex];

    const isAvailable =
      !nextReservation || nextReservation.start >= end;

    slots.push({
      startTime: minutesToTime(start),
      endTime: minutesToTime(end),
      available: isAvailable,
    });
  }

  return slots;
}

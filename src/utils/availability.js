
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

  const slots = [];

  for (
    let start = startMinutes;
    start + slotDuration <= endMinutes;
    start += slotDuration
  ) {
    const end = start + slotDuration;

    const isAvailable = !reservations.some((reservation) => {
      const reservationStart = timeToMinutes(reservation.startTime);
      const reservationEnd = timeToMinutes(reservation.endTime);

      return start < reservationEnd && end > reservationStart;
    });

    slots.push({
      startTime: minutesToTime(start),
      endTime: minutesToTime(end),
      available: isAvailable,
    });
  }

  return slots;
}

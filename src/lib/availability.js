import { addDays, fromMin, minutesOfDay, toDateStr, toMin, weekdayOf } from './time.js';

// Ключ за "ресурс + дата", например 'salon-maria|2026-11-20'
export const dayKey = (resourceId, date) => `${resourceId}|${date}`;

// Строим индекс: Map, в който за всеки ресурс и ден пазим резервациите,
// сортирани по начален час. Строим го веднъж, а после проверките гледат
// само един ден на един ресурс, не целия списък.
export function buildIndex(bookings) {
  const index = new Map();
  for (const booking of bookings) {
    const key = dayKey(booking.resourceId, booking.date);
    const list = index.get(key);
    if (list) list.push(booking);
    else index.set(key, [booking]);
  }
  for (const list of index.values()) list.sort((a, b) => a.startMin - b.startMin);
  return index;
}

// Има ли конфликт, ако резервираме [startMin, endMin) на този ресурс?
// Два интервала се припокриват, ако aStart < bEnd && bStart < aEnd.
// Краят е изключен, затова 10:00-11:00 и 11:00-12:00 НЕ са конфликт.
export function hasConflict(index, resource, date, startMin, endMin, partySize = 1, ignoreId = null) {
  if (partySize < 1 || partySize > resource.capacity) return true;

  const list = index.get(dayKey(resource.id, date));
  if (!list) return false;

  let used = 0;
  for (const booking of list) {
    if (booking.startMin >= endMin) break; // списъкът е сортиран, по-нататък няма припокриване
    if (booking.endMin <= startMin || booking.id === ignoreId) continue;
    if (!resource.shared) return true;     // ексклузивен ресурс: всяко припокриване е конфликт
    used += booking.partySize;             // споделен ресурс: трупаме заетите места
  }
  return resource.shared && used + partySize > resource.capacity;
}

// Всички възможни часове за един ден; available показва дали са свободни
export function getDaySlots({
  business, resource, service, date, index,
  partySize = 1, ignoreId = null, now = new Date(),
}) {
  const hours = business.workingHours[weekdayOf(date)];
  if (!hours) return []; // почивен ден

  const open = toMin(hours[0]);
  const close = toMin(hours[1]);
  const today = toDateStr(now);
  const nowMin = minutesOfDay(now);

  const slots = [];
  for (let start = open; start + service.durationMin <= close; start += business.slotStepMin) {
    const end = start + service.durationMin;
    const inPast = date < today || (date === today && start <= nowMin);
    slots.push({
      startMin: start,
      endMin: end,
      label: fromMin(start),
      available: !inPast && !hasConflict(index, resource, date, start, end, partySize, ignoreId),
    });
  }
  return slots;
}

// Дати (от днес напред), в които никой ресурс няма свободен час.
// Включва и почивните дни. Това ще се подава на календара.
export function getUnavailableDates({
  business, service, resources, index,
  partySize = 1, ignoreId = null, now = new Date(), horizonDays,
}) {
  const result = [];
  for (let i = 0; i < horizonDays; i += 1) {
    const date = toDateStr(addDays(now, i));
    const hasFree = resources.some((resource) =>
      getDaySlots({ business, resource, service, date, index, partySize, ignoreId, now })
        .some((slot) => slot.available)
    );
    if (!hasFree) result.push(date);
  }
  return result;
}
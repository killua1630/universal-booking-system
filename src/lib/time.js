const pad = (n) => String(n).padStart(2, '0');

// '09:30' -> 570 (минути от полунощ). С числа интервалите се сравняват лесно.
export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// 570 -> '09:30'
export const fromMin = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

// Дата -> '2026-11-19' (по местно време)
export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// '2026-11-19' -> дата
export const parseDateStr = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Ден от седмицата: 0 = неделя ... 6 = събота
export const weekdayOf = (dateStr) => parseDateStr(dateStr).getDay();

// Добавя n дни към дата
export const addDays = (date, n) => {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
};

// Колко минути са минали от полунощ до този момент
export const minutesOfDay = (d) => d.getHours() * 60 + d.getMinutes();
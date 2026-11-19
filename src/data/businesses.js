const hours = (weekday, saturday = null, sunday = null) => ({
  0: sunday, 1: weekday, 2: weekday, 3: weekday, 4: weekday, 5: weekday, 6: saturday,
});

const svc = (id, title, durationMin, price, description) => ({
  id, title, durationMin, price, description, duration: `${durationMin} мин`,
});

export const DEFAULT_BUSINESS_ID = 'salon';
export const BOOKING_HORIZON_DAYS = 120;

export const BUSINESSES = {
  salon: {
    id: 'salon',
    name: 'Салон',
    labels: { service: 'Услуга', resource: 'Специалист', party: 'Брой хора' },
    currency: 'лв.',
    slotStepMin: 30,
    askPartySize: false,
    workingHours: hours(['09:00', '18:00'], ['09:00', '14:00']),
    resources: [
      { id: 'salon-maria', name: 'Мария', capacity: 1, shared: false },
      { id: 'salon-petar', name: 'Петър', capacity: 1, shared: false },
    ],
    services: [
      svc('salon-cut', 'Подстригване', 45, 30, 'Измиване, подстригване и оформяне.'),
      svc('salon-beard', 'Оформяне на брада', 30, 20, 'Тримване и оформяне на брада.'),
      svc('salon-color', 'Боядисване', 90, 70, 'Цялостно боядисване на коса.'),
    ],
  },

  restaurant: {
    id: 'restaurant',
    name: 'Ресторант',
    labels: { service: 'Събитие', resource: 'Маса', party: 'Брой гости' },
    currency: 'лв.',
    slotStepMin: 30,
    askPartySize: true,
    workingHours: hours(['12:00', '23:00'], ['12:00', '23:00'], ['12:00', '22:00']),
    resources: [
      { id: 'rest-t1', name: 'Маса 1 (2 места)', capacity: 2, shared: false },
      { id: 'rest-t2', name: 'Маса 2 (4 места)', capacity: 4, shared: false },
      { id: 'rest-t3', name: 'Маса 3 (6 места)', capacity: 6, shared: false },
    ],
    services: [
      svc('rest-lunch', 'Обяд', 60, 0, 'Резервация на маса за обяд.'),
      svc('rest-dinner', 'Вечеря', 90, 0, 'Резервация на маса за вечеря.'),
      svc('rest-party', 'Семеен празник', 180, 50, 'Маса за празник с депозит.'),
    ],
  },

  coworking: {
    id: 'coworking',
    name: 'Коуъркинг',
    labels: { service: 'Пакет', resource: 'Помещение', party: 'Брой души' },
    currency: 'лв.',
    slotStepMin: 60,
    askPartySize: true,
    workingHours: hours(['08:00', '20:00'], ['10:00', '16:00']),
    resources: [
      { id: 'cowork-open', name: 'Open space (10 места)', capacity: 10, shared: true },
      { id: 'cowork-room', name: 'Заседателна зала (8 места)', capacity: 8, shared: false },
    ],
    services: [
      svc('cowork-hour', 'Работно място – 1 час', 60, 8, 'Почасов наем.'),
      svc('cowork-half', 'Половин ден (4 часа)', 240, 25, 'Четири часа работа.'),
      svc('cowork-day', 'Цял ден (8 часа)', 480, 40, 'Целодневен наем.'),
    ],
  },
};
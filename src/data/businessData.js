
export const businessData = {
  medical: {
    name: 'Медицински кабинет',
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    slotDuration: 30,
    resources: [
      { id: 1, name: 'Д-р Иванов', capacity: 1 },
      { id: 2, name: 'Д-р Петрова', capacity: 1 },
    ],
  },

  salon: {
    name: 'Фризьорски салон',
    workingHours: {
      start: '09:00',
      end: '18:00',
    },
    slotDuration: 60,
    resources: [
      { id: 1, name: 'Мария - фризьор', capacity: 1 },
      { id: 2, name: 'Георги - фризьор', capacity: 1 },
    ],
  },

  hall: {
    name: 'Зала под наем',
    workingHours: {
      start: '08:00',
      end: '20:00',
    },
    slotDuration: 60,
    resources: [
      { id: 1, name: 'Зала 1', capacity: 20 },
      { id: 2, name: 'Зала 2', capacity: 30 },
      { id: 3, name: 'Зала 3', capacity: 50 },
    ],
  },
};


export const businessData = {
  medical: {
    name: 'Медицински кабинет',
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    slotDuration: 30,
    resources: [
      { id: 1, name: 'Д-р Иванов' },
      { id: 2, name: 'Д-р Петрова' },
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
      { id: 1, name: 'Мария - фризьор' },
      { id: 2, name: 'Георги - фризьор' },
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
      { id: 1, name: 'Зала 1' },
      { id: 2, name: 'Зала 2' },
      { id: 3, name: 'Зала 3' },
    ],
  },
};

import { addDays, toDateStr } from '../lib/time.js';
import { BUSINESSES } from './businesses.js';

// Формата на резервацията е договорът между логиката и интерфейса
const make = (id, businessId, serviceId, resourceId, date, startMin, partySize, name) => {
  const business = BUSINESSES[businessId];
  const service = business.services.find((s) => s.id === serviceId);
  const resource = business.resources.find((r) => r.id === resourceId);
  return {
    id,
    businessId,
    resourceId,
    resourceName: resource.name,
    serviceId,
    serviceTitle: service.title,
    price: service.price,
    durationMin: service.durationMin,
    date,
    startMin,
    endMin: startMin + service.durationMin,
    partySize,
    name,
    email: 'demo@example.com',
    phone: '+359 88 000 0000',
  };
};

// Датите са спрямо днес, за да не остаряват демо данните
export function createSeedBookings(today = new Date()) {
  const d = (n) => toDateStr(addDays(today, n));
  return [
    make('seed-1', 'salon', 'salon-cut', 'salon-maria', d(1), 600, 1, 'Иван Петров'),
    make('seed-2', 'salon', 'salon-color', 'salon-petar', d(1), 540, 1, 'Елена Динева'),
    make('seed-3', 'restaurant', 'rest-dinner', 'rest-t2', d(2), 1140, 4, 'Семейство Георгиеви'),
    make('seed-4', 'coworking', 'cowork-hour', 'cowork-open', d(1), 600, 8, 'Стартъп екип'),
    make('seed-5', 'coworking', 'cowork-hour', 'cowork-open', d(1), 600, 2, 'Фрийлансър'),
  ];
}
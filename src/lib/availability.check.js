import assert from 'node:assert/strict';
import { BUSINESSES } from '../data/businesses.js';
import { buildIndex, hasConflict, getDaySlots } from './availability.js';

const salon = BUSINESSES.salon;
const maria = salon.resources[0];
const date = '2030-01-07'; // понеделник

// Една резервация при Мария от 10:00 до 10:45 (600-645 минути)
const index = buildIndex([
  { id: 'a', resourceId: maria.id, date, startMin: 600, endMin: 645, partySize: 1 },
]);

assert.equal(hasConflict(index, maria, date, 600, 645), true);   // същият интервал
assert.equal(hasConflict(index, maria, date, 630, 690), true);   // частично припокриване
assert.equal(hasConflict(index, maria, date, 645, 690), false);  // започва точно когато другият свършва
assert.equal(hasConflict(index, maria, date, 540, 600), false);  // свършва точно когато другият започва
assert.equal(hasConflict(index, maria, date, 630, 690, 1, 'a'), false); // при промяна игнорираме себе си

// Споделен ресурс с капацитет 10 (open space)
const open = BUSINESSES.coworking.resources[0];
const index2 = buildIndex([
  { id: 'b', resourceId: open.id, date, startMin: 600, endMin: 660, partySize: 8 },
]);
assert.equal(hasConflict(index2, open, date, 600, 660, 2), false); // 8 + 2 = 10, влиза
assert.equal(hasConflict(index2, open, date, 600, 660, 3), true);  // 8 + 3 = 11, не влиза

// Слотове за деня
const slots = getDaySlots({
  business: salon, resource: maria, service: salon.services[0],
  date, index, now: new Date(2029, 0, 1),
});
assert.equal(slots[0].label, '09:00');
assert.equal(slots.find((s) => s.label === '10:00').available, false);

console.log('Всички проверки минаха');
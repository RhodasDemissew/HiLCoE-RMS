import { strict as assert } from 'assert';
import {
  parseLocalStart,
  computeWindow,
  normalizeVenueAndLink,
  hasOverlap,
} from '../src/services/defense/utils.js';

function testVenueValidation() {
  const inPerson = normalizeVenueAndLink('in-person', ' Hall A ', '');
  assert.equal(inPerson.venue, 'Hall A');
  assert.equal(inPerson.link, '');

  const online = normalizeVenueAndLink('online', '', 'https://example.com/meet');
  assert.equal(online.link, 'https://example.com/meet');

  const hybrid = normalizeVenueAndLink('hybrid', 'Room 1', '');
  assert.equal(hybrid.venue, 'Room 1');

  let threw = false;
  try {
    normalizeVenueAndLink('in-person', '', '');
  } catch (err) {
    threw = true;
    assert.ok(/venue/i.test(err.message));
  }
  assert.ok(threw, 'expected in-person rule to enforce venue');

  threw = false;
  try {
    normalizeVenueAndLink('online', '', '');
  } catch (err) {
    threw = true;
    assert.ok(/link/i.test(err.message));
  }
  assert.ok(threw, 'expected online rule to enforce meeting link');
}

function testOverlapWithBuffer() {
  const slotAStart = parseLocalStart('2025-05-01', '10:00');
  const slotA = computeWindow(slotAStart, 60, 15);
  const existing = [{
    start_at: slotA.startUtc.toDate(),
    end_at: slotA.endUtc.toDate(),
    buffer_mins: slotA.buffer,
  }];

  const overlappingStart = parseLocalStart('2025-05-01', '10:50');
  const overlapping = computeWindow(overlappingStart, 45, 15);
  assert.equal(
    hasOverlap(existing, overlapping.startUtc, overlapping.endUtc, overlapping.buffer),
    true,
    'should detect overlap within buffer window',
  );

  const clearStart = parseLocalStart('2025-05-01', '12:30');
  const clear = computeWindow(clearStart, 45, 15);
  assert.equal(
    hasOverlap(existing, clear.startUtc, clear.endUtc, clear.buffer),
    false,
    'should allow back-to-back after buffer',
  );
}

testVenueValidation();
testOverlapWithBuffer();

console.log('✓ defense utils tests passed');


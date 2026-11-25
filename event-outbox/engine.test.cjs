const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initialState, applyEvent, drainQueue } = require('./engine.cjs');

const payment = {
  id: 'demo_event_1', type: 'payment.succeeded',
  order_id: 'ORD-9100', amount: 12500, currency: 'RUB',
};

test('applies a payment once and only enqueues one notification', () => {
  const state = initialState();
  assert.equal(applyEvent(state, payment).order.status, 'paid');
  assert.equal(applyEvent(state, { ...payment }).duplicate, true);
  assert.equal(state.events.length, 1);
  assert.equal(state.outbox.length, 1);
});

test('rejects amount mismatch without changing state', () => {
  const state = initialState();
  assert.throws(() => applyEvent(state, { ...payment, amount: 1 }));
  assert.deepEqual(state, initialState());
});

test('retries only after the scheduled delay', () => {
  const state = initialState();
  applyEvent(state, payment);
  assert.equal(drainQueue(state, { failFirst: true, now: 1000 })[0].status, 'retry');
  assert.deepEqual(drainQueue(state, { now: 2999 }), []);
  assert.equal(drainQueue(state, { now: 3000 })[0].status, 'sent');
});

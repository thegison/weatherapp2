const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('./app.js');

const storage = {
  data: {},
  getItem(key) { return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null; },
  setItem(key, value) { this.data[key] = String(value); },
  removeItem(key) { delete this.data[key]; }
};

test('readStoredUser returns saved favorite city', () => {
  storage.data['forecasted-favorite-city'] = JSON.stringify({
    name: 'Paris',
    admin1: 'Île-de-France',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522
  });

  const result = app.readStoredUser(storage);
  assert.equal(result.name, 'Paris');
  assert.equal(result.country, 'France');
});

test('buildWeatherImageSet picks a weather-matched collection', () => {
  const result = app.buildWeatherImageSet(5, 71);
  assert.ok(Array.isArray(result));
  assert.ok(result.length >= 3);
  assert.ok(result[0].title.length > 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  provinces,
  districtsFor,
  validLocation,
  phoneInput,
  validPhone,
  validAddress,
} from '../lib/contact-validation.mjs';

test('81 il ve ilçelerinin ilişkisi, aynı adlı ilçeler dahil korunur', () => {
  assert.equal(provinces.length, 81);
  assert.equal(new Set(provinces).size, 81);
  assert.equal(
    provinces.reduce((sum, city) => sum + districtsFor(city).length, 0),
    973,
  );
  assert.ok(provinces.every((city) => districtsFor(city).length > 0));
  assert.equal(validLocation('Sakarya', 'Serdivan'), true);
  assert.equal(validLocation('Konya', 'Serdivan'), false);
  assert.equal(validLocation('Konya', 'Ereğli'), true);
  assert.equal(validLocation('Zonguldak', 'Ereğli'), true);
  assert.equal(validLocation('', ''), false);
});
test('telefon biçimleri yerel numaraya dönüşür, uzun ve hatalı numara geçmez', () => {
  for (const input of ['+90 (532) 123 45 67', '00905321234567', '5321234567', '05321234567']) {
    assert.equal(phoneInput(input), '05321234567');
    assert.equal(validPhone(phoneInput(input)), true);
  }
  for (const input of [
    '551*****34',
    'telefon',
    '0532123456',
    '053212345678',
    '+440123456789',
    '0532abc4567',
  ]) {
    assert.equal(validPhone(input), false);
    assert.equal(validPhone(phoneInput(input)), false);
  }
  assert.equal(validPhone('02641234567'), true);
  assert.equal(validPhone('', true), true);
  assert.equal(validPhone(''), false);
});
test('adres kaydı boşluk, hatalı telefon veya başka ile bağlı ilçe kabul etmez', () => {
  const address = {
    title: 'Ev',
    name: 'Test Kişi',
    phone: '05321234567',
    city: 'Sakarya',
    district: 'Serdivan',
    address: 'Test Sokak No: 1',
  };
  assert.equal(validAddress(address), true);
  for (const patch of [
    { title: ' ' },
    { name: '' },
    { address: '\n ' },
    { phone: '551*****34' },
    { city: 'Konya' },
    { district: '' },
  ]) {
    assert.equal(validAddress({ ...address, ...patch }), false);
  }
});

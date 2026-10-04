import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAddresses,
  validateAccount,
  readSessionValue,
  writeSessionValue,
} from '../lib/session-account.mjs';

const address = {
  id: 1,
  title: 'Ev',
  name: 'Test Kişi',
  phone: '05321234567',
  city: 'Sakarya',
  district: 'Serdivan',
  address: 'Test Sokak No: 1',
};

test('session addresses reject damaged entries and duplicate identifiers', () => {
  assert.deepEqual(validateAddresses(null), []);
  assert.deepEqual(validateAddresses({ addresses: [address] }), []);
  assert.deepEqual(
    validateAddresses([
      null,
      1,
      {},
      address,
      address,
      { ...address, id: 2, city: 'Konya' },
      { ...address, id: 3, phone: 'abc' },
    ]),
    [address],
  );
});
test('neighborhood and address type persist, obsolete postal codes are removed', () => {
  assert.deepEqual(
    validateAddresses([
      { ...address, neighborhood: 'Kemalpaşa', addressType: 'corporate', postalCode: '54050' },
    ]),
    [{ ...address, neighborhood: 'Kemalpaşa', addressType: 'corporate' }],
  );
  assert.deepEqual(validateAddresses([{ ...address, neighborhood: '' }]), []);
  assert.deepEqual(validateAddresses([{ ...address, addressType: 'unknown' }]), []);
  assert.deepEqual(validateAddresses([{ ...address, postalCode: '54050' }]), [address]);
});

test('session account preserves all personal fields and explicit preference choices', () => {
  const account = {
    profile: {
      name: 'Test',
      surname: 'Kişi',
      email: 'test@example.com',
      phone: '05321234567',
      birthday: '2000-01-02',
      gender: 'Belirtmek istemiyorum',
    },
    preferences: { email: false, sms: false, new: true, discount: false, order: true },
  };
  assert.deepEqual(validateAccount(account), account);
  const repaired = validateAccount({
    profile: {
      name: {},
      phone: 'abc',
      email: 'abc',
      gender: '<script>',
      birthday: 'abc',
      password: 'secret',
    },
    preferences: { sms: 'false' },
  });
  assert.equal(repaired.profile.phone, '');
  assert.equal(repaired.preferences.sms, true);
  assert.equal('password' in repaired.profile, false);
});

test('corrupt or blocked session storage does not prevent account use', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  try {
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: () => '{',
        setItem: () => {
          throw new Error('blocked');
        },
      },
    });
    assert.deepEqual(readSessionValue('test', validateAddresses), []);
    assert.doesNotThrow(() => writeSessionValue('test', [address]));
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked');
      },
    });
    assert.deepEqual(readSessionValue('test', validateAccount), validateAccount(null));
  } finally {
    if (previous) Object.defineProperty(globalThis, 'sessionStorage', previous);
    else delete globalThis.sessionStorage;
  }
});

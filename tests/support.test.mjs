import test from 'node:test';
import assert from 'node:assert/strict';
import { supportEndpoint, sendSupportMessage } from '../lib/support.mjs';

const endpoint = 'https://formspree.io/f/test123';
const fields = {
  name: ' Test Kişi ',
  email: 'test@example.com',
  phone: '',
  topic: 'Ürün hakkında',
  order_number: '',
  message: 'Beden seçimi hakkında bilgi almak istiyorum.',
};
test('yapılandırılmamış veya farklı adrese destek verisi gönderilmez', async () => {
  assert.equal(supportEndpoint('https://fake.test/f/test123'), '');
  assert.equal(supportEndpoint('https://formspree.io/f/test123?email=test@example.com'), '');
  let called = false;
  await assert.rejects(
    sendSupportMessage('', fields, async () => {
      called = true;
    }),
    /aktif değil/,
  );
  assert.equal(called, false);
});
test('destek payloadı sadece gerekli iletişim alanlarını içerir', async () => {
  await sendSupportMessage(
    endpoint,
    { ...fields, password: 'do-not-send', card: 'do-not-send', address: 'do-not-send' },
    async (url, options) => {
      assert.equal(url, endpoint);
      const body = JSON.parse(options.body);
      assert.equal(body.name, 'Test Kişi');
      assert.equal(body.email, fields.email);
      assert.deepEqual(Object.keys(body), [
        'name',
        'email',
        'phone',
        'topic',
        'order_number',
        'message',
        '_gotcha',
      ]);
      assert.equal(options.credentials, 'omit');
      return Response.json({ ok: true });
    },
  );
});
test('hatalı mesaj ve servis cevabı başarılı gönderim sayılmaz', async () => {
  let called = false;
  await assert.rejects(
    sendSupportMessage(endpoint, { ...fields, message: ' ' }, async () => {
      called = true;
    }),
    /kontrol et/,
  );
  assert.equal(called, false);
  await assert.rejects(
    sendSupportMessage(endpoint, fields, async () => Response.json({ ok: false }, { status: 429 })),
    /gönderilemedi/,
  );
  await assert.rejects(
    sendSupportMessage(endpoint, fields, async () => Response.json({})),
    /doğrulanamadı/,
  );
});
test('hatalı telefon destek servisine gönderilmez', async () => {
  let called = false;
  await assert.rejects(
    sendSupportMessage(endpoint, { ...fields, phone: 'abc123' }, async () => {
      called = true;
    }),
    /kontrol et/,
  );
  assert.equal(called, false);
});

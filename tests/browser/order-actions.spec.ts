import { test, expect, type Page } from '@playwright/test';

const tunicLabel = 'Rahat Kesim Uzun Tunik, Lila, M beden';
const cropLabel = 'Bisiklet Yaka Basic Crop, Ekru, S beden';
const order = {
  id: 'DEMO-A11',
  date: '2026-10-03T12:00:00Z',
  status: 'received',
  rows: [
    { id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 2 },
    { id: 'basic-crop', size: 'S', color: 'Ekru', quantity: 1 },
  ],
};

async function openOrder(page: Page) {
  await page.addInitScript((seed) => {
    sessionStorage.setItem('mosso-demo-session', 'preview');
    if (!sessionStorage.getItem('mosso-demo-orders-v1')) {
      sessionStorage.setItem('mosso-demo-orders-v1', JSON.stringify([seed]));
    }
  }, order);
  await page.goto('/siparislerim/?siparis=DEMO-A11');
  await expect(page.getByRole('button', { name: 'Ürün iptal et', exact: true })).toBeEnabled();
}

for (const action of ['cancel', 'return'] as const) {
  test(`${action}: consumed product quantities cannot be selected again, including after reload`, async ({
    page,
  }) => {
    await openOrder(page);
    await page
      .getByRole('button', {
        name: action === 'cancel' ? 'Ürün iptal et' : 'İade talebi oluştur',
        exact: true,
      })
      .click();
    const form = page.locator('#order-action-form');
    await form.getByRole('checkbox', { name: tunicLabel, exact: true }).check();
    await expect(form.getByRole('combobox', { name: `${tunicLabel} işlem adedi` })).toHaveValue(
      '2',
    );
    if (action === 'return')
      await form.getByLabel('İade nedeni', { exact: true }).selectOption('size');
    await form
      .getByRole('button', {
        name: action === 'cancel' ? 'Seçilen ürünleri iptal et' : 'İade talebini gönder',
      })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', {
        name: action === 'cancel' ? 'Evet, ürünleri iptal et' : 'Evet, talebi gönder',
      })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();

    for (const reload of [false, true]) {
      if (reload) await page.reload();
      for (const name of ['Ürün iptal et', 'İade talebi oluştur']) {
        await page.getByRole('button', { name, exact: true }).click();
        await expect(form.getByRole('checkbox', { name: tunicLabel, exact: true })).toHaveCount(0);
        await expect(form.getByRole('checkbox', { name: cropLabel, exact: true })).toBeEnabled();
      }
    }
  });
}

test('partial cancellation leaves only the unprocessed quantity for a return', async ({ page }) => {
  await openOrder(page);
  await page.getByRole('button', { name: 'Ürün iptal et', exact: true }).click();
  const form = page.locator('#order-action-form');
  await form.getByRole('checkbox', { name: tunicLabel, exact: true }).check();
  await form.getByRole('combobox', { name: `${tunicLabel} işlem adedi` }).selectOption('1');
  await form.getByRole('button', { name: 'Seçilen ürünleri iptal et' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Evet, ürünleri iptal et' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'İade talebi oluştur', exact: true }).click();
  await form.getByRole('checkbox', { name: tunicLabel, exact: true }).check();
  const quantity = form.getByRole('combobox', { name: `${tunicLabel} işlem adedi` });
  await expect(quantity).toHaveValue('1');
  await expect(quantity.locator('option')).toHaveCount(1);
  await form.getByLabel('İade nedeni', { exact: true }).selectOption('size');
  await form.getByRole('button', { name: 'İade talebini gönder' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Evet, talebi gönder' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Ürün iptal et', exact: true }).click();
  await expect(form.getByRole('checkbox', { name: tunicLabel, exact: true })).toHaveCount(0);
  await expect(form.getByRole('checkbox', { name: cropLabel, exact: true })).toBeEnabled();
});

for (const width of [390, 1440]) {
  test(`checkout confirmation scrolls into view and receives focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.addInitScript(() => {
      sessionStorage.setItem('mosso-demo-session', 'preview');
      localStorage.setItem(
        'mosso-preview-v1',
        JSON.stringify({ cart: [{ id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 1 }] }),
      );
    });
    await page.goto('/odeme/');
    if (width <= 760)
      await page.getByRole('button', { name: 'Sepeti onayla', exact: true }).click();
    await page.getByLabel('Adres başlığı', { exact: true }).fill('Test adresi');
    await page.getByLabel('Ad soyad', { exact: true }).fill('Test Müşteri');
    await page.getByLabel('Telefon', { exact: true }).fill('05320000000');
    await page.getByRole('combobox', { name: 'İl', exact: true }).selectOption('Sakarya');
    await page.getByRole('combobox', { name: 'İlçe', exact: true }).selectOption('Serdivan');
    await page.getByLabel('Açık adres', { exact: true }).fill('Test Mahallesi, Test Sokak No: 1');
    await page.getByRole('button', { name: 'Adresi kaydet ve seç' }).click();
    await page.getByRole('radio', { name: 'iyzico', exact: true }).check();
    await page.locator('#checkout-agreement').check();
    await page.locator('#privacy-info').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Ödeme yap', exact: true }).click();
    const heading = page.getByRole('heading', { name: 'Siparişiniz alındı.', exact: true });
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
    expect((await heading.boundingBox())!.y).toBeLessThan(350);
  });
}

test('mobile payment dock stays reachable with visible products and no checkout footer or support', async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('mosso-demo-session', 'preview');
    localStorage.setItem(
      'mosso-preview-v1',
      JSON.stringify({ cart: [{ id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 1 }] }),
    );
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/odeme/');
  const products = page.locator('#checkout-products-list');
  const payment = page.getByRole('button', { name: 'Ödeme yap', exact: true });
  const dock = page.locator('.checkout-summary');
  await expect(products).toBeVisible();
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await expect(page.locator('.support-launcher')).toHaveCount(0);
  await expect(page.getByText(/Önizleme|Deneme alışverişi/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Sepeti onayla', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Teslimat ve ödeme', exact: true })).toBeVisible();
  await expect(page.locator('.checkout-delivery-products')).toBeVisible();
  await expect(page.locator('.checkout-delivery-products')).not.toHaveAttribute('open');
  await expect(page.locator('.checkout-delivery-products ul')).toBeHidden();
  await page.locator('.checkout-delivery-products summary').click();
  await expect(page.locator('.checkout-delivery-products ul')).toBeVisible();
  await page.locator('.checkout-delivery-products summary').click();
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 700 });
    for (const selector of ['#delivery-title', '#payment-title', '#privacy-info']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(payment).toBeInViewport();
      await expect(page.locator('#checkout-agreement')).toBeInViewport();
      await expect(dock).toHaveCSS('position', 'fixed');
      const box = (await payment.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(700);
      expect(box.y + box.height).toBeGreaterThan(650);
    }
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    const documents = (await page.locator('.contract-documents').boundingBox())!;
    const dockBox = (await dock.boundingBox())!;
    expect(documents.y + documents.height).toBeLessThanOrEqual(dockBox.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(dock).toHaveCSS('position', 'sticky');
  await expect(products).toBeVisible();
});

test('mobile summary expands pricing and applies coupons without changing the desktop summary', async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('mosso-demo-session', 'preview');
    localStorage.setItem(
      'mosso-preview-v1',
      JSON.stringify({ cart: [{ id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 1 }] }),
    );
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/odeme/');
  const summary = page.locator('.checkout-summary');
  const breakdown = page.locator('#checkout-price-breakdown');
  const toggle = page.getByRole('button', { name: 'Sipariş özetini göster', exact: true });
  await expect(breakdown).toBeHidden();
  await expect(page.getByLabel('Kupon kodu', { exact: true })).toBeVisible();
  await page.getByLabel('Kupon kodu', { exact: true }).fill('MOSSO10');
  await page
    .locator('.mobile-cart-coupon')
    .getByRole('button', { name: 'Uygula', exact: true })
    .click();
  await expect(page.locator('.mobile-cart-coupon .applied-coupon')).toContainText(
    '%10 indirim uygulandı',
  );
  await toggle.click();
  await expect(breakdown).toBeVisible();
  await expect(summary.getByText('KDV hariç tutar', { exact: true })).toBeVisible();
  await expect(summary.getByLabel('Kupon kodun var mı?')).toBeHidden();
  const discountedTotal = await summary
    .locator('.checkout-grand-total > strong:last-child')
    .innerText();
  await expect(page.locator('.mobile-checkout-total strong')).toHaveText(discountedTotal);
  await expect(page.locator('.mobile-checkout-total del')).toHaveText('₺899');
  await page.getByRole('button', { name: 'Sipariş özetini kapat', exact: true }).click();
  await page.getByRole('button', { name: 'Sepeti onayla', exact: true }).click();
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(breakdown).toBeHidden();
    const box = (await summary.boundingBox())!;
    expect(box.height).toBeLessThan(170);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Sipariş özetini göster', exact: true }).click();
    const details = (await page.locator('#checkout-summary-details').boundingBox())!;
    expect(details.y).toBeGreaterThanOrEqual(0);
    expect(details.y + details.height).toBeLessThanOrEqual(box.y);
    await page.getByRole('button', { name: 'Sipariş özetini gizle', exact: true }).press('Escape');
    await expect(breakdown).toBeHidden();
  }
  await page.getByRole('button', { name: 'Kuponu düzenle', exact: true }).click();
  await expect(page.getByLabel('Kupon kodu', { exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Sepet özeti (1)', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(breakdown).toBeVisible();
  await expect(summary.getByLabel('Kupon kodun var mı?')).toBeVisible();
  await expect(summary).toHaveCSS('position', 'sticky');
});

test('mobile checkout moves between cart and delivery while preserving edits and coupon', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.addInitScript(() => {
    sessionStorage.setItem('mosso-demo-session', 'preview');
    localStorage.setItem(
      'mosso-preview-v1',
      JSON.stringify({ cart: [{ id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 1 }] }),
    );
  });
  await page.goto('/odeme/');
  await expect(page.getByRole('heading', { name: 'Sepet özeti (1)', exact: true })).toBeVisible();
  await expect(page.locator('#checkout-products-list')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ödeme yap', exact: true })).toBeHidden();
  await page
    .getByRole('button', { name: 'Rahat Kesim Uzun Tunik adedini artır', exact: true })
    .click();
  await page.getByLabel('Kupon kodu', { exact: true }).fill('MOSSO10');
  await page
    .locator('.mobile-cart-coupon')
    .getByRole('button', { name: 'Uygula', exact: true })
    .click();
  const total = await page.locator('.mobile-checkout-total strong').innerText();
  await page.getByRole('button', { name: 'Sepeti onayla', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Teslimat ve ödeme', exact: true })).toBeVisible();
  await expect(page.locator('.checkout-delivery-products')).toContainText('2 adet');
  await expect(page.locator('.mobile-checkout-total strong')).toHaveText(total);
  await expect(page.getByRole('button', { name: 'Ödeme yap', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sepet özetine dön', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sepet özeti (2)', exact: true })).toBeVisible();
  await expect(page.locator('.mobile-cart-coupon')).toContainText(
    'MOSSO10 · %10 indirim uygulandı',
  );
  await expect(page.locator('.mobile-checkout-total strong')).toHaveText(total);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByRole('button', { name: 'Sepeti onayla', exact: true })).toBeInViewport();
  }
  await page
    .getByRole('link', { name: 'Rahat Kesim Uzun Tunik ürününü incele', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Rahat Kesim Uzun Tunik', exact: true }),
  ).toBeVisible();
});

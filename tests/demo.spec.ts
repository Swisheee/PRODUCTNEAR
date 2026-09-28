import { test, expect } from '@playwright/test';
test.skip(
  Boolean(process.env.LIVE_SUPABASE),
  'Demo tests require an unconfigured Supabase environment',
);
test('home labels sample data and stays within mobile viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '써본 사람에게 물어보세요.' })).toBeVisible();
  await expect(page.getByText('모든 인물·동호회·경험은 데모입니다.')).toBeAttached();
  await expect(page.getByRole('link', { name: '우리 동호회 찾아보기' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('product puts users and experience before purchase options', async ({ page }) => {
  await page.goto('/products/demo-kobe');
  await expect(
    page.getByRole('heading', { name: 'Kobe 9 Protro Elite Low', level: 1 }),
  ).toBeVisible();
  const owners = page.locator('#owners');
  const offers = page.locator('#offers');
  expect((await owners.boundingBox())!.y).toBeLessThan((await offers.boundingBox())!.y);
  await expect(page.getByText('아직 확인된 구매처가 없어요.')).toBeVisible();
  await expect(page.getByText('지금은 읽기 전용 데모예요.')).toBeVisible();
});
test('search and product selection are functional', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('textbox', { name: '검색어' }).fill('Garmin');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Forerunner 265' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kobe 9 Protro Elite Low' })).toHaveCount(0);
  await page.goto('/gear/new');
  await page.getByRole('textbox', { name: '브랜드 또는 제품명' }).fill('Kobe');
  await page.getByRole('button', { name: /Kobe 9/ }).click();
  await expect(page.getByText('선택됨 ✓')).toBeVisible();
  await expect(page.getByRole('button', { name: '내 장비 등록하기', exact: true })).toBeDisabled();
});
test('URL import rejects private addresses and does not fake metadata', async ({ page }) => {
  await page.goto('/gear/new');
  await page.getByRole('button', { name: '구매 링크' }).click();
  await page.getByRole('textbox', { name: '구매한 쇼핑몰 주소' }).fill('https://127.0.0.1/admin');
  await page.getByRole('button', { name: '주소 확인' }).click();
  await expect(page.getByRole('alert').filter({ hasText: '공개 쇼핑몰' })).toContainText(
    '공개 쇼핑몰',
  );
  await page
    .getByRole('textbox', { name: '구매한 쇼핑몰 주소' })
    .fill('https://shop.example/product');
  await page.getByRole('button', { name: '주소 확인' }).click();
  await expect(page.getByText(/자동 정보 연동은 준비 중/)).toBeVisible();
});
test('club tabs and demo profile navigate correctly', async ({ page }) => {
  await page.goto('/clubs/demo-basketball?tab=members');
  await expect(page.getByRole('heading', { name: '함께하는 사람들' })).toBeVisible();
  await page.getByRole('link', { name: /민수 · 데모/ }).click();
  await expect(page.getByRole('heading', { name: '민수 · 데모' })).toBeVisible();
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: '이 페이지를 볼 수 없어요.' })).toBeVisible();
});
test('auth preserves invite intention and marks unavailable providers', async ({ page }) => {
  await page.goto('/login?next=%2Fjoin%2Ftesttoken');
  await page.getByRole('link', { name: '회원가입', exact: true }).click();
  await expect(page).toHaveURL(/signup\?next=%2Fjoin%2Ftesttoken/);
  await expect(page.getByRole('button', { name: /카카오로 계속하기/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: '이메일로 가입하기' })).toBeDisabled();
});

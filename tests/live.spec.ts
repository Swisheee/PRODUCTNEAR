import { test, expect } from '@playwright/test';
// Run against a fresh LOCAL Supabase with email confirmation disabled.
// Never run against production: these scenarios create real users and data.
test.skip(!process.env.LIVE_SUPABASE, 'Requires local Supabase Auth, PostgreSQL and Storage');
test('signup → private club → invite → two owners → question and notifications', async ({
  browser,
}) => {
  const stamp = Date.now();
  const a = await browser.newContext({ baseURL: 'http://127.0.0.1:3100' });
  const b = await browser.newContext({ baseURL: 'http://127.0.0.1:3100' });
  const pageA = await a.newPage();
  const pageB = await b.newPage();
  async function signup(page: typeof pageA, name: string) {
    await page.goto('/signup');
    await page.getByLabel('이메일', { exact: false }).fill(`${name}-${stamp}@example.test`);
    await page.getByLabel('비밀번호', { exact: false }).fill('LocalTest-Only-2026!');
    await page.getByRole('button', { name: '이메일로 가입하기' }).click();
    await page.waitForURL(/onboarding/);
    await page.getByLabel('닉네임', { exact: false }).fill(name);
    await page.getByRole('button', { name: '프로필 저장하기' }).click();
    await page.waitForURL(/\/me/);
  }
  await signup(pageA, 'TestA');
  await pageA.goto('/clubs/new');
  await pageA.getByLabel('동호회 이름', { exact: false }).fill(`Test Club ${stamp}`);
  await pageA.getByLabel('공개 범위', { exact: true }).selectOption('private');
  await pageA.getByLabel('가입 방식', { exact: true }).selectOption('invite');
  await pageA.getByRole('button', { name: '동호회 만들기', exact: true }).click();
  await pageA.waitForURL(/clubs\/[a-f0-9-]+$/);
  const clubUrl = pageA.url();
  await pageA.getByRole('link', { name: '정보', exact: true }).click();
  await pageA.getByRole('button', { name: '초대 링크 만들기' }).click();
  const invite = await pageA.getByLabel('초대 링크', { exact: true }).inputValue();
  await signup(pageB, 'TestB');
  await pageB.goto(new URL(invite).pathname);
  await pageB.getByRole('button', { name: '초대 수락하고 가입하기' }).click();
  await expect(pageB).toHaveURL(clubUrl);
  for (const page of [pageA, pageB]) {
    await page.goto('/gear/new');
    await page.getByRole('textbox', { name: '브랜드 또는 제품명' }).fill('Kobe');
    await page.getByRole('button', { name: /Kobe 9 Protro Elite Low/ }).click();
    await page
      .getByLabel('함께 공유할 동호회', { exact: true })
      .selectOption({ label: `Test Club ${stamp}` });
    await page.getByLabel('얼마나 자주 쓰나요?', { exact: false }).fill('주 3회');
    await page
      .getByLabel('써보니 어땠나요?', { exact: true })
      .fill('실내 농구장에서 4개월 사용한 테스트 경험입니다.');
    await page.getByLabel('공개 범위', { exact: true }).selectOption('club');
    await page.getByRole('button', { name: '내 장비 등록하기', exact: true }).click();
    await page.waitForURL(/gears\/[a-f0-9-]+$/);
  }
  await pageB.getByRole('link', { name: '이 장비에 대해 물어보기' }).click();
  await pageB.getByLabel('누구에게 물어볼까요?', { exact: true }).selectOption({ label: 'TestA' });
  await pageB.getByLabel('질문', { exact: true }).fill('발볼이 넓으면 반업해야 할까요?');
  await pageB.getByRole('button', { name: '써본 사람에게 질문하기' }).click();
  await pageB.waitForURL(/questions\//);
  await pageA.goto('/notifications');
  await pageA
    .getByRole('link', { name: /등록한 장비에 새로운 질문/ })
    .first()
    .click();
  await pageA
    .getByLabel('내 경험으로 답변하기', { exact: false })
    .fill('제 발에는 반업이 더 편했어요.');
  await pageA.getByRole('button', { name: '답변 남기기' }).click();
  await expect(pageA.getByText('답변을 남겼어요.')).toBeVisible();
  await pageB.goto('/notifications');
  await expect(pageB.getByText('질문에 새로운 답변이 달렸어요.')).toBeVisible();
  await a.close();
  await b.close();
});

import {expect} from '@playwright/test';
import {testWithII} from '../src';
import {DOCKER_CONTAINER} from './spec.constants';

const loginSelector = '#login';

testWithII.describe.configure({mode: 'serial'});

testWithII.beforeEach(async ({iiPage}) => {
  await iiPage.waitReady(DOCKER_CONTAINER);
});

testWithII.describe('without selector', () => {
  testWithII('should sign-in with a first-time user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signIn();
  });

  testWithII('should sign-in with an existing user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signIn();

    const user1 = await page.locator('#identity').innerText();

    await page.locator('#logout').click();

    await iiPage.signIn();

    const user2 = await page.locator('#identity').innerText();

    expect(user1).toEqual(user2);
  });

  testWithII('should sign-in with another identity', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signIn();

    const user1 = await page.locator('#identity').innerText();

    await page.locator('#logout').click();

    await iiPage.signIn({passkey: {account: 'Hello'}});

    const user2 = await page.locator('#identity').innerText();

    expect(user1).not.toEqual(user2);
  });

  testWithII(
    'should sign-in with same identity if same account is provided',
    async ({page, iiPage}) => {
      await page.goto('/');

      await iiPage.signIn();

      await page.locator('#logout').click();

      await iiPage.signIn({passkey: {account: 'World'}});

      const user1 = await page.locator('#identity').innerText();

      await page.locator('#logout').click();

      await iiPage.signIn({passkey: {account: 'World'}});

      const user2 = await page.locator('#identity').innerText();

      expect(user1).toEqual(user2);
    }
  );
});

testWithII.describe('with selector', () => {
  testWithII('should sign-in with a custom selector', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signIn({passkey: {selector: loginSelector}});
  });
});

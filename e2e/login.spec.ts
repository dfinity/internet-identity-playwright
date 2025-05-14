import {testWithII} from '../src';
import {DOCKER_CONTAINER} from './spec.constants';

const loginSelector = '#login';
const logoutSelector = '#logout';

testWithII.beforeEach(async ({iiPage}) => {
  await iiPage.waitReady(DOCKER_CONTAINER);
});

testWithII.describe('without selector', () => {
  testWithII('should sign-in with a new user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signInWithNewIdentity();
  });

  testWithII('should sign-in with an existing new user', async ({page, iiPage}) => {
    await page.goto('/');

    const identity = await iiPage.signInWithNewIdentity();

    await page.locator('#logout').click();

    await iiPage.signInWithIdentity({identity});
  });
});

testWithII.describe('with selector', () => {
  testWithII('should sign-in with a new user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signInWithNewIdentity({selector: loginSelector});
  });

  testWithII('should sign-in with an existing new user', async ({page, iiPage}) => {
    await page.goto('/');

    const identity = await iiPage.signInWithNewIdentity({selector: loginSelector});

    await page.locator(logoutSelector).click();

    await iiPage.signInWithIdentity({identity, selector: loginSelector});
  });
});

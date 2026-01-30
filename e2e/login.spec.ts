import {testWithII} from '../src';
import {DOCKER_CONTAINER} from './spec.constants';

const loginSelector = '#login';
const logoutSelector = '#logout';

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

    await page.locator('#logout').click();

    await iiPage.signIn();
  });
});

testWithII.describe('with selector', () => {
  testWithII('should sign-in with a first-time user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signIn({passkey: {selector: loginSelector}});
  });

  testWithII('should sign-in with an existing user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signIn({passkey: {selector: loginSelector}});

    await page.locator(logoutSelector).click();

    await iiPage.signIn({passkey: {selector: loginSelector}});
  });
});

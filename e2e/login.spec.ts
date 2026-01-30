import {testWithII} from '../src';
import {DOCKER_CONTAINER} from './spec.constants';

const loginSelector = '#login';
const logoutSelector = '#logout';

testWithII.beforeEach(async ({iiPage}) => {
  await iiPage.waitReady(DOCKER_CONTAINER);
});

testWithII.describe('without selector', () => {
  testWithII('should sign-in with a first user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signInWithFirstPasskey();
  });

  testWithII('should sign-in with existing user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signInWithFirstPasskey();

    await page.locator('#logout').click();

    await iiPage.signInWithExistingPasskey();
  });
});

testWithII.describe('with selector', () => {
  testWithII('should sign-in with a new user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signInWithFirstPasskey({selector: loginSelector});
  });

  testWithII('should sign-in with an existing new user', async ({page, iiPage}) => {
    await page.goto('/');

    await iiPage.signInWithFirstPasskey({selector: loginSelector});

    await page.locator(logoutSelector).click();

    await iiPage.signInWithExistingPasskey({selector: loginSelector});
  });
});

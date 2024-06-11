import {testWithII} from '../src';

const loginSelector = '#login';
const logoutSelector = '#logout';

testWithII.beforeEach(async ({iiPage, browser}) => {
    const DOCKER_CONTAINER_URL = 'http://127.0.0.1:5987';
    const DOCKER_INTERNET_IDENTITY_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

    const {host: containerHost, protocol} = new URL(DOCKER_CONTAINER_URL);

    const url = browser.browserType().name() === "webkit"
        ? `${protocol}//${containerHost}?canisterId=${DOCKER_INTERNET_IDENTITY_ID}`
        : `${protocol}//${DOCKER_INTERNET_IDENTITY_ID}.${containerHost.replace('127.0.0.1', 'localhost')}`;

    await iiPage.waitReady({url});
});

testWithII.describe('without selector', () => {
  testWithII('should sign-in with a new user', async ({page, loginPage}) => {
    await page.goto('/');

    await loginPage.signInWithNewUser();
  });

  testWithII(
    'should sign-in with an existing new user',
    async ({page, loginPage}) => {
      await page.goto('/');

      const anchor = await loginPage.signInWithNewUser();

      await page.locator('#logout').click();

      await loginPage.signInWithAnchor({anchor});
    }
  );
});

testWithII.describe('with selector', () => {
  testWithII('should sign-in with a new user', async ({page, loginPage}) => {
    await page.goto('/');

    await loginPage.signInWithNewUser({selector: loginSelector});
  });

  testWithII(
    'should sign-in with an existing new user',
    async ({page, loginPage}) => {
      await page.goto('/');

      const anchor = await loginPage.signInWithNewUser({selector: loginSelector});

      await page.locator(logoutSelector).click();

      await loginPage.signInWithAnchor({anchor, selector: loginSelector});
    }
  );
});

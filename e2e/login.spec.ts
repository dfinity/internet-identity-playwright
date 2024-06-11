import {testWithII} from '../src';

const loginSelector = '#login';
const logoutSelector = '#logout';

testWithII.beforeEach(async ({iiPage, browser}) => {
  const DOCKER_CONTAINER_URL = 'http://127.0.0.1:5987';
  const DOCKER_INTERNET_IDENTITY_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  await iiPage.waitReady({url: DOCKER_CONTAINER_URL, canisterId: DOCKER_INTERNET_IDENTITY_ID});
});

testWithII.describe('without selector', () => {
  testWithII('should sign-in with a new user', async ({page, loginPage}) => {
    await page.goto('/');

    await loginPage.signInWithNewIdentity();
  });

  testWithII('should sign-in with an existing new user', async ({page, loginPage}) => {
    await page.goto('/');

    const identity = await loginPage.signInWithNewIdentity();

    await page.locator('#logout').click();

    await loginPage.signInWithIdentity({identity});
  });
});

testWithII.describe('with selector', () => {
  testWithII('should sign-in with a new user', async ({page, loginPage}) => {
    await page.goto('/');

    await loginPage.signInWithNewIdentity({selector: loginSelector});
  });

  testWithII('should sign-in with an existing new user', async ({page, loginPage}) => {
    await page.goto('/');

    const identity = await loginPage.signInWithNewIdentity({selector: loginSelector});

    await page.locator(logoutSelector).click();

    await loginPage.signInWithIdentity({identity, selector: loginSelector});
  });
});

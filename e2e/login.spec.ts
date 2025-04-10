import test from 'node:test';
import {testWithII} from '../src';

const loginSelector = '#login';
const logoutSelector = '#logout';

testWithII.beforeEach(async ({iiPage, browser}) => {
  const DOCKER_CONTAINER_URL = 'http://127.0.0.1:5987';
  const DOCKER_INTERNET_IDENTITY_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  await iiPage.waitReady({url: DOCKER_CONTAINER_URL, canisterId: DOCKER_INTERNET_IDENTITY_ID});
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

testWithII.describe.serial('create identity and manual sign-in', () => {
  let createdIdentity: number;

  testWithII('create identity and capture it', async ({page, iiPage}) => {
    await page.goto('/');
    createdIdentity = await iiPage.createNewIdentity();
  });

  testWithII('sign in using identity from list or fallback manually', async ({page, iiPage}) => {
    await page.goto('/');
    await iiPage.manuallySignInWithIdentity({identity: createdIdentity});
    await page.locator(logoutSelector).click();
    await iiPage.manuallySignInWithIdentity({identity: createdIdentity});
  });
});

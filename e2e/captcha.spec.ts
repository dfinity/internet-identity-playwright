import {testWithII} from '../src';

testWithII.beforeEach(async ({iiPage, browser}) => {
  const DOCKER_CONTAINER_URL = 'http://127.0.0.1:5987';
  const DOCKER_INTERNET_IDENTITY_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  await iiPage.waitReady({url: DOCKER_CONTAINER_URL, canisterId: DOCKER_INTERNET_IDENTITY_ID});
});

testWithII('should sign-in with a new user when II requires a captcha', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithNewIdentity({captcha: true});
});

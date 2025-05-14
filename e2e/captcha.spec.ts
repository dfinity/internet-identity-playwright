import {testWithII} from '../src';
import {DOCKER_CONTAINER} from './spec.constants';

testWithII.beforeEach(async ({iiPage}) => {
  await iiPage.waitReady(DOCKER_CONTAINER);
});

testWithII('should sign-in with a new user when II requires a captcha', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithNewIdentity({captcha: true, createPasskey: true});
});

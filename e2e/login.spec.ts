import {testWithInternetIdentity} from '../src';

const loginSelector = '#login';
const logoutSelector = '#logout';

testWithInternetIdentity.describe('without selector', () => {
  testWithInternetIdentity('should sign-in with a new user', async ({page, loginPage}) => {
    await page.goto('/');

    await loginPage.signInWithNewUser();
  });

  testWithInternetIdentity(
    'should sign-in with an existing new user',
    async ({page, loginPage}) => {
      await page.goto('/');

      const anchor = await loginPage.signInWithNewUser();

      await page.locator('#logout').click();

      await loginPage.signInWithAnchor({anchor});
    }
  );
});

testWithInternetIdentity.describe('with selector', () => {
  testWithInternetIdentity('should sign-in with a new user', async ({page, loginPage}) => {
    await page.goto('/');

    await loginPage.signInWithNewUser({selector: loginSelector});
  });

  testWithInternetIdentity(
    'should sign-in with an existing new user',
    async ({page, loginPage}) => {
      await page.goto('/');

      const anchor = await loginPage.signInWithNewUser({selector: loginSelector});

      await page.locator(logoutSelector).click();

      await loginPage.signInWithAnchor({anchor, selector: loginSelector});
    }
  );
});

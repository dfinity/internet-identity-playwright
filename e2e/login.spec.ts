import {testWithII} from '../src';

const loginSelector = '#login';
const logoutSelector = '#logout';

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

import {test as base} from '@playwright/test';
import {LoginPage} from './page-objects/LoginPage';

interface InternetIdentityFixtures {
  loginPage: LoginPage;
}

export const testWithII = base.extend<InternetIdentityFixtures>({
  loginPage: async ({page, context}, use) => {
    const loginPage = new LoginPage({page, context});
    await use(loginPage);
  }
});

export {expect} from '@playwright/test';

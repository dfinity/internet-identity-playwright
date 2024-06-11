import {test as base} from '@playwright/test';
import {LoginPage} from './page-objects/LoginPage';
import {InternetIdentityPage} from "./page-objects/InternetIdentityPage";

interface InternetIdentityFixtures {
  loginPage: LoginPage;
  iiPage: InternetIdentityPage;
}

export const testWithII = base.extend<InternetIdentityFixtures>({
  loginPage: async ({page, context}, use) => {
    const loginPage = new LoginPage({page, context});
    await use(loginPage);
  },

  iiPage: async ({page, browser}, use) => {
    const iiPage = new InternetIdentityPage({page, browser});
    await use(iiPage);
  }
});

export {expect} from '@playwright/test';

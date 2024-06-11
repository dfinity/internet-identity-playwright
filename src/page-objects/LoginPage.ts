import {expect, type BrowserContext, type Page} from '@playwright/test';

/**
 * A page object representing one page of your dApp that contains sign-in call to action for Internet Identity.
 */
export class LoginPage {
  private readonly page: Page;
  private readonly context: BrowserContext;

  /**
   * Creates an instance of LoginPage.
   * @param {Object} params - The parameters for the constructor.
   * @param {Page} params.page - The Page instance to initiate the login with Internet Identity a popup.
   * @param {BrowserContext} params.context - The isolated BrowserContext instance provided by Playwright, created for each test.
   */
  constructor({page, context}: {page: Page; context: BrowserContext}) {
    this.page = page;
    this.context = context;
  }

  /**
   * Signs in and create a new user.
   *
   * @param {Object} [params] - The optional arguments for the sign-in method.
   * @param {string} [params.selector] - The selector for the login button. Defaults to [data-tid=login-button].
   * @returns {Promise<number>} A promise that resolves to the new identity number.
   */
  signInWithNewIdentity = async (params?: {selector?: string}): Promise<number> => {
    const iiPagePromise = this.context.waitForEvent('page');

    await this.page.locator(params?.selector ?? '[data-tid=login-button]').click();

    const iiPage = await iiPagePromise;
    await expect(iiPage).toHaveTitle('Internet Identity');

    await iiPage.locator('#registerButton').click();
    await iiPage.locator('[data-action=construct-identity]').click();

    await iiPage.locator('input#captchaInput').fill('a');
    await iiPage.locator('#confirmRegisterButton').click();

    const identity = await iiPage.locator('#userNumber').textContent();
    expect(identity).not.toBeNull();

    await iiPage.locator('#displayUserContinue').click();
    await iiPage.waitForEvent('close');
    expect(iiPage.isClosed()).toBe(true);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return parseInt(identity!);
  };

  /**
   * Signs in with an existing identity.
   * @param {Object} params - The parameters for the sign-in method.
   * @param {string} [params.selector] - The selector for the login button. Defaults to [data-tid=login-button].
   * @param {number} params.identity - The identity number.
   * @returns {Promise<void>} A promise that resolves when the sign-in process is complete.
   */
  signInWithIdentity = async ({
    selector,
    identity
  }: {
    selector?: string;
    identity: number;
  }): Promise<void> => {
    const iiPagePromise = this.context.waitForEvent('page');

    await this.page.locator(selector ?? '[data-tid=login-button]').click();

    const iiPage = await iiPagePromise;
    await expect(iiPage).toHaveTitle('Internet Identity');

    await iiPage.locator(`[data-anchor-id='${identity}']`).click();
    await iiPage.locator('[data-action=cancel]').click();
    await iiPage.waitForEvent('close');
    expect(iiPage.isClosed()).toBe(true);
  };
}

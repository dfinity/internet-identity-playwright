import {expect, type Browser, type BrowserContext, type Page} from '@playwright/test';

/**
 * A page object to test Internet Identity.
 */
export class InternetIdentityPage {
  private readonly page: Page;
  private readonly browser: Browser;
  private readonly context: BrowserContext;

  /**
   * Creates an instance of InternetIdentityPage.
   *
   * @param {Object} params - The parameters for the constructor.
   * @param {Page} params.page - The Page instance to interact with Internet Identity a single tab in a Browser.
   * @param {BrowserContext} params.context - The isolated BrowserContext instance provided by Playwright, created for each test.
   * @param {Browser} params.browser - The browser launched by Playwright.
   */
  constructor({page, context, browser}: {page: Page; context: BrowserContext; browser: Browser}) {
    this.page = page;
    this.browser = browser;
    this.context = context;
  }

  /**
   * Waits until the Internet Identity page is ready.
   *
   * @param {Object} params - The parameters for the waitReady method.
   * @param {string} params.url - The root URL of the Internet Identity page. e.g. https://identity.internetcomputer.org, http://localhot:4973 or http://127.0.0.1:5987
   * @param {string} [params.canisterId] - An optional canister ID. If provided, will be added to the url parameter.
   * @param {number} [params.timeout] - } [params.timeout] - An optional timeout period in milliseconds for the function to wait until Internet Identity is mounted. Defaults to 60000 milliseconds.
   * @returns {Promise<void>} A promise that resolves when the page is ready.
   */
  waitReady = async ({
    url: rootUrl,
    canisterId,
    timeout = 60000
  }: {
    url: string;
    canisterId?: string;
    timeout?: number;
  }): Promise<void> => {
    const {host: containerHost, protocol} = new URL(rootUrl);

    const urlWithCanisterId = (): string =>
      this.browser.browserType().name() === 'webkit'
        ? `${protocol}//${containerHost}?canisterId=${canisterId}`
        : `${protocol}//${canisterId}.${containerHost.replace('127.0.0.1', 'localhost')}`;

    const url = canisterId !== undefined ? urlWithCanisterId() : rootUrl;

    const isInternetIdentityReady = async (): Promise<boolean> => {
      try {
        const response = await this.page.goto(url, {waitUntil: 'domcontentloaded'});
        return response?.ok() ?? false;
      } catch (_e: unknown) {
        return false;
      }
    };

    const retryInMilliseconds = 500;

    const waitInternetIdentityReady = async ({
      count
    }: {
      count: number;
    }): Promise<'ready' | 'timeout'> => {
      const ready = await isInternetIdentityReady();

      if (ready) {
        return 'ready';
      }

      const nextCount = count - 1;

      if (nextCount === 0) {
        return 'timeout';
      }

      await new Promise((resolve) => setTimeout(resolve, retryInMilliseconds));

      return await waitInternetIdentityReady({count: nextCount});
    };

    const status = await waitInternetIdentityReady({count: timeout / retryInMilliseconds});
    expect(status).toEqual('ready');

    await expect(this.page).toHaveTitle('Internet Identity');

    const registerButton = this.page.locator('#registerButton');
    expect(registerButton).not.toBeNull();
  };

  /**
   * Signs in and create a new user.
   *
   * @param {Object} [params] - The optional arguments for the sign-in method.
   * @param {string} [params.selector] - The selector for the login button. Defaults to [data-tid=login-button].
   * @param {boolean} [params.captcha] - Set to true if the II login flow requires a captcha.
   * @returns {Promise<number>} A promise that resolves to the new identity number.
   */
  signInWithNewIdentity = async (params?: {
    selector?: string;
    captcha?: boolean;
  }): Promise<number> => {
    const iiPagePromise = this.context.waitForEvent('page');

    await this.page.locator(params?.selector ?? '[data-tid=login-button]').click();

    const iiPage = await iiPagePromise;
    await expect(iiPage).toHaveTitle('Internet Identity');

    await iiPage.locator('#registerButton').click();
    await iiPage.locator('[data-action=construct-identity]').click();

    if (params?.captcha === true) {
      await iiPage.locator('input#captchaInput').fill('a', {timeout: 10000});
      await iiPage.locator('#confirmRegisterButton').click();
    }

    const identity = await iiPage.locator('#userNumber').textContent();
    expect(identity).not.toBeNull();

    await iiPage.locator('#displayUserContinue').click();
    await iiPage.waitForEvent('close');
    expect(iiPage.isClosed()).toBe(true);

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
    await iiPage.waitForEvent('close');
    expect(iiPage.isClosed()).toBe(true);
  };

  createNewIdentity = async (params?: {
    selector?: string;
    captcha?: boolean;
  }): Promise<number> => {
    const iiPagePromise = this.context.waitForEvent('page');

    await this.page.locator(params?.selector ?? '[data-tid=login-button]').click();

    const iiPage = await iiPagePromise;
    await expect(iiPage).toHaveTitle('Internet Identity');

    await iiPage.locator('#registerButton').click();
    await iiPage.locator('[data-action=construct-identity]').click();

    if (params?.captcha === true) {
      await iiPage.locator('input#captchaInput').fill('a', {timeout: 10000});
      await iiPage.locator('#confirmRegisterButton').click();
    }

    const identityText = await iiPage.locator('#userNumber').textContent();
    const createdIdentity = parseInt(identityText!);
    expect(createdIdentity).not.toBeNull();
    return createdIdentity;
  }

  manuallySignInWithIdentity = async ({
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

    const existingIdentityLoginLocator = iiPage.locator(`[data-anchor-id="${identity}"]`);
    const firstRunManualLoginLocator = iiPage.locator('#loginButton');
    const moreOptionsLoginLocator = iiPage.locator('[data-role="more-options"]');

    const waitOptions: { state: 'visible'; timeout: number } = { state: 'visible', timeout: 10000 };

    type RaceResult = 'existingIdentityLogin' | 'firstRunManualLogin' | 'moreOptionsLogin' | 'none';

    async function getRaceResult(
      locator: { waitFor: (options: any) => Promise<any> },
      successResult: RaceResult
    ): Promise<RaceResult> {
      try {
        await locator.waitFor(waitOptions);
        return successResult;
      } catch {
        return 'none';
      }
    }

    const identityPromise = getRaceResult(existingIdentityLoginLocator, 'existingIdentityLogin');
    const firstTimePromise = getRaceResult(firstRunManualLoginLocator, 'firstRunManualLogin');
    const fallbackPromise = getRaceResult(moreOptionsLoginLocator, 'moreOptionsLogin');

    const result: RaceResult = await Promise.race([
      identityPromise,
      fallbackPromise,
      firstTimePromise,
    ]);

    switch(result) {
      case 'existingIdentityLogin':
        await existingIdentityLoginLocator.first().click({ force: true });
        break;

      case 'firstRunManualLogin':
      case 'moreOptionsLogin': {
        const locator =
          result === 'firstRunManualLogin' ? firstRunManualLoginLocator : moreOptionsLoginLocator;
        await locator.click({ force: true });
        await iiPage.fill('input[data-role="anchor-input"]', identity.toString());
        await iiPage.locator('[data-action="continue"]').click();
        break;
      }
      default:
        throw new Error(
          'No locator found for Buttons: existingIdentity, firstRunManualLogin or moreOptionsLogin'
        );
    }
    await iiPage.waitForEvent('close');
    expect(iiPage.isClosed()).toBe(true);
  };
}

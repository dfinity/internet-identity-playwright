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

    const mainSignInBtn = this.page.locator('button:has-text("Sign in")');
    await mainSignInBtn.isVisible();
  };

  /**
   * Signs in a very first time with Internet Identity.
   *
   * @param {Object} [params] - The optional arguments for the sign-in method.
   * @param {string} [params.selector] - The selector for the login button. Defaults to [data-tid=login-button].
   * @returns {Promise<void>} A promise that resolves once the authentication flow is completed.
   */
  signInWithFirstPasskey = async (params?: {selector?: string}): Promise<void> => {
    const signInFlow = async ({iiPage}: {iiPage: Page}) => {
      const initWizardBtn = iiPage.locator('button:has-text("Continue with passkey")');
      await initWizardBtn.waitFor({state: 'visible'});
      await initWizardBtn.click();

      // "Use existing identity" actually seems to create an identity in test mode.
      // The option "Create new identity" adds a step in the flow to provide a name for the passkey
      // which seems ignored anyway as the resulting first identity is named by default "My account"
      const createBtn = iiPage.locator('button:has-text("Use existing identity")');
      await createBtn.waitFor({state: 'visible'});
      await createBtn.click();

      const continueBtn = iiPage.locator('button:has-text("Continue")');
      await continueBtn.waitFor({state: 'visible'});
      await continueBtn.click();
    };

    await this.#signIn({
      ...(params ?? {}),
      signInFlow
    });
  };

  /**
   * Signs again with Internet Identity by using the very first passkey that was created.
   *
   * @param {Object} [params] - The optional arguments for the sign-in method.
   * @param {string} [params.selector] - The selector for the login button. Defaults to [data-tid=login-button].
   * @returns {Promise<void>} A promise that resolves once the authentication flow is completed.
   */
  signInWithExistingPasskey = async (params?: {selector?: string}): Promise<void> => {
    const signInFlow = async ({iiPage}: {iiPage: Page}) => {
      await iiPage.locator('button:has-text("Continue")').click();
    };

    await this.#signIn({
      ...(params ?? {}),
      signInFlow
    });
  };

  async #signIn({
    selector,
    signInFlow
  }: {
    selector?: string;
    signInFlow: (params: {iiPage: Page}) => Promise<void>;
  }) {
    // Init sign-in by clicking on the login button in the tested application
    const iiPagePromise = this.context.waitForEvent('page');

    await this.page.locator(selector ?? '[data-tid=login-button]').click();

    // Wait for II
    const iiPage = await iiPagePromise;

    await expect(iiPage).toHaveTitle('Internet Identity');

    // Execute sign-in test flow
    await signInFlow({iiPage});

    // Await for completion and II being closed
    await iiPage.waitForEvent('close');

    expect(iiPage.isClosed()).toBe(true);
  }
}

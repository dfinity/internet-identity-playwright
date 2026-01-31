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

    const mainSignInBtn = this.page.getByRole('button', {name: 'Sign in', exact: true});
    await mainSignInBtn.isVisible();
  };

  /**
   * Signs in with Internet Identity using passkey authentication by default.
   *
   * Note: the function automatically detects whether this is a first-time passkey flow or an existing passkey flow.
   *
   * @param {Object} [params] - The optional arguments for the sign-in method.
   * @param {Object|null} [params.passkey] - Passkey authentication options. Defaults to null (no particular options).
   * @param {string} [params.passkey.selector] - The selector for the login button in your application. Defaults to [data-tid=login-button].
   * @returns {Promise<void>} A promise that resolves once the authentication flow is completed and the II page instance is closed.
   */
  signIn = async (
    params: {
      passkey: {
        selector?: string;
      } | null;
    } = {passkey: null}
  ) => {
    const signInFlow = async ({iiPage}: {iiPage: Page}) => {
      const continueWithFirstPasskey = 'Continue with passkey';
      const continueWithExistingPasskey = 'Continue';

      // The flows are different if it's the very first passkey - e.g. there is no browser cache - or
      // if the passkey (default account) is being reused. That's why here we try to detect which flow
      // should be executed. This way, we hide the complexity for the consumer of the plugin.
      const mainBtn = iiPage
        .getByRole('button', {name: continueWithFirstPasskey, exact: true})
        .or(iiPage.getByRole('button', {name: continueWithExistingPasskey, exact: true}));

      await mainBtn.isVisible();

      const isFirstPasskey = iiPage.getByRole('button', {
        name: continueWithFirstPasskey,
        exact: true
      });

      const fn = (await isFirstPasskey.isVisible())
        ? this.#signInWithFirstPasskey
        : this.#signInWithExistingPasskey;

      await fn({iiPage});
    };

    await this.#executeSignIn({
      selector: params?.passkey?.selector,
      signInFlow
    });
  };

  /**
   * Signs in a very first time with Internet Identity.
   *
   * @param {Object} [params] - The optional arguments for the sign-in method.
   * @param {Page} params.iiPage - The Internet Identity page instance.
   * @returns {Promise<void>} A promise that resolves once the authentication flow is completed.
   * @private
   */
  #signInWithFirstPasskey = async ({iiPage}: {iiPage: Page}): Promise<void> => {
    const initWizardBtn = iiPage.getByRole('button', {
      name: 'Continue with passkey',
      exact: true
    });
    await initWizardBtn.waitFor({state: 'visible'});
    await initWizardBtn.click();

    const createBtn = iiPage.getByRole('button', {name: 'Create new identity', exact: true});
    await createBtn.waitFor({state: 'visible'});
    await createBtn.click();

    const nameInput = iiPage.locator('input[placeholder="Identity name"]');
    await nameInput.waitFor({state: 'visible'});
    await nameInput.fill('Test');

    await iiPage.getByRole('button', {name: 'Create identity', exact: true}).click();

    const continueBtn = iiPage.getByRole('button', {name: 'Continue', exact: true});
    await continueBtn.waitFor({state: 'visible'});
    await continueBtn.click();
  };

  /**
   * Signs again with Internet Identity by using the very first passkey that was created.
   *
   * @param {Object} [params] - The optional arguments for the sign-in method.
   * @param {Page} params.iiPage - The Internet Identity page instance.
   * @returns {Promise<void>} A promise that resolves once the authentication flow is completed.
   * @private
   */
  #signInWithExistingPasskey = async ({iiPage}: {iiPage: Page}): Promise<void> => {
    await iiPage.getByRole('button', {name: 'Continue', exact: true}).click();
  };

  /**
   * Executes the Internet Identity sign-in flow by coordinating between the application page
   * and the Internet Identity popup/tab.
   *
   * @param {Object} params - The parameters for executing the sign-in flow.
   * @param {string} [params.selector] - The selector for the login button in your application. Defaults to [data-tid=login-button].
   * @param {Function} params.signInFlow - A callback function that executes the authentication steps on the Internet Identity page.
   * @param {Page} params.signInFlow.iiPage - The Internet Identity page instance passed to the callback.
   * @returns {Promise<void>} A promise that resolves once the complete authentication flow is finished and the Internet Identity page is closed.
   * @private
   */
  async #executeSignIn({
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

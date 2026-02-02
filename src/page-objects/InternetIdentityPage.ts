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
   * @param {string} [params.passkey.account] - The account to sign in with. Defaults to "Test". If provided, an existing or new account will be used for the sign-in.
   * @returns {Promise<void>} A promise that resolves once the authentication flow is completed and the II page instance is closed.
   */
  signIn = async (
    {
      passkey
    }: {
      passkey: {
        selector?: string;
        account?: string;
      } | null;
    } = {passkey: null}
  ) => {
    const signInFlow = async ({iiPage}: {iiPage: Page}) => {
      // If there was a previous sign-in within same session we have to use the multiple accounts selection
      // otherwise the selected account might just be the default one created by Internet Identity.
      const switchIdentityBtn = iiPage.getByRole('button', {name: 'Switch identity'});

      const switchIdentityExists = async (): Promise<boolean> => {
        try {
          await switchIdentityBtn.waitFor({state: 'visible', timeout: 2000});
          return true;
        } catch {
          return false;
        }
      };

      if (
        (await switchIdentityExists()) &&
        ((passkey?.account === undefined && (await switchIdentityBtn.innerText())) !== 'Test' ||
          (passkey?.account !== undefined &&
            (await switchIdentityBtn.innerText()) !== passkey.account))
      ) {
        await this.#signInWithMultiAccount({iiPage, passkey});
        return;
      }

      const continueWithFirstPasskey = 'Continue with passkey';
      const continueWithExistingPasskey = 'Continue';

      // The flows are different if it's the very first passkey - e.g. there is no browser cache - or
      // if the passkey (default account) is being reused. That's why here we try to detect which flow
      // should be executed. This way, we hide the complexity for the consumer of the plugin.
      await Promise.race([
        iiPage
          .getByRole('button', {name: continueWithFirstPasskey, exact: true})
          .waitFor({state: 'visible'}),
        iiPage
          .getByRole('button', {name: continueWithExistingPasskey, exact: true})
          .waitFor({state: 'visible'})
      ]);

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
      selector: passkey?.selector,
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

    // We try to always reuse the default identity as the "Continue" button, if no account is selected
    // always fallback on the first default identity created.
    const existingBtn = iiPage.getByRole('button', {name: 'Use existing identity', exact: true});
    await existingBtn.waitFor({state: 'visible'});
    await existingBtn.click();

    // When starting test with a fresh state, there is no default identity at all and one should be created.
    const errorToast = iiPage.getByText(
      "Cannot read properties of undefined (reading 'anchor_number')"
    );

    const hasNoDefaultIdentity = async (): Promise<boolean> => {
      try {
        await errorToast.waitFor({state: 'visible', timeout: 2000});
        return true;
      } catch {
        return false;
      }
    };

    if (await hasNoDefaultIdentity()) {
      const createBtn = iiPage.getByRole('button', {name: 'Create new identity', exact: true});
      await createBtn.waitFor({state: 'visible'});
      await createBtn.click();

      const nameInput = iiPage.locator('input[placeholder="Identity name"]');
      await nameInput.waitFor({state: 'visible'});
      await nameInput.fill('Test');

      await iiPage.getByRole('button', {name: 'Create identity', exact: true}).click();
    }

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

  /**
   * Signs in with Internet Identity using multiple accounts.
   *
   * This method toggles the multiple accounts feature, checks if the requested account exists,
   * and either selects it or creates a new account with the provided name.
   *
   * Note: Internet Identity creates the first account with the name "My account" regardless of
   * the name provided during the original creation flow.
   *
   * @param {Object} params - The optional arguments for the sign-in method.
   * @param {Page} params.iiPage - The Internet Identity page instance.
   * @param {Object} params.passkey - Passkey authentication options.
   * @param {string} params.passkey.account - The account name to sign in with or create.
   * @returns {Promise<void>} A promise that resolves once the authentication flow is completed.
   * @private
   */
  #signInWithMultiAccount = async ({
    iiPage,
    passkey
  }: {
    iiPage: Page;
    passkey: {
      account?: string;
    } | null;
  }): Promise<void> => {
    const account = passkey?.account ?? 'My account';

    const multiAccountsToggle = iiPage.getByRole('switch', {name: 'Enable multiple accounts'});
    await multiAccountsToggle.click();
    await multiAccountsToggle.waitFor({state: 'visible'});

    const accountList = iiPage.locator('ul[aria-label="Choose an account"]');

    const selectedAccount = accountList.getByRole('button', {
      name: `Continue with ${account}`
    });

    const selectedAccountExists = async (): Promise<boolean> => {
      try {
        await selectedAccount.waitFor({state: 'visible', timeout: 2000});
        return true;
      } catch {
        return false;
      }
    };

    // The account already exists. Select it to proceed with the sign-in
    if (await selectedAccountExists()) {
      await selectedAccount.click();
      return;
    }

    const addAccountBtn = iiPage.getByRole('button', {name: 'Add another account', exact: true});
    await addAccountBtn.waitFor({state: 'visible'});
    await addAccountBtn.click();

    const nameInput = iiPage.locator('input[placeholder="Account name"]');
    await nameInput.waitFor({state: 'visible'});
    await nameInput.fill(account);

    // We define the button as default sign-in assuming that the consumer might want to login again in next test.
    const defaultSignInBtn = iiPage.getByRole('checkbox', {
      name: 'Set as default sign-in',
      exact: true
    });
    await defaultSignInBtn.waitFor({state: 'visible'});
    await defaultSignInBtn.click();

    const createBtn = iiPage.getByRole('button', {name: 'Create account', exact: true});
    await createBtn.waitFor({state: 'visible'});
    await createBtn.click();

    const selectNewAccount = accountList.getByRole('button', {
      name: `Continue with ${account}`
    });
    await selectNewAccount.click();
  };
}

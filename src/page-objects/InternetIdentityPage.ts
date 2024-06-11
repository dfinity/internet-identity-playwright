import {expect, type Page, Browser} from '@playwright/test';

/**
 * A page object to test Internet Identity.
 */
export class InternetIdentityPage {
    private readonly page: Page;
    private readonly browser: Browser;

    /**
     * Creates an instance of InternetIdentityPage.
     *
     * @param {Object} params - The parameters for the constructor.
     * @param {Page} params.page - The Page instance to interact with Internet Identity a single tab in a Browser,
     * @param {Browser} params.browser - The browser launched by Playwright.
     */
    constructor({page, browser}: { page: Page; browser: Browser }) {
        this.page = page;
        this.browser = browser;
    }

    /**
     * Waits until the Internet Identity page is ready.
     *
     * @param {Object} params - The parameters for the waitReady method.
     * @param {string} params.url - The root URL of the Internet Identity page. e.g. https://identity.internetcomputer.org, http://localhot:4973 or http://127.0.0.1:5987
     * @param {string} [params.canisterId] - An optional canister ID. If provided, will be added to the url parameter.
     * @returns {Promise<void>} A promise that resolves when the page is ready.
     */
    waitReady = async ({url: rootUrl, canisterId}: {url: string, canisterId?: string}): Promise<void> => {
        const {host: containerHost, protocol} = new URL(rootUrl);

        const urlWithCanisterId = (): string => this.browser.browserType().name() === "webkit"
            ? `${protocol}//${containerHost}?canisterId=${canisterId}`
            : `${protocol}//${canisterId}.${containerHost.replace('127.0.0.1', 'localhost')}`;

        const url = canisterId !== undefined ? urlWithCanisterId() : rootUrl;

        const isInternetIdentityReady = async (): Promise<boolean> => {
            try {
                const response = await this.page.goto(url, {waitUntil: "domcontentloaded"});
                return response?.ok() ?? false;
            } catch (e: unknown) {
                return false;
            }
        }

        const waitInternetIdentityReady = async ({count}: {count: number;}): Promise<'ready' | 'timeout'> => {
            const ready = await isInternetIdentityReady();

            if (ready) {
                return 'ready';
            }

            const nextCount = count - 1;

            if (nextCount === 0) {
                return 'timeout';
            }

            await new Promise((resolve) => setTimeout(resolve, 500));

            return waitInternetIdentityReady({ count: nextCount });
        };

        const status = await waitInternetIdentityReady({count: 60000 / 500});
        expect(status).toEqual("ready");

        await expect(this.page).toHaveTitle('Internet Identity');

        const registerButton = this.page.locator('#registerButton');
        expect(registerButton).not.toBeNull();
    }
}
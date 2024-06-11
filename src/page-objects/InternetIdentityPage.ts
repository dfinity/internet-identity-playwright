import {expect, type BrowserContext, type Page} from '@playwright/test';

export class InternetIdentityPage {
    private readonly page: Page;
    private readonly context: BrowserContext;

    constructor({page, context}: { page: Page; context: BrowserContext }) {
        this.page = page;
        this.context = context;
    }

    waitReady = async ({url}: {url: string}): Promise<void> => {
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
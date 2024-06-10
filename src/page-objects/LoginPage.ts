import {expect, type BrowserContext, type Page} from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly context: BrowserContext;

  constructor({page, context}: {page: Page; context: BrowserContext}) {
    this.page = page;
    this.context = context;
  }

  signInWithNewUser = async (args?: {selector?: string}): Promise<number> => {
    const iiPagePromise = this.context.waitForEvent('page');

    await this.page.locator(args?.selector ?? '[data-tid=login-button]').click();

    const iiPage = await iiPagePromise;
    await expect(iiPage).toHaveTitle('Internet Identity');

    await iiPage.locator('#registerButton').click();
    await iiPage.locator('[data-action=construct-identity]').click();

    await iiPage.locator('input#captchaInput').fill('a');
    await iiPage.locator('#confirmRegisterButton').click();

    const anchor = await iiPage.locator('#userNumber').textContent();
    expect(anchor).not.toBeNull();

    await iiPage.locator('#displayUserContinue').click();
    await iiPage.waitForEvent('close');
    expect(iiPage.isClosed()).toBe(true);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return parseInt(anchor!);
  };

  signInWithAnchor = async ({
    selector,
    anchor
  }: {
    selector?: string;
    anchor: number;
  }): Promise<void> => {
    const iiPagePromise = this.context.waitForEvent('page');

    await this.page.locator(selector ?? '[data-tid=login-button]').click();

    const iiPage = await iiPagePromise;
    await expect(iiPage).toHaveTitle('Internet Identity');

    await iiPage.locator(`[data-anchor-id='${anchor}']`).click();
    await iiPage.locator('[data-action=cancel]').click();
    await iiPage.waitForEvent('close');
    expect(iiPage.isClosed()).toBe(true);
  };
}

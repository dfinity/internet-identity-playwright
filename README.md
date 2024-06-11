# 🔐 Internet Identity Playwright

A [Playwright](https://playwright.dev/) library to simplify the integration of [Internet Identity](https://identity.internetcomputer.org) authentication in E2E tests.

<div align="center" style="display:flex;flex-direction:column;">
<br/>

[![Internet Computer portal](https://img.shields.io/badge/Internet-Computer-grey?logo=internet%20computer)](https://internetcomputer.org)
[![GitHub CI Checks Workflow Status](https://img.shields.io/github/actions/workflow/status/dfinity/internet-identity-playwright/checks.yml?logo=github&label=CI%20checks)](https://github.com/dfinity/internet-identity-playwright/actions/workflows/checks.yml)
[![GitHub CI Tests Workflow Status](https://img.shields.io/github/actions/workflow/status/dfinity/internet-identity-playwright/tests.yml?logo=github&label=CI%20tests)](https://github.com/dfinity/internet-identity-playwright/actions/workflows/tests.yml)

</div>

## 🚀 Introduction

This repository offers Playwright fixtures designed to assist developers in creating end-to-end (E2E) tests for dApps utilizing Internet Identity. These pre-built scenarios allow developers to seamlessly integrate authentication flows, including the creation and reuse of identities, without needing to implement the flows themselves.

## 🖥️ Installation

```bash
# with npm
npm install --save-dev @dfinity/internet-identity-playwright
# with pnpm
pnpm add --save-dev @dfinity/internet-identity-playwright
# with yarn
yarn add -D @dfinity/internet-identity-playwright
```

## ✍️ Usage

To use the Internet Identity Playwright fixtures, follow these steps:

### 1. Import the Fixtures

In your Playwright test file, import the fixtures provided by this library.

```javascript
import {testWithII} from '@dfinity/internet-identity-playwright';
```

### 2. Write Your Tests

Use the extended fixtures in your tests to perform authentication flows.

```javascript
testWithII('should sign-in with a new user', async ({page, loginPage}) => {
  await page.goto('/');

  await loginPage.signInWithNewIdentity();
});

testWithII('should sign-in with an existing new user', async ({page, loginPage}) => {
  await page.goto('/');

  const identity = await loginPage.signInWithNewIdentity();

  await page.locator('#logout').click();

  await loginPage.signInWithIdentity({identity});
});
```

The `loginPage` object represents the page of your application that contains the call to action to start the authentication flow with Internet Identity. By default, the fixture will search for a button identified by the attribute `[data-tid=login-button]`. You can customize this behavior by providing your own selector.

```javascript
const loginSelector = '#login';

testWithII('should sign-in with a new user', async ({page, loginPage}) => {
  await page.goto('/');

  await loginPage.signInWithNewIdentity({selector: loginSelector});
});

testWithII('should sign-in with an existing new user', async ({page, loginPage}) => {
  await page.goto('/');

  const identity = await loginPage.signInWithNewIdentity({selector: loginSelector});

  await page.locator(logoutSelector).click();

  await loginPage.signInWithIdentity({identity, selector: loginSelector});
});
```

### 3. Wait for Internet Identity (optional)

You might encounter scenarios where you perform tests against a local replica started in parallel with your tests, commonly when automating the tests in a CI environment. The library also exposes a fixture that lets you wait for Internet Identity to be ready.

For example, you can provide the local replica URL and the canister ID on which Internet Identity has been deployed:

```javascript
testWithII.beforeEach(async ({iiPage, browser}) => {
  const url = 'http://127.0.0.1:4943';
  const canisterId = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  await iiPage.waitReady({url, canisterId});
});
```

### 4. Run Your Tests

Run your Playwright tests as usual.

```bash
npx playwright test
```

## 💁‍♂️️ Tips & tricks

### Example Test

You can find an example test in the following file: [login.spec.ts](./e2e/login.spec.ts).

### Running Tests Locally

To run these tests locally, you'll need to install the Juno CLI. Follow the steps below:

1. Install Juno CLI:

```bash
npm i -g @junobuild/cli
```

2. Start the Demo Application:

Navigate to the [demo](./demo) directory and start the application using the Juno CLI:

```bash
cd demo
juno dev start
```

3. Run the Tests:

Return to the root directory and execute the tests:

```
npm run e2e
```

## 🧑‍🤝‍🧑 Community

- [Forum](https://forum.dfinity.org/)
- [Discord](https://discord.gg/E9FxceAg2j)

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
testWithII('should sign-in with a new user', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithNewIdentity();
});

testWithII('should sign-in with an existing new user', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithIdentity({identity: 10003});
});
```

The `iiPage` object represents the page of your application that contains the call to action to start the authentication flow with Internet Identity. By default, the fixture will search for a button identified by the attribute `[data-tid=login-button]`. You can customize this behavior by providing your own selector.

```javascript
const loginSelector = '#login';

testWithII('should sign-in with a new user', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithNewIdentity({selector: loginSelector});
});

testWithII('should sign-in with an existing new user', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithIdentity({identity: 10003, selector: loginSelector});
});
```

The plugin defaults to an Internet Identity sign-in flow that does not require captcha. If you wish to set up a test that requires this validation, you can pass the option `captcha` set to `true` when initializing a new user:

```javascript
testWithII('should sign-in with a new user when II requires a captcha', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithNewIdentity({captcha: true});
});
```

Similarly, you can test a flow where Internet Identity requires the user to create and save a passkey:

```javascript
testWithII('should sign in with a new user when II requires a passkey', async ({page, iiPage}) => {
  await page.goto('/');

  await iiPage.signInWithNewIdentity({createPasskey: true});
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

The function also accepts an optional timeout parameter to specify how long the function should wait for Internet Identity to be mounted, with a default value of 60000 milliseconds.

```javascript
testWithII.beforeEach(async ({iiPage, browser}) => {
  const url = 'http://127.0.0.1:4943';
  const canisterId = 'rdmx6-jaaaa-aaaaa-aaadq-cai';
  const timeout = 30000;

  await iiPage.waitReady({url, canisterId, timeout});
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

1. Install Docker:

Make sure you have Docker installed on your machine ([Windows](https://docs.docker.com/desktop/install/windows-install/), [MacOS](https://docs.docker.com/desktop/install/mac-install/), or [Linux](https://docs.docker.com/desktop/install/linux-install/)).

> [!NOTE]
> For MacBooks with M processors, it is important to use Docker Desktop version 4.25.0 or later, ideally the latest available version.

2. Start the Demo Application:

Navigate to the [demo](./demo) directory and start the application using Docker:

```bash
cd demo
docker compose up
```

4. Run the Tests:

Return to the root directory and execute the tests:

```bash
npm run e2e
```

### Running Captcha Tests Locally

The default test suite validates the use of Internet Identity without captcha requirements. To test a flow with captcha, run the following command in the `demo` directory:

```bash
docker compose -f docker-compose.captcha.yml up
```

Then, navigate to the root directory and run the dedicated test:

```bash
npm run e2e:captcha
```

### Running Required Passkey Tests Locally

The default test suite validates the use of the latest Internet Identity, which does not require the user to complete a specific step to create a passkey. To test a flow where passkey creation is required, run the following command from the `demo` directory:

```bash
docker compose -f docker-compose.passkey.yml up
```

Then, navigate to the root directory and run the dedicated test:

```bash
npm run e2e:passkey
```

## 🚧 Limitations

Currently, the library's fixtures cannot be implemented with Playwright's ability to [load existing authenticated state](https://playwright.dev/docs/auth). Playwright currently does not support IndexedDB for such features. This limitation is tracked in their [GitHub issue #11164](https://github.com/microsoft/playwright/issues/11164).

While it is technically possible to use local storage instead of IndexedDB, this approach is generally discouraged as it does not reflect how identities are stored in the browser. We prefer to adhere to best practices for testing to ensure the most accurate simulation of real-world scenarios.

## 🧑‍🤝‍🧑 Community

- [Forum](https://forum.dfinity.org/)
- [Discord](https://discord.internetcomputer.org)

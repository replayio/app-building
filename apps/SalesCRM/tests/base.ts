import { test as baseTest, expect } from '@playwright/test';

export { expect };

export const test = baseTest.extend({});

test.beforeEach(async ({}, testInfo) => {
  const msg = {
    event: 'test:start',
    test: testInfo.title,
    file: testInfo.file,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(msg));
});

test.afterEach(async ({}, testInfo) => {
  const msg = {
    event: 'test:end',
    test: testInfo.title,
    file: testInfo.file,
    status: testInfo.status,
    duration: testInfo.duration,
    timestamp: new Date().toISOString(),
    ...(testInfo.error ? { error: testInfo.error.message } : {}),
  };
  console.log(JSON.stringify(msg));
});

const reader = require('../src');

let performance;
try {
  ({ performance } = require('perf_hooks'));
} catch (e) {
  performance = {
    now() {
      return +new Date();
    },
  };
}

const { describe, test, expect } = global;
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

describe('reader tests', () => {
  test("it handles file's first line correctly", () =>
    new Promise((resolve) => {
      let handled = false;
      const handler = (data) => {
        if (!handled) {
          expect(data).toEqual('1,Stormi,Abrey,sabrey0@timesonline.co.uk,Female,240.183.181.121'.split(','));
        }
        handled = true;
        resolve();
      };
      reader('__tests__/test_data.csv', handler, { hasHeader: true });
    }));

  test('it processes limited operation count at the time', () =>
    new Promise((resolve) => {
      let handleCount = 0;
      const handler = async (data, cb) => {
        if (++handleCount === 2) {
          await sleep(10);
          expect(handleCount).toBe(2);
          resolve();
        } else {
          setTimeout(cb, 1e5);
        }
      };
      reader('__tests__/test_data.csv', handler, { hasHeader: true, operationLimit: 2 });
    }));

  test('it pauses stream when operationLimit reached', () =>
    new Promise((resolve) => {
      let handleCount = 0;
      const handler = async (data, cb) => {
        if (++handleCount === 1) {
          await sleep(10);
          expect(handleCount).toBe(1);
          await cb();
          await sleep(10);
          expect(handleCount).toBe(2);
          resolve();
        }
      };
      reader('__tests__/test_data.csv', handler, { hasHeader: true, operationLimit: 1 });
    }));

  test('it measures performance', () =>
    new Promise((resolve) => {
      let handleCount = 0;
      const startTime = performance.now();
      const handler = async (data, cb) => {
        if (++handleCount === 100) {
          console.log(`100 lines in: ${performance.now() - startTime}`);
          expect(true).toBe(true);
          resolve();
        }
      };
      reader('__tests__/test_data.csv', handler, { hasHeader: true });
    }));
});

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
  test("it handles file's first line correctly", async () => {
    let handled = false;
    const handler = async (data) => {
      if (!handled) {
        expect(data).toEqual('1,Stormi,Abrey,sabrey0@timesonline.co.uk,Female,240.183.181.121'.split(','));
      }
      handled = true;
    };
    await reader('__tests__/test_data.csv', handler, { skipHeader: true });
  });

  test('it processes limited operation count at the time', async () => {
    let handleCount = 0;
    const handler = async () => {
      if (++handleCount === 2) {
        await sleep(10);
        expect(handleCount).toBe(2);
      } else {
        await sleep(1e3);
      }
    };
    reader('__tests__/test_data.csv', handler, { skipHeader: true, operationLimit: 2 });
  });

  test('it reads incorrect file', async () => {
    let handleCount = 0;
    const handler = async () => {
      if (++handleCount === 2) {
        await sleep(10);
        expect(handleCount).toBe(2);
      } else {
        await sleep(1e3);
      }
    };
    try {
      await reader('__tests__/wqwe', handler, { skipHeader: true, operationLimit: 2 });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  test('it pauses stream when operationLimit reached', async () => {
    let handleCount = 0;
    const handler = async () => {
      if (++handleCount === 1) {
        await sleep(10);
        expect(handleCount).toBe(1);
        setTimeout(() => expect(handleCount).toBe(2), 10);
      }
    };
    await reader('__tests__/test_data.csv', handler, { skipHeader: true, operationLimit: 1 });
  });

  test('it measures performance', async () => {
    let handleCount = 0;
    const startTime = performance.now();
    const handler = async () => ++handleCount;
    await reader('__tests__/test_data.csv', handler, { skipHeader: true });
    console.log(`100 lines in: ${performance.now() - startTime}`);
    expect(handleCount).toBe(1e2);
  });
});

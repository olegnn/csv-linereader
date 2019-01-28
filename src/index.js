const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

const stat = promisify(fs.stat);

module.exports = async (fileName, handler, config = {}) => {
  const { delimiter = ',', skipHeader = false } = config;
  let { operationLimit: availableOperationsCount = 1e4 } = config;
  let ended = false;

  if (availableOperationsCount < 1) throw new Error("Operation limit can't be less than 1");

  let lineReader;
  try {
    const fileInfo = await stat(fileName);
    if (!fileInfo.isFile()) {
      throw new Error(`No such file: ${fileName}`);
    }
    lineReader = readline.createInterface({
      input: fs.createReadStream(fileName),
    });
  } catch (e) {
    throw new Error(`Failed to create read stream: ${e}`);
  }

  const queue = [];

  const onEnd = async () => {
    while (queue.length) {
      // eslint-disable-next-line
      await processHandler(queue.shift());
    }
    if (ended) return;
    if (!availableOperationsCount++) {
      lineReader.resume();
    }
  };

  const processHandler = line => handler(line.split(delimiter)).then(onEnd);

  const lineHandler = (line) => {
    if (availableOperationsCount > 0) {
      processHandler(line);
      if (!--availableOperationsCount) lineReader.pause();
    } else {
      queue.push(line);
    }
  };

  const firstLineSkipper = () => {
    lineReader.removeListener('line', firstLineSkipper);
    lineReader.on('line', lineHandler);
  };

  lineReader.on('line', skipHeader ? firstLineSkipper : lineHandler);

  await new Promise(resolve =>
    lineReader.on('close', () => {
      ended = true;
      resolve();
    }));
};

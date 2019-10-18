const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

const stat = promisify(fs.stat);

module.exports = (fileName, handler, config = {}) => new Promise(((async (resolve, reject) => {
  const { delimiter = ',', skipHeader = false } = config;
  const { operationLimit = 1e4 } = config;
  let reachedEnd = false;
  let resolved = false;
  let availableOperationCount = operationLimit;

  if (availableOperationCount < 1) return reject(new Error("Operation limit can't be less than 1"));

  let lineReader;

  try {
    const fileInfo = await stat(fileName);
    if (!fileInfo.isFile()) {
      return reject(new Error(`No such file: ${fileName}`));
    }
    lineReader = readline.createInterface({
      input: fs.createReadStream(fileName),
    });
  } catch (e) {
    return reject(new Error(`Failed to create read stream: ${e}`));
  }

  const queue = [];

  const resolveOnEnd = () => {
    if (reachedEnd && availableOperationCount === operationLimit && !resolved) {
      resolve();
      resolved = true;
    }
  };

  const onHandlerEnd = () => {
    if (queue.length) {
      // eslint-disable-next-line no-use-before-define
      return processHandler(queue.shift());
    } else {
      availableOperationCount++;
      if (reachedEnd) {
        resolveOnEnd();
      } else if (availableOperationCount === 1) {
        lineReader.resume();
      }
      return Promise.resolve(null);
    }
  };

  const processHandler = line =>
    handler(line.split(delimiter))
      .then(onHandlerEnd)
      .catch(onHandlerEnd);

  const lineHandler = (line) => {
    if (availableOperationCount > 0) {
      if (!--availableOperationCount) {
        lineReader.pause();
      }
      processHandler(line);
    } else {
      queue.push(line);
    }
  };

  const firstLineSkipper = () => {
    lineReader.removeListener('line', firstLineSkipper);
    lineReader.on('line', lineHandler);
  };

  lineReader.on('line', skipHeader ? firstLineSkipper : lineHandler);

  lineReader.on('close', () => {
    reachedEnd = true;
    resolveOnEnd();
  });

  return null;
})));

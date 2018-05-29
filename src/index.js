const fs = require('fs');
const readline = require('readline');

module.exports = (fileName, handler, config = {}) =>
  new Promise((resolve) => {
    const { delimiter = ',', skipHeader = false } = config;
    let { operationLimit: availableOperationsCount = 1e4 } = config;

    if (availableOperationsCount < 1) throw new Error("Operation limit can't be less than 1");

    const lineReader = readline.createInterface({
      input: fs.createReadStream(fileName),
    });

    const queue = [];

    const onEnd = async () => {
      if (!availableOperationsCount++) {
        while (queue.length) {
          // eslint-disable-next-line
          await processHandler(queue.shift());
        }
        lineReader.resume();
      }
    };

    const processHandler = line =>
      new Promise((resolve) => {
        handler(line.split(delimiter), () => void onEnd().then(resolve));
      });

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
    lineReader.on('close', resolve);
  });

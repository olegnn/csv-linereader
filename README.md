## Installation

```shell
npm i --save csv-readliner
```

```shell
yarn add csv-readliner
```

## Usage

```javascript
const reader = require('csv-readliner');

const handler = (data, done) => console.log(data) || done();

reader('myfile.csv', handler, { skipHeader: true });
```

### API

```javascript
function reader(
  fileName: string,
  handler: (data: Array<string>, cb: () => Promise<void>) => void,
  {
    delimiter = ',',
    skipHeader = false,
    operationLimit = 1e4,
  }: {|
    delimiter: string,
    skipHeader: boolean,
    operationLimit: number,
  |},
): Promise<void> {}
```

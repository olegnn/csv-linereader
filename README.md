## Installation

```shell
npm i --save csv-linereader
```

```shell
yarn add csv-linereader
```

## Usage

```javascript
const reader = require('csv-linereader');

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

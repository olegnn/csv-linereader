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
reader(
  fileName: string, handler: (data: Array<string>, cb: () => Promise) => void, { delimiter = ',', skipHeader = false , operationLimit = 1e4 }
)
```

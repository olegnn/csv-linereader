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

const handler = async data => {
  console.log(data);
  await new Promise(
    resolve =>
      void setTimeout(function() {
        console.log('Unlock handler');
        resolve();
      }, 1e2),
  );
};

async function main() {
  await reader('myfile.csv', handler, { skipHeader: true });
  console.log('Done.');
}
```

### API

```javascript
function reader(
  fileName: string,
  handler: (data: Array<string>) => Promise<void>,
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

# nodejs-downloader
Node.js binary and headers downloader

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/nodejs-downloader
# or
$ yarn add @slimio/nodejs-downloader
```

## Usage example

```js
const {
    getLocalNodeVersion,
    getNodeRelease,
    downloadNodeFile,
    extract,
    constants: { File }
} = require("@slimio/nodejs-downloader");

// CONSTANTS
const DOWNLOAD = join(__dirname, "download");

async function main() {
    const currVersion = getLocalNodeVersion();
    console.log(currVersion);

    const nodeRelease = await getNodeRelease("v8.0.0");
    console.log(nodeRelease);

    // Download Node.js headers (of current Node.js version).
    const tarFile = await downloadNodeFile(File.Headers, {
        dest: DOWNLOAD
    });

    // Extract tar.gz
    const dirHeaders = await extract(tarFile);
    console.log(dirHeaders);
}
main().catch(console.error);
```

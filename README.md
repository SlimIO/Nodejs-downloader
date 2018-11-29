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

## API

### getNodeRelease(version: String): Release
Retrieve information about a given Node.js release.

```js
const { getNodeRelease } = require("@slimio/nodejs-downloader");

async function main() {
    const release = await getNodeRelease("v8.0.0");
    console.log(release);
}
main().catch(console.error);
```

Stdout will look like this:
```bash
{ version: 'v8.0.0',
  date: 2017-05-30T00:00:00.000Z,
  files:
   Set {
     'aix-ppc64',
     'headers',
     'linux-arm64',
     'linux-armv6l',
     'linux-armv7l',
     'linux-ppc64le',
     'linux-s390x',
     'linux-x64',
     'linux-x86',
     'osx-x64-pkg',
     'osx-x64-tar',
     'src',
     'sunos-x64',
     'sunos-x86',
     'win-x64-7z',
     'win-x64-exe',
     'win-x64-msi',
     'win-x64-zip',
     'win-x86-7z',
     'win-x86-exe',
     'win-x86-msi',
     'win-x86-zip' },
  npm: '5.0.0',
  v8: '5.8.283.41',
  uv: '1.11.0',
  zlib: '1.2.11',
  openssl: '1.0.2k',
  modules: 57,
  lts: false }
```

### downloadNodeFile(file: String, options: DownloadOptions): String
Download a given release Node.js file... Use the constant `File` of the module to known all available Node.js files !

- Default value for `version` is the result of `process.version`.
- Default value for `dest` is the result of `process.cwd()`.

```js
const { downloadNodeFile, constants: { File } } = require("@slimio/nodejs-downloader");

async function main() {
    const tarFile = await downloadNodeFile(File.Headers, {
        version: "v11.0.0",
        dest: "./headers"
    });
    console.log(tarFile);
}
main().catch(console.error);
```

### extract(file: String): String
Extract `.tar.gz` and `.zip` file. This method help you to extract Node.js files !

Following the downloadNodeFile example:
```js
const tarFile = await downloadNodeFile(File.Headers, {
    version: "v11.0.0",
    dest: "./headers"
});
const dirName = await extract(tarFile);
console.log(dirName);
```

## Roadmap

- Add `.zip` support to **extract** method.
- Add tests and coverage.
- Complete the file list.

## LICENCE
MIT

# nodejs-downloader

![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/nodejs-downloader/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/nodejs-downloader/commit-activity)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/SlimIO/nodejs-downloader/blob/master/LICENSE)
![2DEP](https://img.shields.io/badge/Dependencies-2-yellow.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/SlimIO/nodejs-downloader/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SlimIO/nodejs-downloader?targetFile=package.json)
[![Build Status](https://travis-ci.com/SlimIO/Nodejs-downloader.svg?branch=master)](https://travis-ci.com/SlimIO/Nodejs-downloader) [![Greenkeeper badge](https://badges.greenkeeper.io/SlimIO/Nodejs-downloader.svg)](https://greenkeeper.io/)

Node.js binary and headers downloader

## Requirements
- Node.js v10 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/nodejs-downloader
# or
$ yarn add @slimio/nodejs-downloader
```

## Usage example

```js
const { join } = require("path");
const {
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

<details><summary>getNodeRelease(version: String): Release</summary>
<br />

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
{ name: "N/A",
  version: 'v8.0.0',
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
</details>

<details><summary>downloadNodeFile(file?: String, options?: DownloadOptions): String</summary>
<br />

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
</details>

<details><summary>extract(file: String): String</summary>
<br />

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
</details>

### Files
File CONSTANT is described by the following interface
```ts
interface NodeFile {
    Headers: "-headers.tar.gz",
    AixPPC64: "-aix-ppc64.tar.gz",
    Darwin64: "-darwin-x64.tar.gz",
    Arm64: "-linux-arm64.tar.gz",
    Armv6l: "-linux-armv6l.tar.gz",
    Armv7l: "-linux-armv7l.tar.gz",
    PPC64le: "-linux-ppc64le.tar.gz",
    S390x: "-linux-s390x.tar.gz",
    Linux64: "-linux-x64.tar.gz",
    SunOS64: "-sunos-x64.tar.gz",
    WinBinary64: "-win-x64.zip",
    WinBinary86: "-win-x86.zip",
    WinExe64: "-x64.msi",
    WinExe86: "-x86.msi"
}
```

## Dependencies
This project is covered by the SlimIO security policy and undergoes regular security audits.

| Name | Refactoring | Security Risk | Usage |
| --- | --- | --- | --- |
| [tar-fs](https://github.com/mafintosh/tar-fs) | ⚠️ Major | ⚠️ high | Used to extract `tar.gz` archive in extract() method. |
| [@slimio/unzipper](https://github.com/SlimIO/unzipper#readme) | ⚠️ Major | ⚠️ high | Modern yauzl wrapper used to unzip `.zip` archive in extract() method. |

## License
MIT

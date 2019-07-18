"use strict";

// Require Node.js Dependencies
const { createWriteStream, createReadStream } = require("fs");
const { createGunzip } = require("zlib");
const { join, basename, extname, dirname } = require("path");
const stream = require("stream");
const { promisify } = require("util");
const https = require("https");

// Require Third-party Dependencies
const tar = require("tar-fs");
const unzip = require("@slimio/unzipper");

// CONSTANTS
const NODEJS_RELEASE_INDEX_URL = new URL("https://nodejs.org/download/release/index.json");
const NODEJS_RELEASE = "https://nodejs.org/download/release";

// Async Method
const pipeline = promisify(stream.pipeline);

/**
 * @namespace Downloader
 */

/**
 * @constant File
 * @description Available Node.js file
 * @memberof Downloader#
 */
const File = Object.freeze({
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
});

/**
 * @typedef {object} Release
 * @property {string} version
 * @property {Date} date
 * @property {Set<string>} files
 * @property {string} npm
 * @property {string} v8
 * @property {string} uv
 * @property {string} zlib
 * @property {string} openssl
 * @property {number} modules
 * @property {boolean} lts
 */

/**
 * @version 0.1.0
 *
 * @async
 * @function getNodeRelease
 * @description Get a given Node.js release.
 * @memberof Downloader#
 * @param {string} [version] nodejs release version (you want)
 * @returns {Promise<Release>}
 *
 * @throws {TypeError}
 *
 * @example
 * const { getNodeRelease } = require("@slimio/nodejs-downloader");
 *
 * async function main() {
 *     const release = await getNodeRelease("v8.0.0");
 *     console.log(release);
 * }
 * main().catch(console.error);
 */
async function getNodeRelease(version) {
    if (typeof version !== "string") {
        throw new TypeError("version should be typeof string");
    }

    /** @type {{ body: Release[] }} */
    const nodeReleases = await new Promise((resolve, reject) => {
        https.get(NODEJS_RELEASE_INDEX_URL, (res) => {
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.once("error", reject);
            res.once("end", () => {
                try {
                    resolve(JSON.parse(body));
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    });

    for (const release of nodeReleases) {
        if (release.version === version) {
            const isLTS = typeof release.lts === "string";
            Reflect.set(release, "name", isLTS ? release.lts : "N/A");
            Reflect.set(release, "lts", isLTS);
            Reflect.set(release, "date", new Date(release.date));
            Reflect.set(release, "modules", Number(release.modules));
            Reflect.set(release, "files", new Set(release.files));

            return release;
        }
    }

    return void 0;
}

/**
 * @version 0.1.0
 *
 * @async
 * @function extract
 * @description Extract tar.gz and .zip file
 * @memberof Downloader#
 * @param {!string} file file to extract
 * @returns {Promise<string>}
 *
 * @throws {TypeError}
 * @throws {Error}
 */
async function extract(file) {
    if (typeof file !== "string") {
        throw new TypeError("file must be a string");
    }

    const fileExtension = extname(file);
    switch (fileExtension) {
        case ".gz": {
            const destDirName = join(dirname(file), basename(file, ".tar.gz"));

            await pipeline(
                createReadStream(file),
                createGunzip(),
                tar.extract(destDirName)
            );

            return destDirName;
        }
        case ".zip": {
            const destDirName = join(dirname(file), basename(file, ".zip"));
            await unzip(file, { dir: destDirName });

            return destDirName;
        }
        default: throw new Error(`Unsupported extension ${fileExtension}`);
    }
}

/**
 * @version 0.1.0
 *
 * @async
 * @function downloadNodeFile
 * @description Download a given version Node.js file
 * @memberof Downloader#
 * @param {string} [fileName=tar.gz] node.js file name
 * @param {object} [options] options
 * @param {string} [options.version] node.js version where we have to found the requested file (default equal to local Node.js version).
 * @param {string} [options.dest] destination dir (default equal to process.cwd())
 * @returns {Promise<string>}
 *
 * @throws {TypeError}
 * @throws {Error}
 *
 * @example
 * const { downloadNodeFile, extract, constants: { File } } = require("@slimio/nodejs-downloader");
 *
 * async function main() {
 *     const tarFile = await downloadNodeFile(File.Headers, {
 *         version: "v11.0.0",
 *         dest: "./headers"
 *     });
 *     const dirName = await extract(tarFile);
 *     console.log(dirName);
 * }
 * main().catch(console.error);
 */
async function downloadNodeFile(fileName = File.Headers, options = Object.create(null)) {
    if (typeof fileName !== "string") {
        throw new TypeError("fileName must be a string!");
    }

    const { version = process.version, dest = process.cwd() } = options;
    if (typeof version !== "string") {
        throw new TypeError("version must be a string");
    }
    if (typeof dest !== "string") {
        throw new TypeError("destination must be a string");
    }

    // Create required variable
    const completeFileName = `node-${version}${fileName}`;
    const destFile = join(dest, completeFileName);

    await new Promise((resolve, reject) => {
        const file = createWriteStream(destFile);
        https.get(`${NODEJS_RELEASE}/${version}/${completeFileName}`, (res) => {
            res.pipe(file);
            res.once("error", reject);
            res.once("end", () => {
                file.close();
                resolve();
            });
        });
    });

    return destFile;
}

module.exports = {
    getNodeRelease,
    downloadNodeFile,
    extract,
    constants: { File }
};

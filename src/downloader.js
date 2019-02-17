// Require Node.js Dependencies
const { createWriteStream, createReadStream } = require("fs");
const { createGunzip } = require("zlib");
const { join, basename, extname, dirname } = require("path");
const stream = require("stream");
const { promisify } = require("util");

// Require Third-party Dependencies
const got = require("got");
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
 * @const File
 * @desc Available Node.js file
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
 * @typedef {Object} Release
 * @property {String} version
 * @property {Date} date
 * @property {Set<String>} files
 * @property {String} npm
 * @property {String} v8
 * @property {String} uv
 * @property {String} zlib
 * @property {String} openssl
 * @property {Number} modules
 * @property {Boolean} lts
 */

/**
 * @version 0.1.0
 *
 * @async
 * @function getNodeRelease
 * @desc Get a given Node.js release.
 * @memberof Downloader#
 * @param {String=} version nodejs release version (you want)
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
    const { body: nodeReleases } = await got(NODEJS_RELEASE_INDEX_URL, { json: true });

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
 * @method extract
 * @desc Extract tar.gz and .zip file
 * @memberof Downloader#
 * @param {!String} file file to extract
 * @returns {Promise<String>}
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
            const name = basename(file, ".tar.gz");
            const destDirName = join(dirname(file), name);

            await pipeline(
                createReadStream(file),
                createGunzip(),
                tar.extract(destDirName)
            );

            return destDirName;
        }
        case ".zip": {
            const name = basename(file, ".zip");
            const destDirName = join(dirname(file), name);
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
 * @desc Download a given version Node.js file
 * @memberof Downloader#
 * @param {String} [fileName=tar.gz] node.js file name
 * @param {Object} [options] options
 * @param {String} [options.version] node.js version where we have to found the requested file (default equal to local Node.js version).
 * @param {String} [options.dest] destination dir (default equal to process.cwd())
 * @returns {Promise<String>}
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

    // Write Stream
    await pipeline(
        got.stream(`${NODEJS_RELEASE}/${version}/${completeFileName}`),
        createWriteStream(destFile)
    );

    return destFile;
}

module.exports = {
    getNodeRelease,
    downloadNodeFile,
    extract,
    constants: { File }
};

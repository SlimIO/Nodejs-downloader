// Require Node.js Dependencies
const { spawnSync } = require("child_process");
const { join } = require("path");
const { createWriteStream } = require("fs");

// Require Third-party Dependencies
const got = require("got");

// CONSTANTS
const NODEJS_RELEASE_INDEX_URL = new URL("https://nodejs.org/download/release/index.json");
const NODEJS_RELEASE = "https://nodejs.org/download/release";

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
 * @version 0.1.0
 *
 * @function getLocalNodeVersion
 * @desc Retrieve the current installed Node.js version on the system (warning: synchronous)
 * @memberof Downloader#
 * @returns {String}
 *
 * @example
 * const { getNodeVersion } = require("@slimio/nodejs-downloader");
 *
 * console.log(getNodeVersion()); // stdout current node.js version
 */
function getLocalNodeVersion() {
    const { stdout } = spawnSync(
        process.argv[0], ["-v"], { encoding: "utf8" }
    );

    return stdout;
}

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
 */
async function getNodeRelease(version) {
    if (typeof version !== "string") {
        throw new TypeError("version should be typeof string");
    }

    /** @type {{ body: Release[] }} */
    const { body: nodeReleases } = await got(NODEJS_RELEASE_INDEX_URL, { json: true });

    for (const release of nodeReleases) {
        if (release.version === version) {
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
 * @function downloadNodeFile
 * @desc Download a given version Node.js file
 * @memberof Downloader#
 * @param {!String} version node.js version where we have to found the requested file
 * @param {String} [fileName=tar.gz] node.js file name
 * @param {String} [destination] destination dir
 * @returns {Promise<String>}
 *
 * @throws {TypeError}
 * @throws {Error}
 *
 * @example
 * const { downloadNodeFile, constants: { File } } = require("@slimio/nodejs-downloader");
 *
 * async function main() {
 *     const file = await downloadNodeFile("v11.0.0", File.Headers, "./headers");
 *     console.log(`Headers.tar.gz location: ${file}`);
 *     // Then extract tar.gz file
 * }
 * main().catch(console.error);
 */
async function downloadNodeFile(version, fileName = ".tar.gz", destination = process.cwd()) {
    if (typeof version !== "string") {
        throw new TypeError("version must be a string");
    }
    if (typeof fileName !== "string") {
        throw new TypeError("fileName must be a string!");
    }
    if (typeof destination !== "string") {
        throw new TypeError("destination must be a string");
    }

    const completeFileName = `node-${version}${fileName}`;
    const fileUrl = new URL(`${NODEJS_RELEASE}/${version}/${completeFileName}`);
    const wS = got.stream(fileUrl);
    const destFile = join(destination, completeFileName);

    await new Promise((resolve, reject) => {
        wS.on("end", resolve).on("error", reject);
        wS.pipe(createWriteStream(destFile));
    });

    return destFile;
}

module.exports = {
    getLocalNodeVersion,
    getNodeRelease,
    downloadNodeFile,
    constants: { File }
};

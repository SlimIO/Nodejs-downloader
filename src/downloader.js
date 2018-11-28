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
 * @version 0.1.0
 *
 * @function getNodeVersion
 * @desc Retrieve the current installed Node.js version on the system (warning: synchronous)
 * @memberof Downloader#
 * @returns {String}
 *
 * @example
 * const { getNodeVersion } = require("@slimio/nodejs-downloader");
 *
 * console.log(getNodeVersion()); // stdout current node.js version
 */
function getNodeVersion() {
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
 * @param {!String} fileName node.js file name
 * @param {String} [destination] destination dir
 * @returns {Promise<void>}
 *
 * @throws {TypeError}
 * @throws {Error}
 */
async function downloadNodeFile(version, fileName, destination = process.cwd()) {
    if (typeof fileName !== "string") {
        throw new TypeError("fileName should be typeof string!");
    }

    // Search for a release with the given version
    const release = await getNodeRelease(version);
    if (typeof release === "undefined") {
        throw new Error(`Unable to found Node.js release ${version}`);
    }
    if (!release.files.has(fileName)) {
        throw new Error(`Unknown file ${fileName} on Node.js release ${version}`);
    }

    // TODO: how to known file extension ?
    const completeFileName = `${fileName}.tar.gz`;
    const fileUrl = new URL(`${NODEJS_RELEASE}/${version}/node-${version}-${completeFileName}`);

    const wS = got.stream(fileUrl);
    await new Promise((resolve, reject) => {
        wS.on("end", resolve);
        wS.on("error", reject);
        wS.pipe(createWriteStream(join(destination, completeFileName)));
    });
}

module.exports = {
    getNodeVersion,
    getNodeRelease,
    downloadNodeFile
};

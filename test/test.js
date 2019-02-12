// Require Node.js Dependencies
const {
    promises: { access, unlink, stat },
    constants: { R_OK }
} = require("fs");

// Require Third-party Dependencies
const ava = require("ava");
const is = require("@slimio/is");
const rimraf = require("rimraf");

// Require Internal Dependencies
const Downloader = require("../index");
const File = Downloader.constants.File;

ava("Downloader should export constants", (assert) => {
    assert.true(Reflect.has(Downloader, "constants"));
    const constants = Downloader.constants;

    assert.is(Object.keys(constants).length, 1);
    assert.true(Reflect.has(constants, "File"));
    assert.true(Object.isFrozen(constants.File));

    for (const value of Object.values(constants.File)) {
        assert.true(typeof value === "string");
    }
});

ava("getNodeRelease - version must be a string", async(assert) => {
    const error = await assert.throwsAsync(Downloader.getNodeRelease(5), TypeError);
    assert.is(error.message, "version should be typeof string");
});

ava("getNodeRelease - unknown version must return undefined", async(assert) => {
    const release = await Downloader.getNodeRelease("v8.500.0");
    assert.is(release, undefined);
});

ava("getNodeRelease - validate payload", async(assert) => {
    const release = await Downloader.getNodeRelease(process.version);

    assert.is(release.version, process.version);
    assert.true(is.string(release.name));
    assert.true(is.date(release.date));
    assert.true(is.set(release.files));
    for (const file of release.files) {
        assert.true(is.string(file));
    }
    assert.true(is.string(release.npm));
    assert.true(is.string(release.v8));
    assert.true(is.string(release.zlib));
    assert.true(is.string(release.openssl));
    assert.true(is.string(release.uv));
    assert.true(is.number(release.modules));
    assert.true(is.bool(release.lts));
});

ava("getNodeRelease - get non-lts version", async(assert) => {
    const release = await Downloader.getNodeRelease("v9.0.0");

    assert.is(release.version, "v9.0.0");
    assert.is(release.lts, false);
});

ava("downloadNodeFile - fileName must be a string", async(assert) => {
    await assert.throwsAsync(Downloader.downloadNodeFile(5), {
        instanceOf: TypeError,
        message: "fileName must be a string!"
    });
});

ava("downloadNodeFile - version must be a string", async(assert) => {
    const opt = { version: 10 };

    await assert.throwsAsync(Downloader.downloadNodeFile(File.Headers, opt), {
        instanceOf: TypeError,
        message: "version must be a string"
    });
});

ava("downloadNodeFile - destination must be a string", async(assert) => {
    const opt = { dest: 10 };

    await assert.throwsAsync(Downloader.downloadNodeFile(File.Headers, opt), {
        instanceOf: TypeError,
        message: "destination must be a string"
    });
});

ava("downloadNodeFile - Download Node.js headers", async(assert) => {
    const tarFile = await Downloader.downloadNodeFile(File.Headers, {
        dest: __dirname
    });

    await access(tarFile, R_OK);
    await unlink(tarFile);
    assert.pass();
});

ava("extract - file must be a string", async(assert) => {
    await assert.throwsAsync(Downloader.extract(10), {
        instanceOf: TypeError,
        message: "file must be a string"
    });
});

ava("extract - Unsupported extension", async(assert) => {
    await assert.throwsAsync(Downloader.extract("test.txt"), {
        instanceOf: Error,
        message: "Unsupported extension .txt"
    });
});

ava("extract tar.gz file", async(assert) => {
    const tarFile = await Downloader.downloadNodeFile(File.Headers, {
        version: "v9.0.0",
        dest: __dirname
    });

    await access(tarFile, R_OK);
    const dirName = await Downloader.extract(tarFile);

    await unlink(tarFile);
    const stats = await stat(dirName);
    assert.true(stats.isDirectory());

    await new Promise((resolve, reject) => {
        rimraf(dirName, (error) => {
            if (error) {
                return reject(error);
            }

            return resolve();
        });
    });
});


ava("extract zip file", async(assert) => {
    const zipFile = await Downloader.downloadNodeFile(File.WinBinary64, {
        version: "v7.0.0",
        dest: __dirname
    });

    await access(zipFile, R_OK);
    const dirName = await Downloader.extract(zipFile);

    await unlink(zipFile);
    const stats = await stat(dirName);
    assert.true(stats.isDirectory());

    await new Promise((resolve, reject) => {
        rimraf(dirName, (error) => {
            if (error) {
                return reject(error);
            }

            return resolve();
        });
    });
});

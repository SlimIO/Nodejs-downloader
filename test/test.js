const {
    downloadNodeFile,
    getNodeRelease,
    constants: { File }
} = require("../index");

const { createGunzip } = require("zlib");
const { createReadStream } = require("fs");
const { join } = require("path");

const TEMP = join(__dirname, "..", "temp");

async function main() {
    const file = await downloadNodeFile("v11.1.0", File.WinExe64, TEMP);

    createReadStream(file)
        .pipe(createGunzip());
}
main().catch(console.error);

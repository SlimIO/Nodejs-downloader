const {
    downloadNodeFile,
    getNodeRelease,
    constants: { File }
} = require("../index");

async function main() {
    const release = await getNodeRelease("v11.0.0");
    console.log(release);

    await downloadNodeFile("v11.1.0", File.Headers, "./temp");
}
main().catch(console.error);

const { downloadNodeFile } = require("../index");

async function main() {
    await downloadNodeFile("v11.1.0", "headers", "./temp");
}
main().catch(console.error);

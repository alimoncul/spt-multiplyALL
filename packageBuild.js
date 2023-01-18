const fs = require("fs-extra");
const glob = require("glob");
const zip = require("bestzip");
const path = require("path");

const { author, name: packageName, version } = require("./package.json");
const ignoreList = [
    ".vscode/",
    "node_modules/",
    "types/",
    ".git/",
    ".gitea/",
    ".eslintignore",
    ".eslintrc.json",
    ".gitignore",
    ".DS_Store",
    "packageBuild.js",
    "copy-server.js",
    "mod.code-workspace",
    "package-lock.json",
    "yarn.lock",
    "tsconfig.json",
    "yarn-error.log",
    "README.md",
    "dist/"
];

// Generate the name of the package, stripping out all non-alphanumeric characters in the 'author' and 'name'.
const modName = `${author.replace(/[^a-z0-9]/gi, "")}-${packageName.replace(/[^a-z0-9]/gi, "")}-${version}`;
console.log(`Generated package name: ${modName}`);

function deleteDistFolder() {
    console.log("Deleting previous build files...");
    fs.rmSync(`${__dirname}/dist`, { force: true, recursive: true });
    console.log("Previous build files deleted.");
}

function generateExcludeList() {
    return glob.sync(`{${ignoreList.join(",")}}`, { realpath: true, dot: true });
}

function copyFiles(exclude) {
    fs.copySync(__dirname, path.normalize(`${__dirname}/../~${modName}`), {
        filter: (filePath) => {
            return !exclude.includes(filePath);
        }
    });
    fs.moveSync(path.normalize(`${__dirname}/../~${modName}`), path.normalize(`${__dirname}/${modName}`), { overwrite: true });
    fs.copySync(path.normalize(`${__dirname}/${modName}`), path.normalize(`${__dirname}/dist`));
    console.log("Build files copied.");
}

function compress() {
    zip({
        source: modName,
        destination: `dist/${modName}.zip`,
        cwd: __dirname
    }).catch(function (err) {
        console.error("A bestzip error has occurred: ", err.stack);
    }).then(function () {
        console.log(`Compressed mod package to: /dist/${modName}.zip`);

        // Now that we're done with the compression we can delete the temporary build directory.
        fs.rmSync(`${__dirname}/${modName}`, { force: true, recursive: true });
        console.log("Build successful! your zip file has been created and is ready to be uploaded to hub.sp-tarkov.com/files/");
    });
}

function build() {
    deleteDistFolder();
    const exclude = generateExcludeList();
    copyFiles(exclude);
    compress();
}

build();


#!/usr/bin/env node
/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

const pkg = require('../package.json');
const fs = require('fs');
const util = require('util');
const copyFile = util.promisify(fs.copyFile);
const readdir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);
const mkdir = util.promisify(fs.mkdir);
const path = require('path');
const child_process = require('child_process');
const execFile = util.promisify(child_process.execFile);
const exec = async (cmd, ...args) => {
    const {stdout, stderr} = await execFile(cmd, args);
    stderr && process.stderr.write(stderr);
    stdout && process.stdout.write(stdout);
};

const ROOT = path.join(process.mainModule.path, '..');

const run = async () => {
    const version = pkg.version;
    const tag = `v${version}`;
    const source = path.join(ROOT, 'build', 'docs');
    const docs = path.join(ROOT, 'docs');
    const target = path.join(docs, tag);
    console.log('EXISTS', docs, await exists(docs));
    await exists(docs) || await mkdir(docs);
    await exists(target) || await mkdir(target);
    const copyTree = async (from, to) => {
        const dir = await readdir(path.resolve(ROOT, from), {withFileTypes: true});
        return  Promise.all(dir.map(d => d.isFile()
            ? copyFile(path.join(from, d.name), path.join(to, d.name))
            : d.isDirectory()
                ? Promise.resolve(path.join(to, d.name))
                    .then(async t => {
                        await exists(t) || await mkdir(t);
                        return t})
                    .then(t => copyTree(path.join(from, d.name), t))
                : null));
    }
    console.log(source, target);
    await copyTree(source, target);
    await exec('git', 'config', 'user.email', '1154903+BobKerns@users.noreply.github.com');
    await exec('git', 'config', 'user.email', '1154903+BobKerns@users.noreply.github.com');
    await exec('git', 'add', target);
    await exec('git', 'commit', '-m', `Deploy documentation for ${tag}.`);
    await exec('git', 'push');
}
run().catch(e => {
    process.stderr.write(`Error: ${e.message}`);
    process.exit(-128);
});





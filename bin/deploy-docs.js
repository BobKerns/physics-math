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
const mkdir = util.promisify(fs.mkdir);
const path = require('path');

const ROOT = path.join(process.mainModule.path, '..');

const run = async () => {
    const version = pkg.version;
    const tag = `v${version}`;
    const source = path.join(ROOT, 'build', 'docs');
    const docs = path.join(ROOT, 'docs');
    const target = path.join(docs, tag);
    await mkdir(docs);
    await mkdir(target);
    const copyTree = async (from, to) => {
        const dir = await readdir(path.resolve(ROOT, from), {withFileTypes: true});
        return  Promise.all(dir.map(d => d.isFile()
            ? copyFile(path.join(from, d.name), path.join(to, d.name))
            : d.isDirectory()
                ? Promise.resolve(path.join(to, d.name))
                    .then(async t => (await mkdir(t), t))
                    .then(t => copyTree(path.join(from, d.name), t))
                : null));
    }
    console.log(source, target);
    return copyTree(source, target);
}
run().catch(e => console.error(e));





#!/usr/bin/env node
/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

const pkg = require('../package.json');
const github = process.env['GITHUB_WORKSPACE'];
const fs = require('fs/promises');
const util = require('util');
const copyFile = fs.copyFile;
const readdir = fs.readdir;
const mkdir = async d => {
    try {
        await fs.mkdir(d)
    } catch (e) {
        // already exists.
        console.log(e.message);
    }
    return d;
}
const readFile = async f => fs.readFile(f, 'utf8');
const writeFile = async (f, data) => fs.writeFile(f, data, 'utf8');

const path = require('path');
const child_process = require('child_process');
const execFile = util.promisify(child_process.execFile);

const hljs = require('highlight.js');
const marked = require('marked');
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, language) {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        return hljs.highlight(validLanguage, code).value;
    },
    gfm: true,
});
const renderer = {
    link(href, title, text) {
        console.log('link', href, title, text);
        if (href) {
            return `<a href=${href.replace(/\.md$/i, '.html')} ${title ? `title="${title}"` : ''}>${text}</a>`
        }
    }
};

marked.use({renderer });

const fetch = require('node-fetch');

const ROOT = path.resolve(process.mainModule.path, '..');
// In the workflow, point this to where we checked out the gh-pages branch.
const DOCS =
    github
        ? path.resolve(github, 'build/docdest')
        : ROOT;
const exec = async (cmd, ...args) => {
    const {stdout, stderr} = await execFile(cmd, args, {cwd: DOCS});
    stderr && process.stderr.write(stderr);
    stdout && process.stdout.write(stdout);
};

const copy = async (from, to) => {
    const dir = path.dirname(to);
    await mkdir(dir);
    await copyFile(from, to);
}

const html = (title, body) => `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@10.0.3/styles/xcode.css" integrity="sha256-OI7B0pICACICPVbs30FdQ/l6qL8TnsfhyGAdg5m5NzQ=" crossorigin="anonymous">
</head>
<body>${body}</body>
</html>`;

const convert = async (from, to, title) => {
    const dir = path.dirname(to);
    const fname = path.basename(to, '.md') + '.html';
    const htmlFile = path.resolve(dir, fname);
    await mkdir(dir);
    const content = await readFile(from);
    return await convertContent(content, htmlFile, title);
};

const convertContent = async (content, htmlFile, title) => {
    const xFormed = marked(content);
    await writeFile(htmlFile, html(title, xFormed));
    return htmlFile;
};

const releases = async () =>
    (await (await fetch('https://api.github.com/repos/BobKerns/physics-math/releases'))
        .json())
        .filter(e => e.published_at > '2020-05-29T18:25:38Z')
        .map(r => `* [${r.name}](https://bobkerns.github.io/physics-math/docs/${r.tag_name}/index.html) ${r.prerelease ? ' (prerelease)' : ''}}`)
        .join('\n');

const run = async () => {
    const version = pkg.version;
    const tag = github ? `v${version}` : 'local';
    const source = path.join(ROOT, 'build', 'docs');
    const docs = path.join(DOCS, 'docs');
    const target = path.join(docs, tag);
    process.stdout.write(`Destination: ${target}\n`);
    await mkdir(docs);
    await mkdir(target);
    await Promise.all([
        ['CHANGELOG.md', 'Change Log'],
        ['README.md', `Physics Math / Newton's Spherical Cow`, 'index']
    ].map(([f, title, f2]) =>
        convert(path.resolve(ROOT, f), path.resolve(source, f2 || f), title || path.basename(f, '.md'))));
    const release_body = await releases();
    const release_page = `# Newton's Spherical Cow / Physics-Math release documentation
 ${!github ? `* [local](http://localhost:5000/docs/local/index.html)` : ``}
 ${release_body}`;
    convertContent(release_page, path.resolve(docs, 'index.html'), "NSC / Math Releases");
    const copyTree = async (from, to) => {
        const dir = await readdir(path.resolve(ROOT, from), {withFileTypes: true});
        return  Promise.all(dir.map(d => d.isFile()
            ? copyFile(path.join(from, d.name), path.join(to, d.name))
            : d.isDirectory()
                ? Promise.resolve(path.join(to, d.name))
                    .then(mkdir)
                    .then(t => copyTree(path.join(from, d.name), t))
                : Promise.resolve(null)));
    }
    console.log(source, target);
    await copyTree(source, target);
    // Only check in as part of the packaging workflow.
    if (github) {
        await exec('git', 'config', 'user.email', '1154903+BobKerns@users.noreply.github.com');
        await exec('git', 'config', 'user.name', 'ReleaseBot');
        await exec('git', 'add', target);
        await exec('git', 'commit', '-m', `Deploy documentation for ${tag}.`);
        await exec('git', 'push');
    }
}
run().catch(e => {
    process.stderr.write(`Error: ${e.message}`);
    process.exit(-128);
});

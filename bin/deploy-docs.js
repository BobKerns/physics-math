#!/usr/bin/env node
/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/*
 * This file handles documentation releases. In the context of a github release workflow,
 * it expects the gh-pages branch to be checked out into build/docdest. The generated API
 * documentation will be installed into build/docdest/docs/{tag}/api, and the site glue
 * will be updated with appropriate links.
 */

const pkg = require('../package.json');
const github = process.env['GITHUB_WORKSPACE'];
const fs = require('fs/promises');
const util = require('util');
const copyFile = fs.copyFile;
const readdir = fs.readdir;
const mkdir = async d => {
    try {
        await fs.mkdir(d);
        console.log(`Created: ${d}`);
    } catch (e) {
        if (e.code === 'EEXIST') {
            // already exists.
            console.log(`Exists: ${d}`)
        } else {
            throw e;
        }
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
        onload="renderMathInElement(document.body, [{left: '$\`', right: '\`$', display: false},{left: '$$', right: '$$', display: true},{left: '\\(', right: '\\)', display: false},{left: '\\[', right: '\\]', display: true}]);"></script>

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
    const dir = path.dirname(htmlFile);
    await mkdir(dir);
    const xFormed = marked(content);
    console.log(`Writing: ${htmlFile} (${title})`);
    await writeFile(htmlFile, html(title, xFormed));
    return htmlFile;
};

const releases = async () =>
    (await (await fetch('https://api.github.com/repos/BobKerns/physics-math/releases'))
        .json())
        .filter(e => e.published_at > '2020-05-29T18:25:38Z')
        .map(r => `* [${r.name}](https://bobkerns.github.io/physics-math/docs/${r.tag_name}/api/index.html) ${r.prerelease ? ' (prerelease)' : ''}`)
        .join('\n');

const Throw = m => {
    throw new Error(m);
};

const thisRelease = async(tag) =>
    github ?
        (await (await fetch('https://api.github.com/repos/BobKerns/physics-math/releases'))
            .json())
            .filter(e => e.tag_name === tag)
            [0] || Throw(`No release tagged ${tag} found.`)
        : {name: 'Local Build', body: 'Local build'}

const run = async () => {
    const version = pkg.version;
    const tag = github ? `v${version}` : 'local';
    const source = path.join(ROOT, 'build', 'docs');
    const docs = path.join(DOCS, 'docs');
    const target = path.join(docs, tag);
    process.stdout.write(`GITHUB_WORKSPACE: ${github}\n`);
    process.stdout.write(`ROOT: ${ROOT}\n`);
    process.stdout.write(`DOCS: ${DOCS}\n`);
    process.stdout.write(`docs: ${docs}\n`);
    process.stdout.write(`Destination: ${target}\n`);
    await mkdir(DOCS);
    await mkdir(docs);
    await mkdir(target);
    await Promise.all([
        ['CHANGELOG.md', 'Change Log'],
        ['README.md', `Physics Math / Newton's Spherical Cow`],
        ['README.md', `Physics Math / Newton's Spherical Cow`, path.join(target, 'README')]
    ].map(([f, title, f2]) =>
        convert(path.resolve(ROOT, f), path.resolve(docs, f2 || f), title || path.basename(f, '.md'))));
    const release_body = await releases();
    const release_page = `# Newton's Spherical Cow / Physics-Math release documentation
 ${!github ? `* [local](http://localhost:5000/docs/local/index.html)` : ``}
* [CHANGELOG](./CHANGELOG.html)
${release_body}`;
    await convertContent(release_page, path.resolve(docs, 'index.html'), "NSC / Math Releases");
    const release = await thisRelease(tag);
    const release_landing = `# ${release.name}
    ${release.body || ''}
* [API documentation](api/index.html)
* [CHANGELOG](../CHANGELOG.html)
`;
    await convertContent(release_landing, path.resolve(target, 'index.html'), release.name);
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
    await copyTree(source, target);
    // Only check in as part of the packaging workflow.
    if (github) {
        await exec('git', 'config', 'user.email', '1154903+BobKerns@users.noreply.github.com');
        await exec('git', 'config', 'user.name', 'ReleaseBot');
        await exec('git', 'add', target);
        await exec('git', 'add', 'docs/index.html');
        await exec('git', 'add', 'docs/CHANGELOG.html');
        await exec('git', 'commit', '-m', `Deploy documentation for ${tag}.`);
        await exec('git', 'push');
    }
}
run().catch(e => {
    process.stderr.write(`Error: ${e.message}`);
    process.exit(-128);
});

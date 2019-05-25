# typedoc-plugin-linkrewriter

A plugin for [TypeDoc](https://github.com/TypeStrong/typedoc) for rewriting links in markdown.

## Installation

```sh
npm install --save-dev typedoc typedoc-plugin-linkrewriter
```

## Usage

```sh
typedoc --rewriteLinks path/to/linkrewriter.json
```

The `LinkRewriter` plugin recognizes the following link formats supported by Github Flavored Markdown:
- [Inline Links](https://github.github.com/gfm/#links) (e.g. `[Foo](bar)`)
- [Link Reference Definitions](https://github.github.com/gfm/#link-reference-definition) (e.g. `[Foo]: bar`)
- [Images](https://github.github.com/gfm/#images) (e.g. `![Foo](bar)`)
- [Auto Links](https://github.github.com/gfm/#autolinks) (e.g. `<http://foo.bar>`)
- [Auto Links (extension)](https://github.github.com/gfm/#autolinks-extension-) (e.g. `www.foo.bar` and `http://foo.bar`)

## Arguments

This plugin adds the following additional arguments to TypeDoc:

### `--rewriteLinks`

The path to a JSON file or JS file exporting a `Links` object.

A `Links` object is an object where each key is parsed as a regular expression pattern and
each value is either a [replacement string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter) or a replacer function:

```ts
interface Links {
    [pattern: string]: string | LinkRewriter;
}

type LinkRewriter = (this: LinkRewriterContext, matched: string, ...args: any[]) => string;

interface LinkRewriterContext {
    project?: ProjectReflection;
    reflection?: DeclarationReflection;
    url?: string;
    file?: string;
}
```

*Example (JSON)*
```json
{
    "^packages/([^/]+)(?:#readme|/README.md)": "modules/$1.html"
}
```

*Example (JS)*
```js
module.exports = {
    // maps 'packages/foo-bar#readme' to 'modules/foo_bar.html'
    [String.raw`^packages/([^/]+)(?:#readme|/README.md)`](_, name) {
        return `modules/${name.replace(/-/g, "_")}.html`;
    },
    // maps '../foo-bar#readme' to './foo_bar.html'
    [String.raw`^\.\./([^/]+)(?:#readme|/README.md)`](_, name) {
        return `./${name.replace(/-/g, "_")}.html`;
    },
}
```

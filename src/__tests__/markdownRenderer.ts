import * as marked from "marked";
import { MarkdownRenderer } from "../markdownRenderer";

describe("list", () => {
    it("nested ordered", () => {
        const input = "1. a\n 1. b\n  xyz\n 2. c\n2. d";
        const output = "\n1. a\n 1. b\n  xyz\n 2. c\n2. d\n\n";
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
    it("mixed", () => {
        const input = `
1. a
 | b | c |
 |--|--|
 | 1 | 2 |
2. b

`;
        const output = `
1. a
 | b | c |
 |--|--|
 | 1 | 2 |
2. b

`;
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
});

describe("tables", () => {
    it("headers", () => {
        const input = "| a | b | c | d |\n|--|:--|:--:|--:|\n| 1 | 2 | 3 | 4 |\n";
        const output = "\n| a | b | c | d |\n|--|:--|:--:|--:|\n| 1 | 2 | 3 | 4 |\n\n";
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
});

describe("unescaped", () => {
    it("text", () => {
        const input = `a & b`;
        const output = `a & b\n\n`;
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
    it("text preencoded", () => {
        // unfortunately we cannot handle decoding entities with full fidelity.
        const input = `a &amp; b`;
        const output = `a & b\n\n`;
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
    it("codespan", () => {
        const input = "`a & b`";
        const output = "`a & b`\n\n";
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
    it("code", () => {
        const input = "```\na & b\n```";
        const output = "```\na & b\n```\n\n";
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
    it("link", () => {
        const input = "[a&b](c \"d&e\")";
        const output = "[a&b](c \"d&e\")\n\n";
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
    it("image", () => {
        const input = "![a&b](c \"d&e\")";
        const output = "![a&b](c \"d&e\")\n\n";
        const parsed = marked.parse(input, { renderer: new MarkdownRenderer() });
        expect(parsed).toBe(output);
    });
});
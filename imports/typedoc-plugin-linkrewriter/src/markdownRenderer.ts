/*!
   Copyright 2019 Ron Buckton

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import {Renderer} from 'marked';

const fence = "```";
const tick = "`";

export class MarkdownRenderer extends Renderer {
    private _tableHeader = "";

    // blocks
    heading(_text: string, level: number, raw: string): string {
        return `${"#".repeat(level)} ${raw}\n`;
    }
    hr(): string {
        return `---\n`;
    }
    blockquote(quote: string): string {
        return `${quote.split(`\n`).map(q => `> ${q}`).join("\n")}\n`;
    }
    code(code: string, language: string, isEscaped: boolean): string {
        return `${fence}${language || ""}\n${isEscaped ? decode(code) : code}\n${fence}\n\n`;
    }
    br(): string {
        return `  \n`;
    }
    list(body: string, ordered: boolean, start: number): string {
        let ordinal = start;
        return `\n${body.replace(/{markdownRendererBullet}/g, () => ordered ? `${ordinal++}. ` : "- ")}\n`;
    }
    listitem(text: string): string {
        return `{markdownRendererBullet}${text.split(/\n/g).filter(line => !!line.trim()).join("\n ")}\n`;
    }
    paragraph(text: string): string {
        return `${text}\n\n`;
    }
    table(header: string, body: string): string {
        const tableHeader = this._tableHeader;
        this._tableHeader = "";
        return tableHeader
            ? `\n${header}|${tableHeader}\n${body}\n`
            : `\n${header}${body}\n`;
    }
    tablecell(content: string, flags: { header: boolean; align: "center" | "left" | "right" | null; }): string {
        if (flags.header) {
            if (flags.align === "center" || flags.align === "left") {
                this._tableHeader += ":";
            }
            this._tableHeader += "--";
            if (flags.align === "center" || flags.align === "right") {
                this._tableHeader += ":";
            }
            this._tableHeader += "|";
        }
        return ` ${content} |`;
    }
    tablerow(content: string): string {
        return `|${content}\n`;
    }

    // inlines
    codespan(code: string): string {
        return `${tick}${decode(code)}${tick}`;
    }
    del(text: string): string {
        return `~~${text}~~`;
    }
    em(text: string): string {
        return `*${text}*`;
    }
    strong(text: string): string {
        return `**${text}**`;
    }
    html(html: string): string {
        return html;
    }
    image(href: string, title: string | null, text: string): string {
        // TODO: handle unescaped and unbalanced [] in text
        // TODO: handle unescaped ", ', and () in title
        return `![${decode(text)}](${href}${(title !== null && title !== undefined) ? ` "${decode(title)}"` : ""})`;
    }
    link(href: string, title: string, text: string): string {
        // TODO: handle unescaped ", ', and () in title
        return `[${text}](${href}${(title !== null &&  title !== undefined) ? ` "${decode(title)}"` : ""})`;
    }
    text(text: string): string {
        return decode(text);
    }
}

function decode(html: string) {
    return html.replace(/&(amp|lt|gt|quot|#39);/g, _ => decode.replacements[_] || _);
}

decode.replacements = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
} as Record<string, string>;
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

import * as path from "path";
import * as marked from "marked";
import { Component, ContextAwareRendererComponent } from "typedoc/dist/lib/output/components";
import { BindOption } from "typedoc/dist/lib/utils";
import { MarkdownEvent, RendererEvent, PageEvent } from 'typedoc/dist/lib/output/events';
import { ProjectReflection, DeclarationReflection } from 'typedoc/dist/lib/models';
import { MarkdownRenderer } from './markdownRenderer';

export interface LinkRewriterContext {
    project?: ProjectReflection;
    reflection?: DeclarationReflection;
    url?: string;
    file?: string;
}

export type LinkRewriter = (this: LinkRewriterContext, matched: string, ...args: any[]) => string;

export interface Links {
    /**
     * `pattern` is a regular expression pattern. The value is a regexp replacement string or `LinkRewriter` function.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
     */
    [pattern: string]: string | LinkRewriter;
}

@Component({ name: "linkrewriter" })
export class LinkRewriterPlugin extends ContextAwareRendererComponent {
    @BindOption('rewriteLinks')
    rewriteLinks?: string | Links;

    private _links: [RegExp, string | LinkRewriter][] | undefined;
    private _page: PageEvent | undefined;
    private _context: LinkRewriterContext | undefined;

    initialize() {
        super.initialize();
        this.listenTo(this.owner, MarkdownEvent.PARSE, this.onParseMarkdown, 200);
    }

    onBeginRenderer(event: RendererEvent) {
        super.onBeginRenderer(event);
        this.ensureLinks();
    }

    onBeginPage(page: PageEvent) {
        super.onBeginPage(page);
        this._page = page;
        this._context = this.createContext();
    }

    onParseMarkdown(event: MarkdownEvent) {
        if (this._links) {
            event.parsedText = marked.parse(event.parsedText, {
                renderer: new LinkReplacer(this._links, this._context || this.createContext())
            });
        }
    }

    private createContext(): LinkRewriterContext {
        return {
            project: this.project,
            reflection: this.reflection,
            url: this._page && this._page.url,
            file: this._page && this._page.filename
        };
    }

    private ensureLinks() {
        if (!this._links) {
            this._links = this.buildLinks(typeof this.rewriteLinks === "string" ? this.loadLinks(this.rewriteLinks) : this.rewriteLinks);
        }
    }

    private buildLinks(links: Links | undefined) {
        if (!links) {
            return [];
        }
        const result: [RegExp, string | LinkRewriter][] = [];
        for (const [pattern, replacement] of Object.entries(links)) {
            try {
                result.push([new RegExp(pattern), replacement]);
            }
            catch {
                this.application.logger.error("Failed to parse link pattern '%s'.", pattern);
            }
        }
        return result;
    }

    private loadLinks(links: string) {
        try {
            return require(path.resolve(links));
        }
        catch (e) {
            this.application.logger.error("Could not load links '%s'.", links);
        }
    }
}

class LinkReplacer extends MarkdownRenderer {
    private readonly _links: [RegExp, string | LinkRewriter][];
    private readonly _context: LinkRewriterContext;

    constructor(links: [RegExp, string | LinkRewriter][], context: LinkRewriterContext) {
        super();
        this._links = links;
        this._context = context;
    }

    image(href: string, title: string | null, text: string): string {
        return super.image(this.rewriteLinkDestination(href), title, text);
    }

    link(href: string, title: string, text: string): string {
        return super.link(this.rewriteLinkDestination(href), title, text);
    }

    private rewriteLinkDestination(linkDestination: string) {
        try {
            const context = this._context;
            const isBracketedLink = /^<.*>$/.test(linkDestination);
            const url = isBracketedLink ? linkDestination.slice(1, -1) : linkDestination;
            for (const [pattern, replacement] of this._links) {
                const result = typeof replacement === "function"
                    ? url.replace(pattern, replacement.bind(context))
                    : url.replace(pattern, replacement);
                if (result !== url) {
                    return isBracketedLink ? `<${result}>` : result;
                }
            }
        }
        catch (e) {
            console.error(e);
            throw e;
        }
        return linkDestination;
    }
}
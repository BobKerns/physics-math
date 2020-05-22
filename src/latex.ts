/*
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Support for LaTex formatting of our expressions and data.
 * @packageDocumentation
 * @module LaTeX
 */

import R from "ramda";


/**
 * @internal
 */
const tex = String.raw;
/**
 * A styler takes a LaTeX fragment and transforms it in some way.
 *
 * A [[Styler]] is required to be synchronous; no use of await or promises
 * is allowed.
 *
 */
export type Styler = (tex: string, style: StyleMap) => string;

/**
 * A variant of [[Styler]] that takes a number instead of a string,
 * for controlling how numbers format.
 */
export type NumStyler = (tex: number, style: StyleMap) => string;


type StyleKeyString = 'unit' | 'function' | 'call' | 'variable';
type StyleKeyNumber = 'number';

/**
 * The valid style keys to be used with [[setStyle]].
 */
export type StyleKey = StyleKeyString | StyleKeyNumber;

/**
 * Create a [[Styler]] that changes the color.
 * @param color an [[RGB6Color]]
 */
export const colorStyler = (color: RGB6Color) => (texString: string) =>
    tex`\textcolor{${color}}{${texString}}`;

/**
 * A map of [[StyleKey]] to [[Styler]].
 */
export type StyleMap = {
    [k in StyleKeyString]: Styler;
} & {
    [j in StyleKeyNumber]: NumStyler
};

/**
 * This handles adding style formatting to the syntactic expressions components
 * during LaTeX generation. It consists of a set of [[Styler]] functions, each
 * of which can modify the generated LaTeX, typically by wrapping it with additional
 * directives.
 *
 * The [[Style.set]], [[Style.wrap]], and [[Style.wrapWith]] methods can be chained
 * to provide any combination.
 */
export class Style implements Readonly<StyleMap> {
    readonly call: Styler;
    readonly function: Styler;
    readonly variable: Styler;
    readonly number: NumStyler;
    readonly unit: Styler;
    constructor(init: StyleMap) {
        this.call = init.call;
        this.function = init.function;
        this.variable = init.variable;
        this.number = init.number;
        this.unit = init.unit;
    }

    /**
     * Returns a new [[Style]] with each [[Styler][] in `stylers` replacing
     * the one in this one.
     */
    set(stylers: Partial<StyleMap>): Style {
        return Object.freeze(Object.assign(Object.create(this), stylers));
    }

    /**
     * Returns a new [[Style]] with each [[Styler]] in `stylers` wrapping
     * the one in this one. Each of the supplied [[Styler]] will receive
     * the result of calling the current styler on the original string
     * and this styler.
     */
    wrap(stylers: Partial<StyleMap>): Style {
        const merge: (n: Partial<StyleMap>, o: Style) => Style =
            R.mergeWith((a: Styler, b: Styler) =>
                (tex: string, style: Style = this) => a(b(tex, this), style));
        return Object.freeze(new Style(merge(stylers, this)));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns a new [[Style]] with each [[Styler]] in `stylers` wrapping
     * the one in this one. Each of the supplied [[Styler]] will receive
     * the result of calling the current styler on the original string
     * and the new styler.
     */
    wrapWithNewStyle(stylers: Partial<StyleMap>): Style {
        const merge: (n: Partial<StyleMap>, o: Style) => Style =
            R.mergeWith((a: Styler, b: Styler) =>
                (tex: string, style: Style = this) => a(b(tex, style), style));
        return Object.freeze(new Style(merge(stylers, this)));
    }
}

/**
 * The stylers. These handle adding style formatting to the syntactic expressions
 * components.
 */
export let DEFAULT_STYLE = new Style({
    unit: colorStyler('0000ff'),
    function: (op: string) => tex`\operatorname{${op}}`,
    call: (s: string) => s,
    variable: (s: string) => tex`{${s}}`,
    number: (s: number) => {
        switch (s) {
            case 0.5:
                return tex`\frac{1}{2}`;
            case -0.5:
                return tex`-\frac{1}{2}`;
            case 1.5:
                return tex`\frac{3}{2}`;
            case -1.5:
                return tex`-\frac{3}{2}`;
            case 1 / 3:
                return tex`\frac{1}{3}`;
            case 2 / 3:
                return tex`\frac{2}{3}`;
            case -1 / 3:
                return tex`-\frac{1}{3}`;
            case -2 / 3:
                return tex`-\frac{2}{3}`;
            default:
                return s % 1 === 0 ? s.toString() : s.toPrecision(4);
        }
    }
});

// noinspection JSUnusedGlobalSymbols
/**
 * List of the valid style keys for [[setStyle]].
 */
export const LATEX_STYLE_KEYS: StyleKey[] = Object.keys(DEFAULT_STYLE) as StyleKey[];

/**
 * We take our colors in 6 RGB hex digits, e.g. RRGGBB, {RR, GG, BB} ∈ 00..FF.
 */
export type RGB6Color = string;

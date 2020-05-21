/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Support for LaTex formatting of our expressions and data.
 * @definemodule Styler
 */

const tex = String.raw;
/**
 * A styler takes a LaTeX fragment and transforms it in some way.
 * @module Styler
 */
export type Styler = (tex: string) => string;


/**
 * The valid style keys to be used with [[setStyle]].
 * @module Styler
 */
export type StyleKeys = 'unit' | 'function' | 'call';

export const colorStyler = (color: RGB6Color) => (texString: string) =>
    tex`\textcolor{${color}}{${texString}}`;

/**
 * The stylers. These handle adding style data to the syntactic expressions
 * components.
 *
 * @internal
 */
export const STYLES: {[k in StyleKeys]: Styler} = {
    unit: colorStyler('0000ff'),
    function: (op: string) => tex`\operatorname{${op}}`,
    call: (s: string) => s
};

/**
 * We take our colors in 6 RGB hex digits.
 */
export type RGB6Color = string;

/**
 * Set the [[Styler]] for a given [[StyleKey]]. This allows a degree of control
 * over the output formatting, separated from the semantic content.
 *
 * @param key
 * @param styler
 * @returns the old [[Styler]].
 * @module Styler
 */
 export const setStyle = (key: StyleKeys, styler: Styler): Styler => {
     if (!STYLES[key]) {
         throw new Error(`Unknown style key: ${key}`);
     }
     const old = STYLES[key];
     STYLES[key] = styler;
     return old;
 }

/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */


/**
 * Miscellaneous utilities
 * @packageDocumentation
 * @module Utils
 * @preferred
 */

//import {range} from "genutils/lib/cjs/range";
import {range} from "genutils";

interface idGen extends Function {
    seqs: {[k: string]: Iterator<number>}
}

/**
 * Predicate/Type Guard for any function.
 * @param f
 */
export const isFunction = <A extends Function>(f: (A | any)): f is A => {
    return typeof f === 'function';
}

/**
 * Generate a unique ID based on a prefix. A different numerical series is produced
 * for each prefix.
 * @param prefix
 * @param sep
 */
export function idGen(prefix = 'gen', sep = '-'): string {
    const fn: idGen = idGen as unknown as idGen;

    const seqs = fn.seqs || (fn.seqs = {});
    const seq =
        seqs[prefix] || (seqs[prefix] = range(0, Number.MAX_SAFE_INTEGER));
    return `${prefix}${sep}${seq.next().value}`;
}

/**
 * We extend our returned HTML element with Observable's 'viewof' support.
 */
export interface ViewOf<T = any> {
    value: T;
}

/**
 * A functional version of the throw statement.
 * @param msg
 */
export const Throw = (msg: string | Error = 'Error'): never => {
    if (msg instanceof Error) {
        throw msg;
    }
    throw new Error(msg);
}

/**
 * Convenience function for marking places not yet implemented.
 * @param name Optional name for what is not implemented yet.
 * @constructor
 */
export const NYI = (name?: string) => Throw(name ? `Not yet implemented.` : `${name}: Not yet implemented.`);

/**
 * A constructor
 */
export interface Constructor<R, A extends [...any[]] = []> {
    new(...args: A): R;
}

/**
 * Removes the readonly property from the fields of an object type.
 * @typeParam the object type to remove readonly from.
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Coerce a string into a form suitable for passing to a string interpolator.
 *
 * @param s
 */
export const callSite = (s: string|string[]) => (a => ((a as any).raw = (a as any).raw || a))(s instanceof Array ? s : [s])

let katex: any = null;

/**
 * String template for producing tex. Produces a raw string containing the LaTeX code, unparsed.
 * If the katex module is available, it will be used to parse the LaTeX for error-checking
 * purposes, but the string will be returned (suitable for later parsing in the end environment).
 * @param s
 * @param substitutions
 */
export const tex = (s: TemplateStringsArray, ...substitutions: any[]) => {
    const r = String.raw(s, ...substitutions);
    if (katex === null) {
        try {
            katex = require('katex');
        } catch (e) {
            console.warn('Could not load katex', e);
            // Don't try again. Take advantage of multiple kinds of falsey.
            katex = false;
        }
    }
    if (katex) {
        katex.renderToString(r);
    }
    return r;
};

/**
 * Define a @toStringTag for a given class's prototype so that objects show in inspectors with that
 * tag even if minified. Can accept either a prototype or a class constructor.
 *
 * @param proto
 * @param tag
 */
export const defineTag = (proto: Constructor<any, any>|any, tag: string) => {
    if (typeof proto === 'function') {
        defineTag(proto.prototype, tag);
    }
    Object.defineProperty(proto, Symbol.toStringTag, {
        get: () => tag
    });
};

/**
 * Return the negation of a predicate.
 * @param pred
 */
export const not = <T extends Array<any>>(pred: (...a: T) => boolean): ((...a: T) => boolean) => (...a) => !pred(...a);

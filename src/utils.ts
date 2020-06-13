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
 */

interface idGen extends Function {
    seqs: {[k: string]: Iterator<number>}
}

function* Foo() {}
const GenProto = ((Foo()).constructor).prototype;

abstract class MappableGenerator<T extends any = any> implements Generator<T>, Iterable<T> {

    abstract next(): IteratorResult<T>;

    abstract [Symbol.iterator](): Generator<T>;

    abstract return(value: any): IteratorResult<T>;

    abstract throw(e: any): IteratorResult<T>;

    asArray(): T[] {
        return [...this];
    }

    forEach(f: (v: T) => void) {
        while (true) {
            const r = this.next();
            if (r.done) return;
            f(r.value);
        }
    }

    map<V>(f: (v: T) => V): V[] {
        const result: V[] = [];
        while (true) {
            const r = this.next();
            if (r.done) return result;
            result.push(f(r.value));
        }
    }

    filter(p: (v: T) => boolean): T[] {
        const result: T[] = [];
        while (true) {
            const r = this.next();
            if (r.done) return result;
            if (p(r.value)) {
                result.push(r.value)
            }
        }
    }

    some(p: (v: T) => boolean): boolean {
        while (true) {
            const r = this.next();
            if (r.done) return false;
            if (p(r.value)) return true;
        }
    }

    every(p: (v: T) => boolean): boolean {
        while (true) {
            const r = this.next();
            if (r.done) return true;
            if (!p(r.value)) return false;
        }
    }
}

Object.setPrototypeOf(MappableGenerator.prototype, GenProto);

function* range2(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
    let x = start;
    if (step > 0) {
        while (x < end) {
            yield x;
            x += step;
        }
    } else if (step < 0) {
        while (x > end) {
            yield x;
            x += step;
        }
    } else {
        throw new Error("Step must not be zero.");
    }
}

export const range = (start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): MappableGenerator<number> => {
    const r: Partial<MappableGenerator<number>> = range2(start, end, step);
    Object.setPrototypeOf(r, MappableGenerator.prototype);
    return r as MappableGenerator<number>;
};

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
export const Throw = (msg: string = 'Error'): never => {
    throw new Error(msg);
}

/**
 * Convenience function for marking places not yet implemented.
 * @param name Optional name for what is not implemented yet.
 * @constructor
 */
export const NYI = (name?: string) => Throw(name ? `Not yet implemented.` : `${name}: Not yet implemented.`);

export interface Constructor<R, A extends [...any[]] = []> {
    new(...args: A): R;
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Coerce a string into a form suitable for passing to a string interpolator.
 *
 * @param s
 */
export const callSite = (s: string|string[]) => (a => ((a as any).raw = (a as any).raw || a))(s instanceof Array ? s : [s])

let katex: any = null;

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
export const not = <T>(pred: (a: T) => boolean): ((a: T) => boolean) => a => !pred(a);


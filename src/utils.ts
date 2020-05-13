/**
 * @module PhysicsMath
 * Copyright © 2020 by Bob Kerns. Licensed under MIT license
 */

/**
 * Miscellaneous utilities
 */

interface idGen extends Function {
    seqs: {[k: string]: Iterator<number>}
}

export function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
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

export function Throw(msg: string = 'Error') {
    throw new Error(msg);
}

// noinspection JSUnusedGlobalSymbols
export interface Constructor3N<T> {
    new(x?: number, y?: number, z?: number): T;
}

export interface Constructor4N<T> {
    new(x?: number, y?: number, z?: number, w?: number): T;
}

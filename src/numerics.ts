/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * @packageDocumentation
 * @module Utils
 */

/**
 * @internal
 */
export interface MemoBuffer<T> {
    [k: number]: T;

    set(from: MemoBuffer<T>, start?: number): void;

    readonly length: number;
}

/**
 * @internal
 */
export interface Memoizer<T> {
    growUp(buffer: MemoBuffer<T>, bufMin: number, min: number, max: number, t: number): [MemoBuffer<T>, number];
    growDown(buffer: MemoBuffer<T>, bufMin: number, min: number, max: number, t: number): [MemoBuffer<T>, number];
    newBuffer(size: number): MemoBuffer<T>;
    memo(): (t: number) => T;
}

/**
 * Computes function values at stepsize intervals, doing linear interpolation between those points.
 * @internal
 */
export abstract class MemoizerBase<T extends number> implements Memoizer<T> {
    protected readonly f: (n: number) => T;
    readonly stepsize: number;
    readonly bufsize: number;

    protected constructor(f: (n: number) => T, stepsize = MemoizerBase.stepsize, bufsize = MemoizerBase.bufsize) {
        this.f = f;
        this.stepsize = stepsize;
        this.bufsize = bufsize;
    }

    growUp(buffer: MemoBuffer<T>, bufMin: number, min: number, max: number, t: number): [MemoBuffer<T>, number] {
        const need = Math.round((t - max) / this.stepsize);

        const grow = Math.max(buffer.length, need * 2);
        const nbuf = this.newBuffer(buffer.length + grow);
        nbuf.set(buffer, 0);
        return [nbuf, bufMin];
    }

    growDown(buffer: MemoBuffer<T>, bufMin: number, min: number, max: number, t: number): [MemoBuffer<T>, number] {
        const need = Math.round((min - t) / this.stepsize);

        const grow = Math.max(buffer.length, need * 2);
        const nbuf = this.newBuffer(buffer.length + grow);
        nbuf.set(buffer, grow);
        return [nbuf, bufMin - grow * this.stepsize];
    }

    abstract memo(): (t: number) => T;

    static stepsize: number = 1 / 1024;
    static bufsize: number = 1024;

    newBuffer(size: number): MemoBuffer<T> {
        return new Float64Array(size) as unknown as MemoBuffer<T>;
    }

    // noinspection JSUnusedGlobalSymbols
    static memoize(f: (t: number) => number, stepsize: number = MemoizerBase.stepsize): (t: number) => number {
        return new RangeMemoizer(f, stepsize).memo();
    }
}

export class RangeMemoizer<T extends number = number> extends MemoizerBase<T> {
    constructor(f: (n: number) => T, stepsize = MemoizerBase.stepsize, bufsize = MemoizerBase.bufsize) {
        super(f, stepsize, bufsize);
    }

    newBuffer(size: number): MemoBuffer<T> {
        return new Float64Array(size) as unknown as MemoBuffer<T>;
    }


    memo(): (t: number) => T {
        let buffer: MemoBuffer<T> | null = null;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        let bufMin = 0;
        let stepsize = this.stepsize
        const epsilon = stepsize / 4096;
        let f = this.f;
        const read = (t: number): T => {
            if (!buffer) {
                bufMin = min = max = t;
                buffer = this.newBuffer(this.bufsize);
            }
            let n = Math.round((t - bufMin) / stepsize);
            if ((t >= min) && (t < max)) {
                // Inside our cached range.
                return buffer[n];
            } else if (t < min) {
                if (n < 0) {
                    [buffer, bufMin] = this.growDown(buffer, bufMin, min, max, t);
                    n = Math.round((t - bufMin) / stepsize);
                }

                for (let i = 1, x = min - stepsize; x > t - stepsize / 2; x = min - ++i * stepsize) {
                    const p = Math.floor((x - bufMin) / stepsize);
                    buffer[p] = f(x);
                }
                min = Math.round(t / stepsize) * stepsize;
                return buffer[n];
            } else {
                if (n >= buffer.length) {
                    [buffer, bufMin] = this.growUp(buffer, bufMin, min, max, t);
                    n = Math.round((t - bufMin) / stepsize);
                }

                for (let i = 0, x = max; x < t + stepsize / 2; x = max + ++i * stepsize) {
                    const p = Math.round((x - bufMin) / stepsize);
                    buffer[p] = f(x);
                }
                max = Math.round(t / stepsize + 1) * stepsize;
                return buffer[n];
            }
        }
        const wrapped = (x: number): T => {
            const tl = Math.floor(x / stepsize) * stepsize;
            const tu = Math.ceil(x / stepsize) * stepsize;
            const dl = x - tl;
            if (dl < epsilon && dl > -epsilon) {
                return read(tl);
            }
            const du = x - tu;
            if (du < epsilon && du > -epsilon) {
                return read(tu);
            }
            const vl = read(tl);
            const vu = read(tu);
            const d = vu - vl;
            return vl + d * (x - tl) / stepsize as T;
        };
        // For debug/test
        Object.defineProperty(wrapped, 'state', {
            get: () => ({min, max, bufMin, buffer})
        });
        return wrapped;
    };
}

/**
 * Cache values in an internal array, marking absent values with a NaN.
 */
export class NumericMemoizer<T extends number> extends MemoizerBase<T> {
    constructor(f: (n: number) => T, stepsize = MemoizerBase.stepsize, bufsize = MemoizerBase.bufsize) {
        super(f, stepsize, bufsize);
    }

    newBuffer(size: number): MemoBuffer<T> {
        const arr = new Float64Array(size);
        arr.fill(Number.NaN);
        return arr as unknown as MemoBuffer<T>;
    }

    memo(): (t: number) => T {
        let buffer: MemoBuffer<T> | null = null;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        let bufMin = 0;
        let stepsize = this.stepsize
        const epsilon = stepsize / 4096;
        let f = this.f;
        const read = (t: number): T => {
            if (!buffer) {
                bufMin = min = max = t;
                buffer = this.newBuffer(this.bufsize);
            }
            let n = Math.round((t - bufMin) / stepsize);
            if ((t >= min) && (t < max)) {
                // Inside our potentially-cached range.
                const v = buffer[n];
                if (!Number.isNaN(v)) {
                    return buffer[n];
                }
            } else if (t < min) {
                if (n < 0) {
                    [buffer, bufMin] = this.growDown(buffer, bufMin, min, max, t);
                    n = Math.round((t - bufMin) / stepsize);
                }
                min = Math.round(t / stepsize) * stepsize;
            } else if (t >= max) {
                if (n >= buffer.length) {
                    [buffer, bufMin] = this.growUp(buffer, bufMin, min, max, t);
                    n = Math.round((t - bufMin) / stepsize);
                }
                max = Math.round(1 + t / stepsize) * stepsize;
            }
            const x = Math.round(t / stepsize) * stepsize;
            const v = f(x);
            if (Number.isNaN(v)) {
                throw new Error(`Function returned NaN at ${x}`);
            }
            return buffer[n] = v;
        }
        const wrapped = (x: number): T => {
            const tl = Math.floor(x / stepsize) * stepsize;
            const tu = Math.ceil(x / stepsize) * stepsize;
            const dl = x - tl;
            if (dl < epsilon && dl > -epsilon) {
                return read(tl);
            }
            const du = x - tu;
            if (du < epsilon && du > -epsilon) {
                return read(tu);
            }
            const vl = read(tl);
            const vu = read(tu);
            const d = vu - vl;
            return vl + d * (x - tl) / stepsize as T;
        };
        // For debug/test
        Object.defineProperty(wrapped, 'state', {
            get: () => ({min, max, bufMin, buffer})
        });
        return wrapped;
    }
}

export const romberg = (f: (n: number) => number, a: number, b: number, max_steps: number, acc: number) => {
    let Rp = new Float64Array(max_steps);
    let Rc = new Float64Array(max_steps);
    let h = (b - a); //step size
    Rp[0] = (f(a) + f(b)) * h * .5; // first trapezoidal step

    for (let i = 1; i < max_steps; ++i) {
        h /= 2.;
        let c = 0;
        const ep = 1 << (i - 1); //2^(n-1)
        for (let j = 1; j <= ep; ++j) {
            c += f(a + (2 * j - 1) * h);
        }
        Rc[0] = h * c + .5 * Rp[0]; //R(i,0)

        for (let j = 1; j <= i; ++j) {
            const n_k = Math.pow(4, j);
            Rc[j] = (n_k * Rc[j - 1] - Rp[j - 1]) / (n_k - 1); // compute R(i,j)
        }

        if (i > 1 && Math.abs(Rp[i - 1] - Rc[i]) < acc) {
            return Rc[i - 1];
        }

        // swap Rn and Rc as we only need the last row
        [Rp, Rc] = [Rc, Rp];
    }
    return Rp[max_steps - 1]; // return our best guess
}

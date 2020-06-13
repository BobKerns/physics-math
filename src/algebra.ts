/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Algebraic manipulations.
 */

/**
 * The Miller Rabin algorithm.
 *
 * For the moment, due to lack of universal BigInt support and unlikeliness of need,
 * we accept that it will be inaccurate on platforms w/o BigInt (e.g. Safari) above
 * 94906265 (Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)).
 * @arg n the number to be tested for primality.
 * @return true if n is prime, else returns false
 */
export const isPrime = (n: number): boolean => {
    if (n < 2) {
        return false;
    }
    let r = 0;
    let d = n - 1;
    while ((d & 1) == 0) {
        d >>= 1;
        r++;
    }

    for (const a of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]) {
        if (n == a) {
            return true;
        } else if (check_composite(n, a, d, r)) {
            return false;
        }
    }
    return true;
}
/**
 * The Miller Rabin algorithm. The opposite of [isPrime].
 *
 * For the moment, due to lack of universal BigInt support and unlikeliness of need,
 * we accept that it will be inaccurate on platforms w/o BigInt (e.g. Safari) above
 * 94906265 (Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)).
 * @arg n the number to be tested for primality.
 * @return true if n is prime, else returns false
 */
export const isComposite = (n: number) => !isPrime(n);

const binPower = (base: number, e: number, mod: number): number => {
    let result = 1;
    base %= mod;
    while (e) {
        if (e & 1) {
            // Need BigInt here due to the multiplication!
            if (BigInt) {
                result = Number(BigInt(result) * BigInt(base) % BigInt(mod));
            } else {
                result = result * base % mod;
            }
        }
        // Need BigInt here due to the multiplication!
        if (BigInt) {
            base = Number(BigInt(base) * BigInt(base) % BigInt(mod));
        } else {
            base = base * base % mod;
        }
        e >>= 1;
    }
    return result;
}

const check_composite = (n: number, a: number, d: number, s: number): boolean => {
    let x = binPower(a, d, n);
    if (x == 1 || x == n - 1) {
        return false;
    }
    for (let r = 1; r < s; r++) {
        // Need BigInt here due to the multiplication!
        if (BigInt) {
            x = Number(BigInt(x) * BigInt(x) % BigInt(n));
        } else {
            x = x * x % n;
        }
        if (x == n - 1) {
            return false;
        }
    }
    return true;
};

/**
 * GCD, for either two numbers or two BigInts.
 * @param a
 * @param b
 */
export function gcd(a: number, b: number): number;
export function gcd(a: bigint, b: bigint): bigint;
export function gcd(ax: number|bigint, bx: number|bigint): number | bigint {
    // TypeScript bug. In Javascript, the below code works with either
    // number of bigint (but not mixed).
    let a = ax as number;
    let b = bx as number;
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    if(b > a) [b, a] = [a, b];
    while (true) {
        a = (a % b);
        if (a == 0) return b;
        b = (b % a);
        if (b == 0) return a;
    }
}

/**
 * Extended GCD
 * @param a
 * @param b
 * @return [gcd, factor_a, factor_b] such that gcd*factor_a = a, gcd*factor_b = b.
 */
export function xgcd(a: number, b: number): [number, number, number];
export function xgcd(a: bigint, b: bigint): [bigint, bigint, bigint];
export function xgcd(ax: number|bigint, bx: number|bigint):
    [number, number, number] | [bigint, bigint, bigint]
{
    const big = <T extends number|bigint>(n: T, v: number|bigint): T =>
        typeof n === 'bigint'
            ? BigInt(v) as T
            : Number(v) as T;
    const floor = <T extends number|bigint>(n: T) =>
        typeof ax === 'bigint'
            ? n
            : Math.floor(n as number);
    const aNeg = big(ax,(ax < 0) ? -1 : 1) as number;
    const bNeg = big(bx, (bx < 0) ? -1 : 1) as number;
    let a1 = big(ax, 1) as number;
    let b1 = big(bx, 0) as number;
    let a2 = big(ax, 0) as number;
    let b2 = big(bx, 1) as number;
    // Pretend
    let a: number = aNeg * (ax as number);
    let b: number = bNeg * (bx as number);
    let quot;
    if (b > a) [b, a] = [a, b];
    while (true) {
        quot = floor(a / b);
        a = a % b;
        a1 += quot * a2;
        b1 += quot * b2;
        if (a == 0) return [b, a1 * aNeg, b1 * bNeg];
        quot = floor(b / a);
        b = b % a;
        a2 += quot * a1;
        b2 += quot * b1;
        if (b == 0) return [a, a2 * aNeg, b2 * bNeg];
    }
}

/**
 * Bitmask of first 1024 * 8 odd integers. (2 maps to bit 0).
 */
const SIEVE = 531007233873428170234517668896092799040656015382810845274141451029091319435578341805563109090199497663764658720062559130481686268057514483179765418941075809462853443260066133600062068195308827659758155458775650673798356814334315989780012039026226853601961222819444563177201155671342479213518163529826051336311413459158515125482383797653790862331707437433867396376490889105314696852009168831829146388507939623748892249359770836539663891069076145879769858414322501572366912345188400280316056166116452839203535963169121118340240299670689460489378966377101205712197484722596479339438975986265335816751274251837924731051305857077976552094545692260113352631926839855307214581014623301887903854671248189929682361300751717659915259385993642206338978923600598399056352134366963636278820854849580161071527661615205975768688609770044614607627412463317597897317575027356601466319164865274088437546280287774143202117381730330504527578226033876548072456386886156683855317455095926586309140977776126705675240082935747105708130552212384887118634772103754181724403595528587949165644449977288873095015254275620967392911259480460333117890157685137798898380080931340001881846387674350180114401205081089802296462998689955217794787120660094514374812945263n;

// The above can be constructed with the following:
// S = [...sieve(1024 * 8)].reduce((acc, n) => acc | (1n << (BigInt(n) / 2n)), 0n)

// noinspection JSUnusedGlobalSymbols
export function* sieve(lim: number) {
    let p = 1;
    if (2 < lim) yield 2;
    for (let i = 3; i < lim; i += 2) {
        const c = gcd(i, p);
        if (c == 1) {
            yield i;
            p *= i;
        }
    }
}

/*
Simple but slow.
export function* factor(n: number) {
    for (const p of sieve(Math.sqrt(n))) {
        while (n % p == 0) {
            yield p;
            n = n / p;
        }
    }
}
*/


// noinspection JSUnusedGlobalSymbols
export function* factor(n: number) {
    while (n % 2 == 0) {
        yield 2;
        n = n / 2;
    }
    let idx = 1n;
    for (let i = 1; i < 1024 * 4 && n > 1; i++) {
        idx <<= 1n;
        // noinspection JSBitwiseOperatorUsage
        if (idx & SIEVE) {
            const p = i * 2 + 1;
            while (n > 1 && n % p == 0) {
                yield p;
                n /= p;
            }
        }
    }
    if (n == 1) return;
    // Too big for our sieve; fall back to Brent's Algorithm.
    while (n > 1) {
        const oldN = n;
        const params = [[2, 1], [3, 2], [4, 3]];
        for (let i = 0; i < params.length; i++) {
            const t = brent(n, ...params[i])
            if (t != n || isPrime(t)) {
                yield t;
                n /= t;
                break;
            }
        }
        if (n == oldN) {
            throw new Error(`Unable to factor: ${n}`);
        }
    }
}

const brent = (n: number, x0: number = 2, c: number = 1) => {
    const mult = (a: number, b:number, m:number) =>
        Number((BigInt(a) * BigInt(b)) % BigInt(m));
    const f = (x: number, c: number, mod: number) =>
        (mult(x, x, mod) + c) % mod;
    let x = x0;
    let g = 1;
    let q = 1;
    let xs: number = 0;
    let y: number = 0;

    let m = 128;
    let l = 1;
    while (g == 1) {
        // noinspection JSSuspiciousNameCombination
        y = x;
        for (let i = 1; i < l; i++)
        x = f(x, c, n);
        let k = 0;
        while (k < l && g == 1) {
            xs = x;
            for (let i = 0; i < m && i < l - k; i++) {
                x = f(x, c, n);
                q = mult(q, Math.abs(y - x), n);
            }
            g = gcd(q, n);
            k += m;
        }
        l *= 2;
    }
    if (g == n) {
        do {
            xs = f(xs, c, n);
            g = gcd(Math.abs(xs - y), n);
        } while (g == 1);
    }
    return g;
}

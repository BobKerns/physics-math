/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Tests of our algebra code
 */

import {factor, gcd, isComposite, isPrime, xgcd} from "../algebra";
import {not} from "../utils";
import {range} from "../generators";
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199];
const COMPOSITES = range(0, 200).filter(n => n > 1 && 0 > PRIMES.findIndex((a) => a === n));
describe('primality', () => {
    test('composites', () =>
        expect(COMPOSITES.every(isComposite))
            .toBe(true));
    test('primes not composite', () =>
        expect(PRIMES.every(not(isComposite)))
            .toBe(true));

    test('primes', () =>
        expect(PRIMES.every(isPrime))
            .toBe(true));
    test('composites not prime', () =>
        expect(COMPOSITES.every(not(isPrime)))
            .toBe(true));
});

describe('gcd', () => {
    describe('number', () => {
        test('3, 5', () => expect(gcd(3, 5)).toEqual(1));
        test('9, 15', () => expect(gcd(9, 15)).toEqual(3));
        test('10, 15', () => expect(gcd(10, 15)).toEqual(5));
        test('-10, 15', () => expect(gcd(-10, 15)).toEqual(5));
        test('10, -15', () => expect(gcd(10, -15)).toEqual(5));
        test('-10, -15', () => expect(gcd(-10, -15)).toEqual(5));
        test('11, 15', () => expect(gcd(11, 15)).toEqual(1));
    });
    describe('bigint', () => {
        test('3n, 5n', () => expect(gcd(3n, 5n)).toEqual(1n));
        test('9n, 15n', () => expect(gcd(9n, 15n)).toEqual(3n));
        test('10n, 15n', () => expect(gcd(10n, 15n)).toEqual(5n));
        test('-10n, 15n', () => expect(gcd(-10n, 15n)).toEqual(5n));
        test('10n, -15n', () => expect(gcd(10n, -15n)).toEqual(5n));
        test('-10n, -15n', () => expect(gcd(-10n, -15n)).toEqual(5n));
        test('11n, 15n', () => expect(gcd(11n, 15n)).toEqual(1n));
    });
});

describe('xgcd', () => {
    describe('number', () => {
        test('3, 5', () => expect(xgcd(3, 5)).toEqual([1, 3, 5]));
        test('9, 15', () => expect(xgcd(9, 15)).toEqual([3, 3, 5]));
        test('10, 15', () => expect(xgcd(10, 15)).toEqual([5, 2, 3]));
        test('-10, 15', () => expect(xgcd(-10, 15)).toEqual([5, -2, 3]));
        test('10, -15', () => expect(xgcd(10, -15)).toEqual([5, 2, -3]));
        test('-10, -15', () => expect(xgcd(-10, -15)).toEqual([5, -2, -3]));
        test('11, 15', () => expect(xgcd(11, 15)).toEqual([1, 11, 15]));
    });
    describe('bigint', () => {
        test('3n, 5n', () => expect(xgcd(3n, 5n)).toEqual([1n, 3n, 5n]));
        test('9n, 15n', () => expect(xgcd(9n, 15n)).toEqual([3n, 3n, 5n]));
        test('10n, 15n', () => expect(xgcd(10n, 15n)).toEqual([5n, 2n, 3n]));
        test('-10n, 15n', () => expect(xgcd(-10n, 15n)).toEqual([5n, -2n, 3n]));
        test('10n, -15n', () => expect(xgcd(10n, -15n)).toEqual([5n, 2n, -3n]));
        test('-10n, -15n', () => expect(xgcd(-10n, -15n)).toEqual([5n, -2n, -3n]));
        test('11n, 15n', () => expect(xgcd(11n, 15n)).toEqual([1n, 11n, 15n]));
    });
});

describe('factor', () => {
    const testFactor = (n: number, r: number[]) =>
        test(`${n}`, () => expect([...factor(n)])
            .toEqual(r));
    testFactor(1, []);
    testFactor(2, [2]);
    testFactor(3, [3]);
    testFactor(4, [2, 2]);
    testFactor(5, [5]);
    testFactor(6, [2, 3]);
    test('bigger', () =>
        range(2,5000)
            .forEach(n =>
                expect([...factor(n)]
                    .reduce((acc, n) => acc * n, 1))
                    .toBe(n)));
});

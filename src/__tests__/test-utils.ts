/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test functions from the utils pkg
 */

import {range} from "../utils";

describe('range', () => {
    test('simple',() => expect([...range(0, 5)])
        .toEqual([0, 1, 2, 3, 4]));
    test('asArray',() => expect(range(0, 5).asArray())
        .toEqual([0, 1, 2, 3, 4]));
    test('map',() => expect(range(0, 5).map(n => 2 * n))
        .toEqual([0, 2, 4, 6, 8]));
    test('some negative',() => expect(range(0, 5).some(n => n == 7))
        .toBeFalsy());
    test('some positive',() => expect(range(0, 5).some(n => n == 3))
        .toBeTruthy());
    test('every negative',() => expect(range(0, 5).every(n => n > 3))
        .toBeFalsy());
    test('every positive',() => expect(range(0, 5).every(n => n < 5))
        .toBeTruthy());
});

/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

import {not} from "../utils";

describe('utils', () => {
    test('not true', () =>
        expect(not(() => true)())
            .toBe(false));

    test('not false', () =>
        expect(not(() => false)())
            .toBe(true));

    test('not varadic', () =>
        Promise.resolve(not((...args) => (expect(args.length).toBe(3), false))(1, 2, 'three')));
});

/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test the common PFunction functionality.
 */

import {PFunction} from "../pfunction";
import {GFunction} from "../general-fns";
import {TYPE} from "../math-types";
import {ScalarConstant} from "../scalar";
import {Units} from "../unit-defs";

describe('PFunction', () => {
    test('create',
        () => expect(new GFunction(() => 7, Units.acceleration)).toBeInstanceOf(PFunction));
    test('invoke',
        () => expect(new GFunction((t: number) => 7 * t, Units.acceleration).f(6)).toBe(42));
    test('type GFunction',
        () => expect(new GFunction((t: number) => 7 * t, Units.acceleration).returnType).toBe(TYPE.SCALAR));
    test('type Scalar',
        () => expect(new ScalarConstant(7, Units.time).returnType).toBe(TYPE.SCALAR));
    test('Unity GFunction',
        () => expect(new GFunction((t: number) => 7 * t, Units.acceleration).unit).toBe(Units.acceleration));
    test('Unit Scalar',
        () => expect(new ScalarConstant(7, Units.time).unit).toBe(Units.time));
 });

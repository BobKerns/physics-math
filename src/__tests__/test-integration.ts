/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Various tests of integration of various functions.
 */

import {Poly} from "../poly";
import {Units} from "../unit-defs";
import R from "ramda";

describe('Poly', () => {
    const noName = R.omit(['name']);
    // noinspection PointlessArithmeticExpressionJS
    test('Integrate', () =>
        expect(noName(new Poly(Units.current, 1.5, 2.5, 3.5).integral().expression))
            .toEqual(noName(new Poly(Units.charge, 0, 1.5/1, 2.5/2, 3.5/3))));

});



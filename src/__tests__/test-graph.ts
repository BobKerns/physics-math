/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test the graphibg functionality
 */

import * as G from '../graph';

const graph = G.graph(300);

describe('Graphing', () => {
    test('Create', () =>
        expect(graph({})([]))
            .toBeInstanceOf(Element));

});

/*
 * @module NpmRollupTemplate
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/npm-typescript-rollup-template
 */

/**
 * Load the full system with a single import.
 * @packageDocumentation
 * @preferred
 * @module Index
 */


export {range,
    isIterable, isIterator, toIterable, toIterator, toIterableIterator,
    toGenerator, isGenerator, isGenable, isIterableIterator,
    isAsyncIterable, isAsyncIterator, toAsyncIterable, toAsyncIterator, toAsyncIterableIterator,
    toAsyncGenerator, isAsyncGenerator, isAsyncGenable, isAsyncIterableIterator,
    Sync, Async,
    Genable, GenUnion, FlatGen, GenType, Reducer,
    EnhancedGenerator, EnhancedAsyncGenerator, Enhanced
} from 'genutils/src/generators'

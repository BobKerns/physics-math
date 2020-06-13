/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Module definitions for external modules w/o typings.
 */



declare module '@observablehq/stdlib' {
    export namespace Generators {
        export const observe: <T>(f: (notify: (n: T) => void) => void) => AsyncIterableIterator<T>;
    }
    export const Library: ((resolver: null|((fn: string) => void)) => void);
}

/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

// We supply the missing type information for the terser plugin.

declare module "rollup-plugin-terser" {
    import {Plugin} from "rollup";
    import {MinifyOptions} from "terser";
    interface TerserPluginOptions extends MinifyOptions {
        sourcemap: boolean;
        numWorkers: number;
    }
    export function terser(options?: Partial<TerserPluginOptions>): Plugin;

}

// We supply missing type information for the visualizer plugin.

declare module "rollup-plugin-visualizer" {
    export interface OpenOptions {
        app: string | string[];
        wait: boolean;
    }
    export interface VisualizerOptions {
        filename: string;
        title: string;
        sourcemap: boolean;
        open: boolean;
        openOptions: OpenOptions;
    }

    // noinspection JSDuplicatedDeclaration,JSUnusedGlobalSymbols
    export default function visualizer(options?: Partial<VisualizerOptions>): Plugin;
}

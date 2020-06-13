/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Graphing our physics functions.
 * @packageDocumentation
 * @module graph
 * @preferred
 */

import * as d3 from 'd3';
import {BaseType} from 'd3';

import {ViewOf} from "./utils";
import {IPFunction} from "./base";

import {Unit} from "./units";

interface Line<U extends Unit> {
    fn: IPFunction<number, U>;
}

interface MouseTrackData {
    t: number;
    y: number;
    v: number[];
}

// The stdlib module isn't fully populated until initialized by Library.
import {Library} from '@observablehq/stdlib';
import * as STD from '@observablehq/stdlib';
const Generators = STD.Generators || (Library(null), STD.Generators);

type Selection<E extends BaseType = BaseType> = d3.Selection<E, undefined, null, undefined>;
export interface MouseMoveData {
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
}

export interface AxisRange {min: number, max: number}

export interface Box {
    bottom: number;
    top: number;
    left: number;
    right: number;
}

export interface GraphFormat<A extends Partial<AxisRange> = AxisRange, B extends Partial<Box> = Box> {
    domain: A;
    range: A;
    width: number;
    height: number;
    margin: Box;
}

export let DEFAULT_FORMAT: GraphFormat = {
    domain: {min: 0, max: 10},
    range: {min: 0, max: 10},
    width: 300,
    height: 150,
    margin: {bottom: 20, top: 5, left: 30, right: 5}
};

const inferDomain = (format: GraphFormat, _lines: Line<Unit>[]) => {
    // should look at lines for possible hints, e.g. from Piecewise lines.
    return {
        min: format.domain.min,
        max: format.domain.max
    };
};

const inferRange = (format: GraphFormat, _domain: AxisRange, _lines: Line<Unit>[]) => {
    // should look at lines for possible hints, e.g. from Piecewise lines,
    // endpoints of the range, polynomial min/max, etc.
    return {
        min: format.range.min,
        max: format.range.max
    };
};

const mergeDefaults = (format: Partial<GraphFormat<Partial<AxisRange>, Partial<Box>>>): GraphFormat =>
    Object.assign({}, DEFAULT_FORMAT, format);

// noinspection JSUnusedGlobalSymbols
/**
 *
 * @param defaultWidth
 */
export const graph = (defaultWidth: number) =>
    (format: Partial<GraphFormat<Partial<AxisRange>, Partial<Box>>> = {}) =>
        (lines: Line<Unit>[]) => {
            const fmt = mergeDefaults(format);
            const width = Math.min(format.width || defaultWidth, defaultWidth);
            const height = fmt.height;
            const margin = {
                bottom: fmt.margin.bottom,
                top: fmt.margin.top,
                left: fmt.margin.left,
                right: fmt.margin.right
            };
            const [dataHeight, dataWidth] = [
                height - margin.top - margin.bottom,
                width - margin.left - margin.right
            ];

            const value = {};
            const domain = inferDomain(fmt, lines);
            const range = inferRange(fmt, domain, lines);
            const scaleX = d3
                .scaleLinear()
                .domain([domain.min, domain.max])
                .range([margin.left, width - margin.right]);

            const scaleY = d3
                .scaleLinear()
                .domain([range.min, range.max])
                .range([height - margin.bottom, margin.top]);

            const svg = d3.create("svg").attr("viewBox", `0 0 ${width} ${height}`);

            const node = svg.node();
            (node as Partial<ViewOf>).value = Generators.observe((notify: (d: MouseTrackData) => void) => {
                const update = (g: d3.Selection<any, any, any, any>, mouse: MouseMoveData) => {
                    const p = d3.path();
                    p.moveTo(0, mouse.offsetY);
                    p.lineTo(dataWidth, mouse.offsetY);
                    p.moveTo(mouse.offsetX, 0);
                    p.lineTo(mouse.offsetX, dataHeight);
                    g.select('path.crosshair')
                        .classed('crosshair', true)
                        .attr('d', p.toString());
                    notify({
                        t: mouse.x,
                        y: mouse.y,
                        v: lines.map(l => l.fn.f(scaleX.invert(mouse.x)))
                    });
                };

                svg.call((g: Selection<SVGSVGElement>) =>
                    g.call((g: Selection<SVGSVGElement>) =>
                        g
                            .append("rect")
                            .attr('width', dataWidth)
                            .attr('height', dataHeight)
                    .attr('fill', '#f0f8ff')
                            .attr('stroke', 'blue')
                            .attr('x', margin.left)
                            .attr('y', margin.right)
                            .on('mousemove', _ => {
                        const mouse = {
                            x: scaleX.invert(d3.event.offsetX),
                            y: scaleY.invert(d3.event.offsetY),
                            offsetX: d3.event.offsetX - margin.left,
                            offsetY: d3.event.offsetY - margin.top
                        };
                        g.call(g => update(g, mouse));
                    })
                            .on('mouseenter', _ =>
                                g.select('path.crosshair').classed('hidden', false)
                            )
                            .on('mouseleave', _ =>
                                g.select('path.crosshair').classed('hidden', true)
                            )
                    )
                );
            });

            // In the graph coordinates
            svg
                .call((g: Selection<SVGSVGElement>) =>
                    g
                        .append('g')
                        .attr(
                            "transform",
                            `translate(${margin.left}, ${height - margin.bottom}) scale(${dataWidth /
                            10}, ${-dataHeight / 10})`
                        )
                        .call(g =>
                            lines.forEach(l =>
                                g
                                    .append("path")
                                    .attr("stroke", "steelblue")
                                    .attr("stroke-width", 0.1)
                                    .attr("fill", "none")
                                    .attr('d', l.toString())
                            )
                        )
                )

                // In cursor coordinates
                .call(g =>
                    g
                        .append('path')
                        .classed('crosshair', true)
                        .attr('transform', `translate(${margin.left}, ${margin.right})`)
                        .attr('stroke', "gray")
                        .attr('stroke-width', 0.25)
                );

            const xAxis = (g: Selection<SVGGElement>) =>
                g
                    .attr("transform", `scale(1, 1), translate(0,${height - margin.bottom})`)
                    .call(
                        d3
                            .axisBottom(scaleX)
                            .ticks(10)
                            .tickFormat(scaleX.tickFormat())
                            .tickSizeOuter(0)
                    );
            svg.append("g").call(xAxis);

            const yAxis = (g: Selection<SVGGElement>) =>
                g
                    .attr("transform", `scale(1, 1), translate(${margin.left},${margin.top})`)
                    .call(
                        d3
                            .axisLeft(scaleY)
                            .ticks(5, '%2.1')
                            .tickFormat(scaleY.tickFormat())
                            .tickSizeOuter(1)
                    );
            svg.append("g").call(yAxis);
            (node as any).value = value;
            return node;
        };

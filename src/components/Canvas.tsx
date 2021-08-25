/* eslint-disable no-underscore-dangle */
/**
 * Library/implementation of the various rendering of tree in canvas and d3.js
 */

import React, { useState } from 'react';
import * as d3 from 'd3';
import { HierarchyPointLink, HierarchyPointNode } from 'd3';
import TreeNode from './Tree';

const createPathsandNodes = (
  radialTree: d3.HierarchyPointNode<TreeNode>,
  svgElement: SVGSVGElement,
  height: number,
  width: number
): void => {
  // paths between nodes in the tree: represented by links variable
  const links = radialTree.links();
  const nodes = radialTree.descendants();

  const individualLink = d3
    .linkRadial<HierarchyPointLink<TreeNode>, HierarchyPointNode<TreeNode>>()
    .angle((d) => d.x)
    .radius((d) => d.y);

  let svg = d3.select<SVGGElement, any>(svgElement).attr('width', width).attr('height', height);
  svg = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
  svg
    .attr('fill', 'none')
    .attr('stroke', '#555')
    // .attr('stroke-opacity', 0.4)
    // .attr('stroke-width', 1.5)
    .selectAll('.line')
    .data(links)
    .join(
      (enter) => enter.append('path').attr('class', 'link').attr('d', individualLink),
      (exit) => exit.remove()
    );

  const node = svg
    .selectAll('.node')
    .data(nodes)
    .join(
      (enter) =>
        enter
          .append('g')
          .attr('class', 'node')
          .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y}, 0)`),
      (exit) => exit.remove()
    );

  node.append('circle').attr('r', 5);

  // adding the file names for each node
  node
    .append('text')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('stroke-linejoin', 'round')
    // .attr('stroke-width', 3)
    .attr('dx', (d) => (d.x < Math.PI ? 8 : -8))
    .attr('dy', '.31em')
    .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
    .attr('transform', (d) => (d.x < Math.PI ? null : 'rotate(180)'))
    .text((d) => {
      const obj = d.data as TreeNode;
      return obj.filename;
    });
};

// Main Radial Tree generation function
const RadialTree = (rootNode: TreeNode, svgElement: SVGSVGElement) => {
  // setting the parameters
  const width = svgElement.clientWidth;
  const height = svgElement.clientHeight;

  const data = d3.hierarchy(rootNode); // the rootNode of our d3 tree
  const diameter = height * 0.875;
  const radius = diameter / 2;

  const treeStructure = d3
    .tree<TreeNode>()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 2 : 4) / a.depth);
  // separation() : setting the distance between neighbouring noted

  // adding our data to the empty tree structure
  // create the svg with attributes and group element <g>
  const radialTree = treeStructure(data);
  createPathsandNodes(radialTree, svgElement, height, width);
  // d3.select(svgElement).exit().remove();
};

export default RadialTree;

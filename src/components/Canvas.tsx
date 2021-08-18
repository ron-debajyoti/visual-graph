/**
 * Library/implementation of the various rendering of tree in canvas and d3.js
 */

import React, { useState } from 'react';
import * as d3 from 'd3';
import { HierarchyPointLink, HierarchyPointNode } from 'd3';
import TreeNode from './Tree';

const RadialTree = (rootNode: TreeNode, ctx: CanvasRenderingContext2D) => {
  // setting the parameters
  const { width, height } = ctx.canvas;

  const data = d3.hierarchy(rootNode); // the rootNode of our d3 tree
  const diameter = height * 0.75;
  const radius = diameter / 2;

  const treeStructure = d3
    .tree<TreeNode>()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 10 : 20) / a.depth);
  // separation() : setting the distance between neighbouring noted

  // adding our data to the empty tree structure
  // create the svg with attributes and group element <g>
  const radialTree = treeStructure(data);
  const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  // paths between nodes in the tree: represented by links variable
  const links = radialTree.links();
  const nodes = radialTree.descendants();

  const individualLink = d3
    .linkRadial<HierarchyPointLink<TreeNode>, HierarchyPointNode<TreeNode>>()
    .angle((d) => d.x)
    .radius((d) => d.y);

  svg
    // .attr('fill', 'none')
    // .attr('stroke', '#555')
    // .attr('stroke-opacity', 0.4)
    // .attr('stroke-width', 1.5)
    .selectAll('.line')
    .data(links)
    .join('path')
    .attr('class', 'link')
    .attr('d', individualLink);

  const node = svg
    .selectAll('.node')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y}, 0)`);

  node.append('circle').attr('r', 1);
  node
    .append('text')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-width', 3)
    .attr('dx', (d) => (d.x < Math.PI ? 8 : -8))
    .attr('dy', '.31em')
    .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
    .attr('transform', (d) => (d.x < Math.PI ? null : 'rotate(180)'))
    .text((d) => {
      const obj = d.data as TreeNode;
      return obj.filename;
    });
};

export default RadialTree;

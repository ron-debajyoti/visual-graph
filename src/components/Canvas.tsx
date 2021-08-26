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

  const newNodes: d3.HierarchyPointNode<TreeNode>[] = nodes.map((d) => {
    const dNew = { ...d };
    dNew.y = dNew.depth * 65;
    return dNew;
  });

  const individualLink = d3
    .linkRadial<HierarchyPointLink<TreeNode>, HierarchyPointNode<TreeNode>>()
    .angle((d) => d.x)
    .radius((d) => d.depth * 65);

  const svgOutline = d3
    .select<SVGGElement, any>(svgElement)
    // .attr('preserveAspectRatio', 'xMinYmIn meet')
    .attr('viewBox', `0 0 ${width} ${height}`);
  const svg = svgOutline.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

  /* Calling zoom on <g> but attaching the svgOutline 
  because mouse pointer doesnt automatically point to <g> 
  */
  svgOutline.call(
    d3
      .zoom<SVGGElement, any>()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        console.log(event);
        svg.attr(
          'transform',
          `translate(${width / 2} ,${height / 2}) 
          scale(${event.transform.k}) 
          translate(${event.transform.x},${event.transform.y})`
        );
      })
  );

  // Add link paths and nodes
  svg
    .attr('fill', 'none')
    .attr('stroke', '#555')
    // .attr('stroke-opacity', 0.4)
    // .attr('stroke-width', 1.5)
    .selectAll<SVGGElement, any>('.line')
    .data(links)
    .join(
      (enter) => enter.append('path').attr('class', 'link').attr('d', individualLink),
      (exit) => exit.remove()
    );

  const node = svg
    .selectAll<SVGGElement, any>('.node')
    .data(newNodes)
    .join(
      (enter) =>
        enter
          .append('g')
          .attr('class', 'node')
          .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y}, 0)`),
      (exit) => exit.remove()
    );

  node
    .append('circle')
    .attr('r', 5)
    .attr('fill', (d) => {
      if (d.children) {
        return '#03adfc';
      }
      return '#555';
    });

  // Event Handling of mouse over and mouse out
  node.on('mouseover', (event) => {
    console.log(event);
    d3.select(event.target).attr('r', 10);
  });

  node.on('mouseout', (event) => {
    console.log(event);
    d3.select(event.target).attr('r', 5);
  });

  // adding the file names for each node
  node
    .append('text')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('stroke-linejoin', 'round')
    // .attr('stroke-width', 3)
    .attr('dx', (d) => (d.x < Math.PI ? 8 : -8))
    .attr('dy', '1.5em')
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

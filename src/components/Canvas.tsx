/* eslint-disable no-param-reassign */
/**
 * Library/implementation of the various rendering of tree in canvas and d3.js
 */

import React, { useState } from 'react';
import * as d3 from 'd3';
import { HierarchyPointLink, HierarchyPointNode } from 'd3';
import TreeNode from './Tree';

const createPathsandNodes = (
  radialTree: d3.HierarchyPointNode<TreeNode>,
  svg: d3.Selection<SVGGElement, unknown, null, undefined>
): void => {
  // paths between nodes in the tree: represented by links variable
  const individualLink = d3
    .linkRadial<HierarchyPointLink<TreeNode>, HierarchyPointNode<TreeNode>>()
    .angle((d) => d.x)
    .radius((d) => d.y);

  const gLink = svg.attr('fill', 'none').attr('stroke', '#555');
  const gNode = svg.attr('stroke-linejoin', 'round');

  const newData = (animate: boolean = true) => {
    const linkData = radialTree.links();
    const links = gLink
      .selectAll<SVGGElement, any>('path')
      .data(linkData, (d) => `${d.source.data.filename}_ ${d.target.data.filename}`);
    links.exit().remove();

    console.log('LLIIINKKKSS : ', links);
    const newLinks = links.enter().append('path').attr('class', 'link').attr('d', individualLink);

    const allLinks = gLink.selectAll<SVGGElement, any>('path');
    allLinks
      .transition()
      .duration(animate ? 400 : 10)
      .ease(d3.easeLinear)
      .on('end', () => {
        const box = svg.node()?.getBBox();
        if (box) {
          svg
            .transition()
            .duration(1000)
            .attr('viewbox', `${box.x} ${box.y} ${box.width} ${box.height}`);
        }
      })
      .attr('d', individualLink);

    //
    const nodesData = radialTree.descendants().reverse();
    console.log('NODE DATA : ', nodesData);
    const nodes = gNode.selectAll<SVGGElement, any>('g').data(nodesData, (d) => {
      if (d) {
        if (d.parent) {
          return d.parent.data.filename + d.data.filename;
        }
        return d.data.name;
      }
      return '';
    });

    nodes.exit().remove();
    const newNodes = nodes.enter().append('g');
    const allNodes = animate
      ? gNode
          .selectAll<SVGGElement, any>('g')
          .transition()
          .duration(animate ? 400 : 10)
          .ease(d3.easeLinear)
          .on('end', () => {
            const box = svg.node()?.getBBox();
            if (box) {
              svg
                .transition()
                .duration(1000)
                .attr('viewbox', `${box.x} ${box.y} ${box.width} ${box.height}`);
            }
          })
          .attr('d', individualLink)
      : gNode.selectAll<SVGGElement, any>('g');
    allNodes.attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y}, 0)`);

    newNodes
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d) => {
        if (d.children) {
          return '#03adfc';
        }
        return '#555';
      })
      .on('click', (event) => {
        const d: any = d3.select(event.target);
        console.log('------------>>>>>>>>>>', d);
        const altChildren = d.data.children || [];
        const { children } = d.data;
        d.data.children = altChildren;
        d.data.altChildren = children;
        newData();
      });

    gNode.selectAll<SVGGElement, any>('g.circle').attr('fill', (d) => {
      const altChildren = d.data.altChildren || [];
      const { children } = d.data;
      return d.children || (children && (children.length > 0 || altChildren.length > 0))
        ? '#555'
        : '#999';
    });

    newNodes
      .append('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('dy', '1em')
      .text((d) => {
        const obj = d.data as TreeNode;
        return obj.filename;
      })
      .clone(true)
      .lower()
      .attr('stroke', 'white');

    gNode
      .selectAll<SVGGElement, any>('g.text')
      .attr('dx', (d) => (d.x < Math.PI ? 8 : -8))
      .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
      // .attr('text-anchor', (d) => (d.x < Math.PI === !d.children ? 'start' : 'end'))
      .attr('transform', (d) => (d.x < Math.PI ? null : 'rotate(180)'));
  };

  newData(false);
};

// Main Radial Tree generation function
const RadialTree = (rootNode: TreeNode, svgElement: SVGSVGElement) => {
  // setting the parameters
  const width = svgElement.clientWidth;
  const height = svgElement.clientHeight;
  console.log(width, height);

  const data = d3.hierarchy(rootNode); // the rootNode of our d3 tree
  const diameter = height * 0.875;
  const radius = diameter / 2;

  const treeStructure = d3
    .tree<TreeNode>()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 1 : 0.75) / a.depth);
  // separation() : setting the distance between neighbouring noted

  // adding our data to the empty tree structure
  // create the svg with attributes and group element <g>
  const radialTree = treeStructure(data);
  const svg = d3
    .select(svgElement)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  createPathsandNodes(radialTree, svg);
  // d3.select(svgElement).exit().remove();
};

export default RadialTree;

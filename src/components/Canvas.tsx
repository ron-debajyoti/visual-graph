/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/**
 * Library/implementation of the various rendering of tree in canvas and d3.js
 */

import React, { useState } from 'react';
import * as d3 from 'd3';
import { HierarchyPointLink, HierarchyPointNode } from 'd3';
import TreeNode from './Tree';

interface ExtendedTreeHierarchy extends d3.HierarchyPointNode<TreeNode> {
  x0?: number;
  y0?: number;
  iden?: number;
  tempChildren?: ExtendedTreeHierarchy[] | null;
}

// const convertChildrenInterface = (root: d3.HierarchyPointNode<TreeNode>): ExtendedTreeHierarchy => {
//   const newRoot: ExtendedTreeHierarchy = { ...root, tempChildren: null };
//   if (newRoot.children) {
//     const newChildren: ExtendedTreeHierarchy[] = newRoot.children.map((child) =>
//       convertChildrenInterface(child)
//     );
//     newRoot.children = newChildren;
//     newRoot.tempChildren = newChildren;
//   }
//   return newRoot;
// };

const radialChartGenerator = (
  svg: d3.Selection<SVGGElement, any, null, undefined>,
  tree: d3.TreeLayout<TreeNode>,
  data: d3.HierarchyNode<TreeNode>,
  graphLinkFunction: d3.LinkRadial<
    any,
    d3.HierarchyPointLink<TreeNode>,
    d3.HierarchyPointNode<TreeNode>
  >
) => {
  // Add link paths and nodes
  const svgLink = svg.attr('fill', 'none').attr('stroke', '#555');
  const svgNode = svg.append('g').attr('stroke-linejoin', 'round').attr('stroke-width', 1);

  const update = (animate: boolean = true) => {
    const radialTree = tree(data);
    console.log(`!!!!!!!!!!!!!!!!!!!1`, animate);
    const links = radialTree.links();
    const nodes = radialTree.descendants();

    const newNodes: d3.HierarchyPointNode<TreeNode>[] = nodes.map((d) => {
      const dNew = { ...d };
      dNew.y = dNew.depth * 75;
      return dNew;
    });

    // making all links
    const linkGroup = svgLink.selectAll<SVGGElement, any>('.line').data(links);
    linkGroup.exit().remove();
    linkGroup.enter().append('path').attr('class', 'link').attr('d', graphLinkFunction);

    const transitionFn = d3
      .transition<SVGGElement>()
      .duration(animate ? 450 : 20)
      .ease(d3.easeLinear)
      .on('end', () => {
        const box = svg.select<SVGGElement>('g').node()?.getBBox();
        if (box) {
          svg
            .transition()
            .duration(1000)
            .attr('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
        }
      });

    const allLinks = linkGroup.selectAll<SVGGElement, any>('path');
    allLinks
      .transition()
      .duration(animate ? 450 : 0)
      .ease(d3.easeLinear)
      .on('end', () => {
        const box = svg.select<SVGGElement>('g').node()?.getBBox();
        if (box) {
          svg
            .transition()
            .duration(1000)
            .attr('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
        }
      });

    // making all nodes
    const nodeGroup = svgNode.selectAll<SVGGElement, any>('g').data(newNodes);
    nodeGroup.exit().remove();
    const node = nodeGroup.enter().append('g');
    const allNodes = animate
      ? svgNode
          .selectAll<SVGGElement, any>('g')
          .transition()
          .duration(animate ? 450 : 20)
          .ease(d3.easeLinear)
          .on('end', () => {
            const box = svg.select<SVGGElement>('g').node()?.getBBox();
            if (box) {
              svg
                .transition()
                .duration(1000)
                .attr('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
            }
          })
      : svgNode.selectAll<SVGGElement, any>('g');

    allNodes.attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y}, 0)`);
    node
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d) => {
        if (d.children) {
          return '#03adfc';
        }
        return '#555';
      });

    // adding the file names for each node
    node
      .append('text')
      .attr('font-family', 'sans-serif')
      .attr('fill', '#999')
      .attr('font-size', 12)
      .attr('dx', (d) => (d.x < Math.PI ? 8 : -8))
      .attr('dy', '1.5em')
      .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
      .attr('transform', (d) => (d.x < Math.PI ? null : 'rotate(180)'))
      .text((d) => {
        const obj = d.data as TreeNode;
        return obj.filename;
      });

    // Event Handling of mouse over and mouse out
    node.on('mouseover', (event) => {
      d3.select(event.target).attr('r', 10);
    });

    node.on('mouseout', (event) => {
      d3.select(event.target).attr('r', 5);
    });

    node.on('click', (event, d) => {
      if (d.children) {
        const { tempChildren } = d.data || [];
        const { children } = d;
        d.children = tempChildren;
        d.data.tempChildren = children;
        console.log(d);
        update();
      }
    });
  };

  update(false);
};

const createPathsandNodes = (
  tree: d3.TreeLayout<TreeNode>,
  data: d3.HierarchyNode<TreeNode>,
  svgElement: SVGSVGElement,
  height: number,
  width: number
): void => {
  // paths between nodes in the tree: represented by links variable

  const individualLink = d3
    .linkRadial<HierarchyPointLink<TreeNode>, HierarchyPointNode<TreeNode>>()
    .angle((d) => d.x)
    .radius((d) => d.depth * 75);

  // const baseSVG = d3.select<SVGGElement, any>(svgElement).attr('viewBox', `0 0 ${width} ${height}`);
  const baseSVG = d3
    .select<SVGGElement, any>(svgElement)
    .style('width', '100%')
    .style('height', '100%');
  const svg = baseSVG.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

  /* Calling zoom on <g> but attaching the svgOutline 
  because mouse pointer doesnt automatically point to <g> 
  */
  baseSVG.call(
    d3
      .zoom<SVGGElement, any>()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        svg.attr(
          'transform',
          `translate(${width / 2} ,${height / 2}) 
          scale(${event.transform.k}) 
          translate(${event.transform.x},${event.transform.y})`
        );
      })
  );

  radialChartGenerator(svg, tree, data, individualLink);
};

// Main Radial Tree generation function
const RadialTree = (rootNode: TreeNode, svgElement: SVGSVGElement) => {
  const width = svgElement.clientWidth;
  const height = svgElement.clientHeight;

  const data = d3.hierarchy(rootNode); // the rootNode of our d3 tree
  const diameter = height * 0.875;
  const radius = diameter / 2;

  const treeStructure = d3
    .tree<TreeNode>()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 2 : 9) / a.depth);

  createPathsandNodes(treeStructure, data, svgElement, height, width);
};

export default RadialTree;

/* eslint-disable no-mixed-operators */
/* eslint-disable no-param-reassign */
/**
 * Library/implementation of the various rendering of tree in canvas and d3.js
 */

import * as d3 from 'd3';
import { HierarchyPointLink, HierarchyPointNode } from 'd3';
import TreeNode from './Tree';

/**
 * 
 * @param svg The base SVG of the radial chart
 * @param tree The d3 tree hierarchy used
 * @param data The tree data in the form of TreeNode data structure
 * @param graphLinkFunction The link function connecting nodes and links

 * Generates the whole radial chart
 */
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
  // The main group Element containing the link group and nodes group
  const mainGroupElement = svg.append('g').attr('class', 'main-group');
  const svgLinkGroup = mainGroupElement
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5);
  const svgNodeGroup = mainGroupElement
    .append('g')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-width', 3);

  /**
   * @param animate boolean
   *
   * constructs the radial chart and updates it according to
   * data changes in the radial tree
   */
  const update = (animate: boolean = true) => {
    const root = tree(data);
    const linkData = root.links();
    const links = svgLinkGroup
      .selectAll<SVGGElement, any>('path')
      .data(linkData, (d) => `${d.source.data.filename}_${d.target.data.filename}`);

    links.exit().remove();
    links
      .enter()
      .append('path')
      .attr(
        'd',
        d3
          .linkRadial<HierarchyPointLink<TreeNode>, HierarchyPointNode<TreeNode>>()
          .angle((d) => d.x)
          .radius((d) => 0.1)
      );

    const allLinks = svgLinkGroup.selectAll<SVGGElement, any>('path');
    allLinks
      .transition()
      .duration(animate ? 450 : 0)
      .ease(d3.easeLinear)
      .on('end', () => {
        const box = mainGroupElement.node()?.getBBox();
        if (box) {
          svg
            .transition()
            .duration(1000)
            .attr('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
        }
      })
      .attr('d', graphLinkFunction);

    /**
     * Nodes
     */
    const nodesData = root.descendants().reverse();
    const nodes = svgNodeGroup.selectAll<SVGGElement, any>('g').data(nodesData, (d) => {
      if (d.parent) {
        return d.parent.data.filename + d.data.filename;
      }
      return d.data.filename;
    });

    nodes.exit().remove();
    const newNodes = nodes.enter().append('g');
    const allNodes = animate
      ? svgNodeGroup
          .selectAll<SVGGElement, any>('g')
          .transition()
          .duration(animate ? 450 : 0)
          .ease(d3.easeLinear)
          .on('end', () => {
            const box = mainGroupElement.node()?.getBBox();
            if (box) {
              svg
                .transition()
                .duration(1000)
                .attr('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
            }
          })
      : svgNodeGroup.selectAll<SVGGElement, any>('g');
    allNodes.attr(
      'transform',
      (d) => `
    rotate(${(d.x * 180) / Math.PI - 90})
    translate(${d.y},0)`
    );

    newNodes
      .append('circle')
      .attr('r', 5)
      .on('click', (event, d) => {
        const { tempChildren } = d.data || [];
        const { children } = d;
        const temp = children;
        d.children = tempChildren || undefined;
        d.data.tempChildren = temp || null;
        update();
      });

    svgNodeGroup
      .selectAll<SVGGElement, any>('g circle')
      .attr('fill', (d) => (d.data.children ? '#03adfc' : '#555'));

    newNodes
      .append('text')
      .attr('font-size', '11')
      .attr('dy', '0.31em')
      .text((d) => d.data.filename)
      .clone(true)
      .lower();

    svgNodeGroup
      .selectAll<SVGGElement, any>('g text')
      .attr('x', (d) => (d.x < Math.PI === !d.children ? 9 : -9))
      .attr('text-anchor', (d) => (d.x < Math.PI === !d.children ? 'start' : 'end'))
      .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null));

    // Event Handling of mouse over and mouse out
    newNodes.on('mouseover', (event) => {
      d3.select(event.target).attr('r', 10);
    });

    newNodes.on('mouseout', (event) => {
      d3.select(event.target).attr('r', 5);
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
    .radius((d) => d.y);

  // const baseSVG = d3.select<SVGGElement, any>(svgElement).attr('viewBox', `0 0 ${width} ${height}`);
  const baseSVG = d3
    .select<SVGGElement, any>(svgElement)
    .style('width', '100%')
    .style('height', '100%')
    .style('padding', '10px')
    .style('box-sizing', 'border-box')
    .attr('font', '12px sans-serif');
  // const svg = baseSVG.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

  /* Calling zoom on <g> but attaching the svgOutline 
  because mouse pointer doesnt automatically point to <g> 
  */
  // baseSVG.call(
  //   d3
  //     .zoom<SVGGElement, any>()
  //     .extent([
  //       [0, 0],
  //       [width, height],
  //     ])
  //     .scaleExtent([1, 8])
  //     .on('zoom', (event) => {
  //       svg.attr(
  //         'transform',
  //         `translate(${width / 2} ,${height / 2})
  //         scale(${event.transform.k})
  //         translate(${event.transform.x},${event.transform.y})`
  //       );
  //     })
  // );

  radialChartGenerator(baseSVG, tree, data, individualLink);
};

// Main Radial Tree generation function
const RadialTree = (rootNode: TreeNode, svgElement: SVGSVGElement) => {
  const width = svgElement.clientWidth;
  const height = svgElement.clientHeight;

  const data = d3.hierarchy(rootNode); // the rootNode of our d3 tree
  const diameter = height;
  const radius = diameter / 2;

  const treeStructure = d3
    .tree<TreeNode>()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 1.5 : 10) / a.depth);

  createPathsandNodes(treeStructure, data, svgElement, height, width);
};

export default RadialTree;

/* eslint-disable no-mixed-operators */
/* eslint-disable no-param-reassign */
/**
 * Library/implementation of the various rendering of tree in canvas and d3.js
 */

import * as d3 from 'd3';
import { HierarchyPointLink, HierarchyPointNode } from 'd3';
import TreeNode from '../Tree';

const collapsibleNode = (d: d3.HierarchyPointNode<TreeNode>) => {
  if (d.children) {
    const { tempChildren } = d.data || [];
    const { children } = d;
    const temp = children;
    d.children = tempChildren || undefined;
    d.data.tempChildren = temp || null;
  }
  if (d.data.tempChildren) {
    d.data.tempChildren.forEach((item) => collapsibleNode(item));
  }
};

const collapseTreeCheck = (root: d3.HierarchyPointNode<TreeNode>) => {
  if (root.children && root.children?.length > 20) {
    root.children?.forEach((d) => collapsibleNode(d));
  }
};

/**
  * 
  * @param svg The base SVG of the radial chart
  * @param tree The d3 tree hierarchy used
  * @param data The tree data in the form of TreeNode data structure
  * @param graphLinkFunction The link function connecting nodes and links
 
  * Generates the whole radial chart
  */
const RadialChartGenerator = (
  svg: d3.Selection<SVGGElement, any, null, undefined>,
  tree: d3.TreeLayout<TreeNode>,
  data: d3.HierarchyNode<TreeNode>,
  graphLinkFunction: d3.LinkRadial<
    any,
    d3.HierarchyPointLink<TreeNode>,
    d3.HierarchyPointNode<TreeNode>
  >
): void => {
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

  let root = tree(data);
  collapseTreeCheck(root);

  /**
   * @param animate boolean
   *
   * constructs the radial chart and updates it according to
   * data changes in the radial tree
   */
  const update = (animate: boolean = true): void => {
    root = tree(data);
    // console.log('COLlAPSE CHECK DONE: ', root);

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
        const box = svg.node()?.getBBox();
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
            const box = svg.node()?.getBBox();
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

    // newNodes.append('circle').attr('r', 5);
    newNodes.attr('class', (d) => {
      if (d.data.children || d.data.tempChildren) return 'folder';
      return 'file';
    });

    const folderNodes = d3.selectAll<SVGGElement, any>('.folder');
    const fileNodes = d3.selectAll<SVGGElement, any>('.file');
    folderNodes.append('rect').attr('width', 10).attr('height', 10);
    fileNodes.append('circle').attr('r', 5);

    newNodes.on('click', (event, d) => {
      if (d.data.children) {
        const { tempChildren } = d.data || [];
        const { children } = d;
        const temp = children;
        d.children = tempChildren || undefined;
        d.data.tempChildren = temp || null;
        update();
      }
    });

    svgNodeGroup.selectAll<SVGGElement, any>('g circle').attr('fill', '#03adfc');
    svgNodeGroup.selectAll<SVGGElement, any>('g rect').attr('fill', '#555');

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

    // Event Handling of zoom, mouse over and mouse out

    /* Calling zoom on <g> but attaching the svgOutline 
       because mouse pointer doesnt automatically point to <g> 
     */
    svg.call(
      d3
        .zoom<SVGGElement, any>()
        .scaleExtent([1, 32])
        .on('zoom', (event) => {
          mainGroupElement.attr(
            'transform',
            `scale(${event.transform.k})
             translate(${event.transform.x},${event.transform.y})`
          );
        })
    );

    newNodes.on('mouseover', (event) => {
      const { target } = event;
      if (target.nodeName === 'rect') {
        d3.select(target).attr('width', 15);
        d3.select(target).attr('height', 15);
      } else {
        d3.select(target).attr('r', 10);
      }
    });

    newNodes.on('mouseout', (event) => {
      const { target } = event;
      if (target.nodeName === 'rect') {
        d3.select(target).attr('width', 10);
        d3.select(target).attr('height', 10);
      } else {
        d3.select(target).attr('r', 5);
      }
    });
  };

  update(false);
};

const RadialChart = (
  tree: d3.TreeLayout<TreeNode>,
  data: d3.HierarchyNode<TreeNode>,
  svgElement: SVGSVGElement
): void => {
  // paths between nodes in the tree: represented by links variable

  const individualLink = d3
    .linkRadial<HierarchyPointLink<TreeNode>, HierarchyPointNode<TreeNode>>()
    .angle((d) => d.x)
    .radius((d) => d.y);

  // const baseSVG = d3.select<SVGGElement, any>(svgElement).attr('viewBox', `0 0 ${width} ${height}`);
  const baseSVG = d3.select<SVGGElement, any>(svgElement).style('box-sizing', 'border-box');

  RadialChartGenerator(baseSVG, tree, data, individualLink);
};

export default RadialChart;

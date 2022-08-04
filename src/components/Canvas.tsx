/**
 * Base implementation of the various rendering of tree in canvas and d3.js
 */

import * as d3 from 'd3';
import TreeNode from './Tree';
import RadialChart from './charts/RadialChart';

// Main Radial Tree generation function
const CanvasRenderer = (rootNode: TreeNode, svgElement: SVGSVGElement) => {
  const height = svgElement.clientHeight;

  const data = d3.hierarchy(rootNode); // the rootNode of our d3 tree
  const diameter = height;
  const radius = diameter / 2;

  const treeStructure = d3
    .tree<TreeNode>()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 2 : 15) / a.depth);

  RadialChart(treeStructure, data, svgElement);
};

export default CanvasRenderer;

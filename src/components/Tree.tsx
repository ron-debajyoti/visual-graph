/**
 * The whole TreeNode data structure
 * -- constuctor method
 * -- traversal method
 * -- canvas render method
 */

import { HierarchyPointNode } from 'd3';
import { FileType } from './types';

// const arrayToTreeNode: TreeNode = (input: Array<string>, tree: TreeNode) => {
//   const name = input.shift();
//   const index =

// }

class TreeNode {
  public filename: string;

  public fileType: FileType;

  public children: Array<TreeNode> | null;

  public tempChildren: HierarchyPointNode<TreeNode>[];

  constructor(name: string, fileType: string) {
    this.filename = name;
    this.fileType = fileType === 'blob' ? 'leaf' : 'tree';
    this.children = fileType === 'blob' ? null : [];
    this.tempChildren = [];
    this.find = this.find.bind(this);
  }

  public find = (name: string): TreeNode | null => {
    if (this.filename === name) {
      return this;
    }
    if (this.children) {
      let result = null;
      if (this.children.length > 0) {
        this.children.forEach((childNode) => {
          result = childNode.find(name);
        });
        return result;
      }
    }
    return null;
  };
}

export default TreeNode;

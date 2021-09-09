/**
 * The whole TreeNode data structure
 * -- constuctor method
 * -- traversal method
 * -- canvas render method
 */

import { HierarchyPointNode } from 'd3';
import { File } from './types';

// const arrayToTreeNode: TreeNode = (input: Array<string>, tree: TreeNode) => {
//   const name = input.shift();
//   const index =

// }

class TreeNode {
  public filename: string;

  public file: File;

  public children: Array<TreeNode> | null;

  public tempChildren: HierarchyPointNode<TreeNode>[] | null;

  constructor(name: string, fileType: string, filePath?: string, fileSha?: string | null) {
    this.filename = name;
    this.file = {
      path: filePath || null,
      sha: fileSha || null,
      type: fileType === 'blob' ? 'leaf' : 'tree',
    } as File;
    this.children = fileType === 'blob' ? null : [];
    this.tempChildren = null;
    this.find = this.find.bind(this);
  }

  public find = (name: string, path: string | null): TreeNode | null => {
    if (this.filename === name && (this.file.path === path || this.file.path === null)) {
      return this;
    }
    if (this.children) {
      let result = null;
      if (this.children.length > 0) {
        this.children.forEach((childNode) => {
          result = childNode.find(name, path);
        });
        return result;
      }
    }
    return null;
  };
}

export default TreeNode;

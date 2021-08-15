/**
 * The whole TreeNode data structure
 * -- constuctor method
 * -- traversal method
 * -- canvas render method
 */

import { File, FileType } from './types';

// const arrayToTreeNode: TreeNode = (input: Array<string>, tree: TreeNode) => {
//   const name = input.shift();
//   const index =

// }

class TreeNode {
  public filename: string;

  public fileType: FileType;

  public children: Array<TreeNode>;

  constructor(name: string, fileType: string) {
    this.filename = name;
    this.children = [];
    this.fileType = fileType === 'blob' ? 'leaf' : 'tree';
    this.find = this.find.bind(this);
  }

  public find = (name: string): TreeNode | null => {
    if (this.filename === name) {
      return this;
    }
    if (this.children.length > 0) {
      let result = null;
      if (this.children.length > 0) {
        this.children.forEach((childNode) => {
          result = this.find(name);
        });
        return result;
      }
    }
    return null;
  };
}

export default TreeNode;

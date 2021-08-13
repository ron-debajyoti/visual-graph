/**
 * The whole TreeNode data structure
 * -- constuctor method
 * -- traversal method
 * -- canvas render method
 */

import { FileType } from './types';

class TreeNode {
  public fileName: string;

  public fileType: FileType;

  public children: Array<TreeNode>;

  constructor(name: string, fileType: string) {
    this.fileName = name;
    this.children = [];
    this.fileType = fileType === 'blob' ? 'leaf' : 'tree';
  }
}

export default TreeNode;

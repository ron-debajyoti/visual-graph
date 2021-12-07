/**
 * The whole TreeNode data structure
 * -- constuctor method
 * -- traversal method
 * -- canvas render method
 */

import { HierarchyPointNode } from 'd3';
import { File, FileProperty, FileType } from './types';

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
      type: (fileType === 'blob' ? 'leaf' : 'tree') as FileType,
      property: this.propertySetter(name, fileType) as FileProperty,
    } as File;
    this.children = fileType === 'blob' ? null : [];
    this.tempChildren = null;
    this.find = this.find.bind(this);
  }

  private propertySetter = (name: string, fileType: string): FileProperty => {
    if (
      name.endsWith('.txt') ||
      name.endsWith('.eslintignore') ||
      name.endsWith('.husky') ||
      name.endsWith('.prettierrc') ||
      name.endsWith('.md') ||
      name.endsWith('.toml') ||
      name.endsWith('.json') ||
      name.endsWith('.yml') ||
      name.endsWith('.sh') ||
      name.endsWith('.lock')
    )
      return 'config' as FileProperty;

    if (name.match('test')) {
      if (fileType !== 'blob') return 'test' as FileProperty;

      if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js'))
        return 'test' as FileProperty;
      return 'build' as FileProperty;
    }
    return 'build' as FileProperty;
  };

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

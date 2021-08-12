/**
 * The whole TreeNode data structures of files with their file names
 */

class TreeNode {
  public value: string;

  public descendents: Array<TreeNode>;

  constructor(value: string) {
    this.value = value;
    this.descendents = [];
  }
}

export default TreeNode;

// interfaces used in the project
export interface Commit {
  sha: string;
  url: string;
}

export interface Branch {
  name: string;
  protected: boolean;
  commit: Commit;
}

export interface GitRepository {
  owner: string;
  repo: string;
  branches: Array<Branch>;
  defaultBranch: string;
}

export interface File {
  path: string;
  sha: string;
  mode: string;
  type: FileType;
}

// types used in the project
export type FileType = 'leaf' | 'tree';

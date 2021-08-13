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
  mainBranch: string;
}

// types used in the project
export type FileType = 'leaf' | 'tree';

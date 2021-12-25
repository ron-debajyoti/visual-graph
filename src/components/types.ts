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
  path: string | null;
  sha: string | null;
  mode?: string;
  type: FileType;
  property: FileProperty;
  circleCoordinates: Array<Coordinate> | undefined;
}

export interface Coordinate {
  x: number;
  y: number;
}

// types used in the project
export type FileType = 'leaf' | 'tree';
export type FileProperty = 'test' | 'config' | 'build' | 'style' | 'image';

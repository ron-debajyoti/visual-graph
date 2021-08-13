/**
 * props: project directory details
 * Implementation:
 * - Make the whole tree here from props.
 * - construct the canvas from the tree
 */

import React, { useState, useEffect } from 'react';
import TreeNode from './Tree';
import { FileType, GitRepository } from './types';
import { fetchData, fetchBranches } from './utils/Utility';

interface Directory {
  files: Array<string>;
  fileType: FileType;
}

const Process = (props: object) => {
  /*
    Initializing hooks used in
  */
  const [gitRepository, setGitRepository] = useState<GitRepository>({
    owner: 'ron-debajyoti',
    repo: 'easy-visualify',
    branches: [],
    mainBranch: 'master',
  });
  const [rootDir, setDir] = useState<Directory>({
    files: [],
    fileType: 'tree',
  });

  useEffect(() => {
    /*
      Fetching the initial data based on master branch
        - uget and update branches, mainBranch in gitRepository
    */
    async function updateGitRepo(): Promise<GitRepository> {
      const branches = await fetchBranches(gitRepository);
      const mainBranch =
        branches.filter((branch) => branch.name === 'main').length > 0 ? 'main' : 'master';
      return { ...gitRepository, branches, mainBranch };
    }

    updateGitRepo()
      .then((updatedGitRepo) => {
        setGitRepository(updatedGitRepo);
        return fetchData(updatedGitRepo);
      })
      .then((data) => console.log(data));
  }, []);

  return <div> This is just testing right now </div>;
};

export default Process;

/**
 * props: project directory details
 * Implementation:
 * - Make the whole tree here from props.
 * - Currently do it for the default branch.
 * - construct the canvas from the tree
 */

import React, { useState, useEffect } from 'react';
import TreeNode from './Tree';
import { FileType, File, GitRepository } from './types';
import { fetchData, fetchBranches, fetchDefaultBranch } from './utils/Utility';

interface Directory {
  files: Array<File>;
  fileType: FileType;
}

const buildTree = (root: TreeNode, childrenFiles: Array<File>): void => {
  if (childrenFiles.length > 0) {
    childrenFiles.forEach((childFile) => {
      const dirToFileList = childFile.path.split('/');
      if (dirToFileList.length === 1) {
        root.children?.push(new TreeNode(dirToFileList[0], childFile.type));
      } else {
        dirToFileList.reduce((parentFile, currentFile, currentIndex) => {
          const file1 = root.find(parentFile);
          const file2 = root.find(currentFile);

          if (!file1 && !file2) {
            const node1 = new TreeNode(parentFile, 'tree');
            const node2 = new TreeNode(currentFile, childFile.type);
            node1.children?.push(node2);
            root.children?.push(node1);
          } else if (file1 && !file2) {
            const node2 = new TreeNode(currentFile, childFile.type);
            file1.children?.push(node2);
          }
          return currentFile;
        });
      }
      return 'done';
    });
  }
};

/**
 * TODO: dealing with different branches
 */
const Process = (props: object) => {
  /*
    Initializing hooks used in
  */
  const [inputVal, setInputVal] = useState<String>('');
  const [repUpdate, setRepUpdate] = useState<boolean>(false);
  const [gitRepository, setGitRepository] = useState<GitRepository>({
    owner: 'ron-debajyoti',
    repo: 'easy-visualify',
    branches: [],
    defaultBranch: '',
  });
  const [rootDir, setDir] = useState<Directory>({
    files: [],
    fileType: 'tree',
  });

  const rootNode: TreeNode = new TreeNode('root', 'tree');

  const handleOnSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const splitArray = inputVal.split('/');
    setGitRepository({
      owner: splitArray[0],
      repo: splitArray[1],
      branches: [],
      defaultBranch: 'master',
    });
    setRepUpdate(!repUpdate);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const inputText = event.target.value;
    setInputVal(inputText);
  };

  useEffect(() => {
    /*
      Fetching the initial data based on master branch
        - get and update branches, mainBranch in gitRepository
    */
    async function updateGitRepo(): Promise<GitRepository> {
      const defaultBranch = await fetchDefaultBranch(gitRepository.owner, gitRepository.repo);
      const branches = await fetchBranches(gitRepository);
      return { ...gitRepository, branches, defaultBranch };
    }

    updateGitRepo()
      .then((updatedGitRepo) => {
        console.log('->>>>>>>>>>>>>>>>>', updatedGitRepo);
        setGitRepository(updatedGitRepo);
        return fetchData(updatedGitRepo);
      })
      .then((data) => {
        const files = data.map(
          (dataItem) =>
            ({
              path: dataItem.path,
              mode: dataItem.mode,
              sha: dataItem.sha,
              type: dataItem.type,
            } as File)
        );
        setDir({
          ...rootDir,
          files,
        });
      });
  }, [repUpdate]);

  /**
   * Generate the root tree and the whole TreeNode structure
   * Perhaps render it tooo.
   */
  useEffect(() => {
    console.log(rootDir);
    buildTree(rootNode, rootDir.files);
  }, [rootDir]);

  return (
    <div>
      <label htmlFor="enter-repo">
        Enter repository:
        <input
          placeholder="ron-debajyoti/easy-visualify"
          type="text"
          name="enter-repo"
          onChange={(event) => handleOnChange(event)}
        />
      </label>
      <button type="button" onClick={(event) => handleOnSubmit(event)}>
        {' '}
        Submit{' '}
      </button>
    </div>
  );
};

export default Process;

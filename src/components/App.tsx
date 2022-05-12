/* eslint-disable react-hooks/exhaustive-deps */

/**
 * props: project directory details
 * Implementation:
 * - Make the whole tree here from props.
 * - Currently do it for the default branch.
 * - construct the canvas from the tree
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components/macro';
import * as d3 from 'd3';
import TreeNode from './Tree';
import { FileType, File, GitRepository } from './types';
import { fetchData, fetchBranches, fetchDefaultBranch } from './utils/Utility';
import RadialTree from './Canvas';
import '../styles/App.css';

const Wrapper = styled.div`
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const Header = styled.h1`
  align-items: center;
  margin: 2vh;
`;

const MainDiv = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const InputDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin: 2vh;
`;

const Button = styled.button`
  align-self: flex-start;
  font-size: 1em;
  font-weight: 200;
  min-width: 50px;
  width: auto;
  margin: 2vh;
`;

const CanvasSVG = styled.svg`
  height: 100%;
  width: 100%;
  padding: 10px;
  font: 12px sans-serif;
  overflow-y: auto;
`;

interface Directory {
  files: Array<File>;
  fileType: FileType;
}

/*
  Given the root node, build the whole file TreeNode with children files
*/
const buildTree = (root: TreeNode, childrenFiles: Array<File>): void => {
  if (childrenFiles.length > 0) {
    childrenFiles.forEach((childFile) => {
      //
      // for each childFile in the array of childrenFiles
      if (childFile.path) {
        const dirToFileList = childFile.path.split('/');
        if (dirToFileList.length === 1) {
          // file present in the root directory
          const file = new TreeNode(dirToFileList[0], childFile.type);
          root.children?.push(file);
        } else {
          let dirRoot = root;
          dirToFileList.forEach((file, index) => {
            if (index === 0) {
              // getting the first folder and checkin it on root only
              const file1 = root.find(file, null);
              if (!file1) {
                const newNode = new TreeNode(file, 'tree');
                root.children?.push(newNode);
                dirRoot = newNode;
              } else dirRoot = file1;
            } else {
              // getting other folders based on the result value of
              // the index
              const file2 = dirRoot.find(file, null);
              if (!file2) {
                // checking for the last element, rest of the filenames before it are
                // assumed to be folders
                const newNode = new TreeNode(
                  file,
                  index === dirToFileList.length - 1 ? childFile.type : 'tree'
                );
                dirRoot.children?.push(newNode);
                dirRoot = newNode;
              } else dirRoot = file2;
            }
          });
        }
        return 'done';
      }
      return 'done';
    });
  }
};

/**
 * TODO: dealing with different branches
 */
const App = () => {
  /*
    Initializing hooks used in Process
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

  // root TreeNode
  const rootNode: TreeNode = new TreeNode('root', 'tree');
  const svgRef = useRef<SVGSVGElement>(null);

  /* Handling Method implementation */
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

  async function updateGitRepo(): Promise<GitRepository> {
    const defaultBranch = await fetchDefaultBranch(gitRepository.owner, gitRepository.repo);
    const branches = await fetchBranches(gitRepository);
    return { ...gitRepository, branches, defaultBranch };
  }

  useEffect(() => {
    /*
      Fetching the initial data based on master branch
        - get and update branches, mainBranch in gitRepository
    */
    updateGitRepo()
      .then((updatedGitRepo) => {
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
    buildTree(rootNode, rootDir.files);

    if (svgRef.current) {
      const svgHost = d3.select<SVGGElement, any>('g.main-group');
      const box = svgHost.node()?.getBBox();
      if (box) {
        svgHost
          .remove()
          .attr('width', box.width)
          .attr('height', box.height)
          .attr('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
      }
      RadialTree(rootNode, svgRef.current);
    }
  }, [rootDir]);

  return (
    <Wrapper>
      <div>
        <Header> GitTreees </Header>
        <MainDiv>
          <InputDiv>
            <Label htmlFor="enter-repo">
              Enter repository:
              <input
                placeholder="ron-debajyoti/easy-visualify"
                type="text"
                name="enter-repo"
                onChange={(event) => handleOnChange(event)}
              />
            </Label>
            <Button type="button" onClick={(event) => handleOnSubmit(event)}>
              {' '}
              Submit{' '}
            </Button>
          </InputDiv>
        </MainDiv>
      </div>
      <CanvasSVG id="chart-svg" ref={svgRef} />
    </Wrapper>
  );
};

export default App;

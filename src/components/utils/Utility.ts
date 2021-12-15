import { Octokit } from '@octokit/core';
import { GitRepository, Branch, Commit } from '../types';

// require('dotenv').config();

const octokit = new Octokit({ auth: process.env.REACT_APP_GITHUB_ACCESS_TOKEN });

const fetchBranches = async (gitRepo: GitRepository) =>
  octokit
    .request('GET /repos/{owner}/{repo}/branches', {
      owner: gitRepo.owner,
      repo: gitRepo.repo,
      per_page: 100,
    })
    .then((response) =>
      response.data.map(
        (item) =>
          ({
            name: item.name,
            protected: item.protected,
            commit: item.commit as Commit,
          } as Branch)
      )
    );

const fetchDefaultBranch = (owner: string, repo: string) =>
  octokit
    .request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    })
    .then((response) => response.data.default_branch);

const fetchData = async (gitRepo: GitRepository) => {
  const fBr = gitRepo.branches.filter((branch) => branch.name === gitRepo.defaultBranch)[0];
  const branchSha = fBr.commit.sha;
  return octokit
    .request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
      owner: gitRepo.owner,
      repo: gitRepo.repo,
      tree_sha: branchSha,
      recursive: 'true',
    })
    .then((response) => response.data.tree);
};

export { fetchBranches, fetchData, fetchDefaultBranch };

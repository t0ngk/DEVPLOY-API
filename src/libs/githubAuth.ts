import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

export const githubAuth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
});

export const githubAppAPI = async () => {
  const githubUser = await githubAuth({
    type: "app",
  });
  return new Octokit({
    auth: githubUser.token,
  });
};

export const githubUserAPI = async (installationID: number) => {
  const githubUser = await githubAuth({
    type: "installation",
    installationId: installationID,
  });
  return new Octokit({
    auth: githubUser.token,
  });
};

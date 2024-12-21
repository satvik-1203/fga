"use server";

import { revalidatePath } from "next/cache";

export async function updateUserPermission(
  org: string,
  repo: string,
  username: string,
  permissions: { pull: boolean; push: boolean }
) {
  const githubToken = "";
  if (!githubToken) {
    throw new Error("GitHub token not found");
  }

  // Convert permissions to GitHub API permission level
  // GitHub permissions are hierarchical - 'push' includes 'pull' access
  // So we only need to check the highest level requested
  let permissionLevel: string;
  if (permissions.push) {
    permissionLevel = "push";
  } else {
    permissionLevel = "pull";
  }

  try {
    console.log(
      JSON.stringify({
        permission: permissionLevel,
      })
    );
    const response = await fetch(
      `https://api.github.com/repos/${org}/${repo}/collaborators/${username}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          permission: permissionLevel,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    revalidatePath(`/services/github`);
    return true;
  } catch (error) {
    console.error("Error updating GitHub permission:", error);
    throw error;
  }
}

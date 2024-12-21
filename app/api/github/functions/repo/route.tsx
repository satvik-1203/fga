import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "#/prisma/prisma.config";

export const GET = async () => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        Org: {
          select: {
            creds: true,
          },
        },
      },
    });

    const githubCreds = user!.Org!.creds.find(
      (creds) => creds.name === "github"
    );

    if (!githubCreds)
      return NextResponse.json(
        { error: "No github credentials found" },
        { status: 400 }
      );
    const githubOrgs = await fetch("https://api.github.com/user/orgs", {
      headers: {
        Authorization: `Bearer ${
          (githubCreds.secrets as { access_token: string }).access_token
        }`,
      },
    });

    const orgs = await githubOrgs.json();

    const reposWithAccess = [];

    for (const org of orgs) {
      const orgReposRes = await fetch(
        `https://api.github.com/orgs/${org.login}/repos`,
        {
          headers: {
            Authorization: `Bearer ${
              (githubCreds.secrets as { access_token: string }).access_token
            }`,
          },
        }
      );

      const orgRepos = await orgReposRes.json();

      for (const repo of orgRepos) {
        const collaboratorsRes = await fetch(
          `https://api.github.com/repos/${org.login}/${repo.name}/collaborators`,
          {
            headers: {
              Authorization: `Bearer ${
                (githubCreds.secrets as { access_token: string }).access_token
              }`,
            },
          }
        );

        const collaborators = await collaboratorsRes.json();

        const repoWithAccess = {
          ...repo,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collaborators: collaborators.map((collaborator: any) => ({
            login: collaborator.login,
            admin: collaborator.permissions?.admin || false,
            permissions: {
              pull: collaborator.permissions?.pull || false,
              push: collaborator.permissions?.push || false,
            },
          })),
        };

        reposWithAccess.push({
          org: org.login,
          repo: repo.name,
          collaborators: repoWithAccess.collaborators,
        });
      }
    }

    return NextResponse.json(reposWithAccess);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch repos" },
      { status: 500 }
    );
  } finally {
  }
};

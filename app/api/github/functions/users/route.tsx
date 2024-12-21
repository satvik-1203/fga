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

    const org = orgs[0];

    const orgUsersRes = await fetch(
      `https://api.github.com/orgs/${org.login}/members`,
      {
        headers: {
          Authorization: `Bearer ${
            (githubCreds.secrets as { access_token: string }).access_token
          }`,
        },
      }
    );

    const orgUsers = await orgUsersRes.json();

    return NextResponse.json(orgUsers);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch repos" },
      { status: 500 }
    );
  } finally {
  }
};

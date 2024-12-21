import { NextRequest, NextResponse } from "next/server";
import prisma from "#/prisma/prisma.config";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        Org: {},
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.credential.upsert({
      where: {
        orgId_name: {
          orgId: user.Org!.id,
          name: "github",
        },
      },
      create: {
        name: "github",
        orgId: user.Org!.id,
        secrets: data,
      },
      update: {
        secrets: data,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    return redirect("/services/github");
  }
}

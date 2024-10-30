import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "#/prisma/prisma.config";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return redirect("/login");
  }

  const name = user.fullName || "";
  const email = user.emailAddresses[0].emailAddress;
  const pfp = user.imageUrl;
  const userId = user.id;

  await prisma.user.upsert({
    where: {
      id: userId,
    },
    update: {},
    create: {
      id: userId,
      email,
      name,
      pfp,
    },
  });

  return redirect("/dashboard");
}

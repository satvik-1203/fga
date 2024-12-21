import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "#/prisma/prisma.config";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    // logout of clerk
    return redirect("/signout");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      pfp: user.imageUrl,
      name: user.firstName + " " + user.lastName,
    },
  });

  return redirect("/dashboard");
}

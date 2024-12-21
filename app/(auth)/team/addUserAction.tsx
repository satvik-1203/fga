"use server";

import prisma from "#/prisma/prisma.config";
import { currentUser } from "@clerk/nextjs/server";

export const addUserAction = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const currUser = await currentUser();

    const user = await prisma.user.findUnique({
      where: {
        id: currUser!.id,
      },
      select: {
        Org: true,
      },
    });

    if (!user?.Org) {
      return false;
    }

    await prisma.pendingUser.create({
      data: {
        email,
        orgId: user!.Org!.id,
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

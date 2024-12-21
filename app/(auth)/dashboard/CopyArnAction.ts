"use server";

import { assumeAWSRole } from "#/lib/aws/credential-service";
import prisma from "#/prisma/prisma.config";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function CopyArnAction(formData: FormData) {
  const roleArn = formData.get("roleArn") as string;
  const searchParams = new URLSearchParams();
  const validRoleArn = roleArn?.toString().includes("arn:aws:iam::");

  if (!validRoleArn) {
    searchParams.set("error", "InvalidArn");
    redirect(`/dashboard?${searchParams.toString()}`);
  }

  const currUser = await currentUser();

  const creds = await assumeAWSRole({ roleArn: roleArn.trim() });

  if (!creds) {
    searchParams.set("error", "InvalidArn");
    searchParams.set("description", "Failed to assume role");
    redirect(`/dashboard?${searchParams.toString()}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: currUser!.id,
    },
    include: {
      Org: {
        include: {
          creds: true,
        },
      },
    },
  });

  if (!dbUser || !dbUser.Org) {
    redirect(`/signout`);
  }

  const org = dbUser.Org;

  const awsCreds = org?.creds.find((cred) => cred.name === "aws");

  if (awsCreds) {
    await prisma.credential.update({
      where: { id: awsCreds.id },
      data: {
        secrets: {
          // eslint-disable-next-line
          awsSession: creds as any,
          awsRoleArn: roleArn.trim(),
        },
      },
    });
  } else {
    await prisma.credential.create({
      data: {
        orgId: org.id,
        name: "aws",

        secrets: {
          // eslint-disable-next-line
          awsSession: creds as any,
          awsRoleArn: roleArn.trim(),
        },
      },
    });
  }

  revalidatePath("/dashboard");
}

/**
 *     data: {
      awsSession: creds as any,
      awsRoleArn: roleArn.trim(),

 */

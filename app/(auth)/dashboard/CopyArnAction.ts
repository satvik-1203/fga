"use server";

import { assumeAWSRole } from "#/lib/aws/credential-service";
import { getCreds } from "#/lib/aws/getCreds";
import prisma from "#/prisma/prisma.config";
import { currentUser } from "@clerk/nextjs/server";
import { JsonObject } from "@prisma/client/runtime/library";
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

  const prismaUser = await prisma.user.update({
    where: {
      id: currUser!.id,
    },
    data: {
      awsSession: creds as any,
      awsRoleArn: roleArn.trim(),
    },
  });

  revalidatePath("/dashboard");
}

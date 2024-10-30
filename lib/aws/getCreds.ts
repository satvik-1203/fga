import "server-only";

import { NextRequest } from "next/server";
import { assumeAWSRole } from "./credential-service";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "#/prisma/prisma.config";
import { Credentials } from "@aws-sdk/client-sts";
import { JsonObject } from "@prisma/client/runtime/library";

export async function getCreds(): Promise<Credentials | null> {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const prismaUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      awsSession: true,
      awsRoleArn: true,
    },
  });

  if (!prismaUser?.awsSession || !prismaUser?.awsRoleArn) {
    return null;
  }

  const { AccessKeyId, Expiration, SecretAccessKey, SessionToken } =
    prismaUser.awsSession as JsonObject;

  // if (Expiration && new Date(Expiration as string) < new Date()) {
  //   return prismaUser.awsSession as any;
  // }

  const credentials = await assumeAWSRole({ roleArn: prismaUser.awsRoleArn });

  if (!credentials) {
    throw new Error("Failed to assume role");
  }

  return credentials;
}

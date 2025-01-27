import "server-only";

import NodeCache from "node-cache";
import { assumeAWSRole } from "./credential-service";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "#/prisma/prisma.config";
import { Credentials } from "@aws-sdk/client-sts";
import { JsonObject } from "@prisma/client/runtime/library";

// Initialize cache with 30 minute TTL
const cache = new NodeCache({ stdTTL: 1800 });

export async function getCreds(): Promise<Credentials | null> {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const email = user.emailAddresses[0].emailAddress;

  // Try to get cached user data
  const cachedData = cache.get<{
    awsSession: JsonObject;
    awsRoleArn: string;
  }>(email);

  let awsSession: JsonObject | null = null;
  let awsRoleArn: string | null = null;

  if (cachedData) {
    // Use cached data if available
    awsSession = cachedData.awsSession;
    awsRoleArn = cachedData.awsRoleArn;
  } else {
    // Query database if not cached
    const prismaUser = await prisma.user.findUnique({
      where: { email },
      select: {
        Org: true,
      },
    });

    if (!prismaUser?.Org) {
      return null;
    }

    const awsCreds = await prisma.credential.findMany({
      where: {
        orgId: prismaUser.Org.id,
        name: "aws",
      },
    });

    if (awsCreds.length === 0) {
      return null;
    }

    const awsCred = awsCreds[0];

    if (
      awsCred.secrets &&
      typeof awsCred.secrets === "object" &&
      "awsSession" in awsCred.secrets &&
      "awsRoleArn" in awsCred.secrets
    ) {
      awsSession = awsCred.secrets.awsSession as JsonObject;
      awsRoleArn = awsCred.secrets.awsRoleArn as string;

      // Cache the data
      cache.set(email, {
        awsSession,
        awsRoleArn,
      });
    }
  }

  if (!awsSession || !awsRoleArn) {
    return null;
  }

  const credentials = await assumeAWSRole({ roleArn: awsRoleArn });

  if (!credentials) {
    throw new Error("Failed to assume role");
  }

  return credentials;
}

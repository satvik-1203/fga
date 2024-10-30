import "server-only";

import { GetLoginProfileCommand, ListUsersCommand } from "@aws-sdk/client-iam";
import { IAMClient } from "@aws-sdk/client-iam";
import { getCreds } from "./getCreds";

export interface SimpleUserInfo {
  username: string;
  arn: string;
  createDate: Date;
  hasConsoleAccess: boolean;
}

export async function listUsers(credentials: any): Promise<SimpleUserInfo[]> {
  const iamClient = new IAMClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  });

  try {
    const response = await iamClient.send(new ListUsersCommand({}));
    const users = response.Users || [];

    const userDetails = await Promise.all(
      users.map(async (user) => {
        let hasConsoleAccess = false;

        try {
          await iamClient.send(
            new GetLoginProfileCommand({ UserName: user.UserName! })
          );
          hasConsoleAccess = true;
        } catch (error) {
          // No login profile means no console access
          hasConsoleAccess = false;
        }

        return {
          username: user.UserName!,
          arn: user.Arn!,
          createDate: user.CreateDate!,
          hasConsoleAccess,
        };
      })
    );

    return userDetails;
  } catch (error) {
    console.error("Error listing users:", error);
    throw new Error("Failed to list users");
  }
}

// Example usage with assumed role credentials
export async function AWSUsers() {
  try {
    const creds = await getCreds();
    const users = await listUsers(creds);

    return users;
  } catch (error) {
    console.error("Error displaying users:", error);
    throw error;
  }
}

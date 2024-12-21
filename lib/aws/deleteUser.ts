import {
  IAMClient,
  DeleteUserCommand,
  DeleteUserPolicyCommand,
  DetachUserPolicyCommand,
  ListAttachedUserPoliciesCommand,
  ListUserPoliciesCommand,
} from "@aws-sdk/client-iam";
import { getCreds } from "./getCreds";

export const deleteAWSUser = async (userArn: string) => {
  const creds = await getCreds();
  if (!creds) return false;
  const client = new IAMClient({
    credentials: {
      accessKeyId: creds.AccessKeyId!,
      secretAccessKey: creds.SecretAccessKey!,
      sessionToken: creds.SessionToken!,
    },
  });

  try {
    // Extract username from ARN
    const username = userArn.split("/").pop();
    if (!username) {
      console.error("Could not extract username from ARN");
      return false;
    }

    // Get and detach all attached policies
    const { AttachedPolicies } = await client.send(
      new ListAttachedUserPoliciesCommand({
        UserName: username.trim(),
      })
    );

    if (AttachedPolicies) {
      for (const policy of AttachedPolicies) {
        await client.send(
          new DetachUserPolicyCommand({
            UserName: username.trim(),
            PolicyArn: policy.PolicyArn,
          })
        );
      }
    }

    // Delete inline policies
    const { PolicyNames } = await client.send(
      new ListUserPoliciesCommand({
        UserName: username.trim(),
      })
    );

    if (PolicyNames) {
      for (const policyName of PolicyNames) {
        await client.send(
          new DeleteUserPolicyCommand({
            UserName: username.trim(),
            PolicyName: policyName,
          })
        );
      }
    }

    // Finally delete the user
    const command = new DeleteUserCommand({
      UserName: username.trim(),
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting AWS user:", error);
    return false;
  }
};

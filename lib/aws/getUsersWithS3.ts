import "server-only";
import {
  GetLoginProfileCommand,
  ListUsersCommand,
  ListAttachedUserPoliciesCommand,
  ListUserPoliciesCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  GetUserPolicyCommand,
  IAMClient,
} from "@aws-sdk/client-iam";
import { getCreds } from "./getCreds";

export interface SimpleUserInfo {
  username: string;
  arn: string;
  createDate: Date;
  hasConsoleAccess: boolean;
  readAccess: boolean;
  writeAccess: boolean;
}

// Check policy for read/write S3 access
export async function checkS3Access(
  userName: string
): Promise<{ username: string; readAccess: boolean; writeAccess: boolean }> {
  let readAccess = false;
  let writeAccess = false;

  const creds = await getCreds();
  if (!creds) return { username: userName, readAccess, writeAccess };
  const iamClient = new IAMClient({
    credentials: {
      accessKeyId: creds.AccessKeyId!,
      secretAccessKey: creds.SecretAccessKey!,
      sessionToken: creds.SessionToken!,
    },
  });

  // List attached policies
  const attachedPolicies = await iamClient.send(
    new ListAttachedUserPoliciesCommand({ UserName: userName })
  );
  for (const policy of attachedPolicies.AttachedPolicies || []) {
    const hasAccess = await evaluatePolicy(iamClient, policy.PolicyArn!);
    readAccess = readAccess || hasAccess.readAccess;
    writeAccess = writeAccess || hasAccess.writeAccess;
  }

  // List inline policies
  const inlinePolicies = await iamClient.send(
    new ListUserPoliciesCommand({ UserName: userName })
  );
  for (const policyName of inlinePolicies.PolicyNames || []) {
    const policy = await iamClient.send(
      new GetUserPolicyCommand({ UserName: userName, PolicyName: policyName })
    );
    const hasAccess = evaluatePolicyDocument(policy.PolicyDocument);
    readAccess = readAccess || hasAccess.readAccess;
    writeAccess = writeAccess || hasAccess.writeAccess;
  }

  return { username: userName, readAccess, writeAccess };
}

// Evaluate attached policy document for S3 read/write access
async function evaluatePolicy(
  iamClient: IAMClient,
  policyArn: string
): Promise<{ readAccess: boolean; writeAccess: boolean }> {
  const policy = await iamClient.send(
    new GetPolicyCommand({ PolicyArn: policyArn })
  );
  if (policy.Policy?.DefaultVersionId) {
    const policyVersion = await iamClient.send(
      new GetPolicyVersionCommand({
        PolicyArn: policyArn,
        VersionId: policy.Policy.DefaultVersionId,
      })
    );
    return evaluatePolicyDocument(policyVersion.PolicyVersion?.Document);
  }
  return { readAccess: false, writeAccess: false };
}

// Analyze policy document for specific S3 permissions
function evaluatePolicyDocument(policyDocument: string | undefined): {
  readAccess: boolean;
  writeAccess: boolean;
} {
  let readAccess = false;
  let writeAccess = false;

  if (!policyDocument) return { readAccess, writeAccess };

  try {
    const policy = JSON.parse(decodeURIComponent(policyDocument));
    const statements = Array.isArray(policy.Statement)
      ? policy.Statement
      : [policy.Statement];

    for (const statement of statements) {
      const actions = Array.isArray(statement.Action)
        ? statement.Action
        : [statement.Action];
      for (const action of actions) {
        if (action.startsWith("s3:Get")) {
          readAccess = true;
        }
        if (action.startsWith("s3:Put")) {
          writeAccess = true;
        }
      }
    }
  } catch (error) {
    console.error("Error parsing policy document:", error);
  }
  return { readAccess, writeAccess };
}

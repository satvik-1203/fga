import { Lambda } from "@aws-sdk/client-lambda";
import { getCreds } from "./getCreds";
import { AWSUsers } from "./displayUsers";
import {
  GetPolicyCommand,
  GetPolicyVersionCommand,
  GetUserPolicyCommand,
  IAMClient,
  ListAttachedUserPoliciesCommand,
  ListUserPoliciesCommand,
  PutUserPolicyCommand,
} from "@aws-sdk/client-iam";

export const getFunctions = async () => {
  const creds = await getCreds();
  if (!creds) {
    return [];
  }

  try {
    const allFunctions = [];
    const regions = ["us-east-1", "us-east-2", "us-west-1", "us-west-2"]; // Add more AWS regions as needed

    for (const region of regions) {
      const regionalLambda = new Lambda({
        credentials: {
          accessKeyId: creds.AccessKeyId!,
          secretAccessKey: creds.SecretAccessKey!,
          sessionToken: creds.SessionToken!,
        },
        region: region,
      });

      const functions = await regionalLambda.listFunctions({});
      if (functions.Functions) {
        allFunctions.push(
          ...functions.Functions.map((f) => ({ ...f, Region: region }))
        );
      }
    }

    return allFunctions;
  } catch (error) {
    console.error("Error fetching Lambda functions:", error);
    return [];
  }
};

// Get permissions for a specific function
export const getLambdaUserPermissions = async (functionName: string) => {
  const creds = await getCreds();
  if (!creds) return [];
  const users = await AWSUsers();
  const iamClient = new IAMClient({
    credentials: {
      accessKeyId: creds.AccessKeyId!,
      secretAccessKey: creds.SecretAccessKey!,
      sessionToken: creds.SessionToken!,
    },
  });

  // Create an array to store permissions for each user
  const userPermissions = await Promise.all(
    users.map(async (user) => {
      const permissions = {
        username: user.username,
        permissions: {
          read: false,
          write: false,
          execute: false,
        },
      };

      try {
        // Get both attached and inline policies
        const [{ AttachedPolicies }, { PolicyNames }] = await Promise.all([
          iamClient.send(
            new ListAttachedUserPoliciesCommand({
              UserName: user.username,
            })
          ),
          iamClient.send(
            new ListUserPoliciesCommand({
              UserName: user.username,
            })
          ),
        ]);

        // Get policy documents for attached policies
        const attachedPolicyDocuments = await Promise.all(
          AttachedPolicies?.map(async (policy) => {
            const { Policy } = await iamClient.send(
              new GetPolicyCommand({
                PolicyArn: policy.PolicyArn,
              })
            );

            const { PolicyVersion } = await iamClient.send(
              new GetPolicyVersionCommand({
                PolicyArn: policy.PolicyArn,
                VersionId: Policy?.DefaultVersionId,
              })
            );

            return PolicyVersion?.Document;
          }) || []
        );

        // Get policy documents for inline policies
        const inlinePolicyDocuments = await Promise.all(
          PolicyNames?.map(async (policyName) => {
            const { PolicyDocument } = await iamClient.send(
              new GetUserPolicyCommand({
                UserName: user.username,
                PolicyName: policyName,
              })
            );
            return PolicyDocument;
          }) || []
        );

        // Combine both policy document arrays
        const allPolicyDocuments = [
          ...attachedPolicyDocuments,
          ...inlinePolicyDocuments,
        ];

        // Check each policy document for Lambda function-specific permissions
        allPolicyDocuments.forEach((doc) => {
          if (doc) {
            const policy = JSON.parse(decodeURIComponent(doc));

            policy.Statement.forEach(
              (statement: {
                Effect: string;
                Resource: string | string[];
                Action: string | string[];
              }) => {
                const resources = Array.isArray(statement.Resource)
                  ? statement.Resource
                  : [statement.Resource];

                const matchesFunction = resources.some(
                  (resource) =>
                    resource ===
                      `arn:aws:lambda:*:*:function:${functionName}` ||
                    resource === "*" ||
                    resource === "arn:aws:lambda:*:*:*"
                );

                if (statement.Effect === "Allow" && matchesFunction) {
                  const actions = Array.isArray(statement.Action)
                    ? statement.Action
                    : [statement.Action];

                  // Check for read permissions
                  if (
                    actions.some((action) =>
                      [
                        "lambda:GetFunction",
                        "lambda:List*",
                        "lambda:*",
                      ].includes(action)
                    )
                  ) {
                    permissions.permissions.read = true;
                  }

                  // Check for write permissions
                  if (
                    actions.some((action) =>
                      [
                        "lambda:CreateFunction",
                        "lambda:UpdateFunction*",
                        "lambda:*",
                      ].includes(action)
                    )
                  ) {
                    permissions.permissions.write = true;
                  }

                  // Check for execute permissions
                  if (
                    actions.some((action) =>
                      ["lambda:InvokeFunction", "lambda:*"].includes(action)
                    )
                  ) {
                    permissions.permissions.execute = true;
                  }
                }
              }
            );
          }
        });
      } catch (error) {
        console.error(
          `Error checking permissions for user ${user.username}:`,
          error
        );
      }

      return permissions;
    })
  );

  return userPermissions;
};

export const updateLambdaPermissions = async (
  functionName: string,
  username: string,
  read: boolean,
  write: boolean,
  execute: boolean
) => {
  const creds = await getCreds();
  if (!creds) return false;

  const iamClient = new IAMClient({
    credentials: {
      accessKeyId: creds.AccessKeyId!,
      secretAccessKey: creds.SecretAccessKey!,
      sessionToken: creds.SessionToken!,
    },
  });

  // Create policy document based on permissions
  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          ...(read ? ["lambda:GetFunction", "lambda:List*"] : []),
          ...(write ? ["lambda:CreateFunction", "lambda:UpdateFunction*"] : []),
          ...(execute ? ["lambda:InvokeFunction"] : []),
        ],
        Resource: `arn:aws:lambda:*:*:function:${functionName}`,
      },
    ],
  };

  try {
    // Put the inline policy
    await iamClient.send(
      new PutUserPolicyCommand({
        UserName: username,
        PolicyName: `lambda-access-${functionName}`,
        PolicyDocument: JSON.stringify(policyDocument),
      })
    );

    return true;
  } catch (error) {
    console.error("Error updating lambda permissions:", error);
    return false;
  }
};

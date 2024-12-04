import "server-only";

import { GetBucketLocationCommand, S3Client } from "@aws-sdk/client-s3";
import { getCreds } from "./getCreds";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
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

export const getBuckets = async () => {
  const creds = await getCreds();
  if (!creds) return [];

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: creds.AccessKeyId!,
      secretAccessKey: creds.SecretAccessKey!,
      sessionToken: creds.SessionToken!,
    },
  });

  const buckets = await s3Client.send(
    new ListBucketsCommand({
      // Note: ListBucketsCommand doesn't support filtering by region
      // We'll need to make separate calls to get bucket locations
    })
  );

  // Get region for each bucket
  const bucketsWithRegions = await Promise.all(
    buckets.Buckets?.map(async (bucket) => {
      const response = await s3Client.send(
        new GetBucketLocationCommand({ Bucket: bucket.Name })
      );

      return {
        ...bucket,
        BucketRegion: response.LocationConstraint || "us-east-1", // Default to us-east-1 if null
      };
    }) || []
  );

  return bucketsWithRegions;
};

export const updateBucketPermissions = async (
  bucketName: string,
  region: string,
  username: string,
  read: boolean,
  write: boolean
) => {
  const creds = await getCreds();
  if (!creds) return false;

  const iamClient = new IAMClient({
    region,
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
          ...(read ? ["s3:GetObject", "s3:ListBucket"] : []),
          ...(write ? ["s3:PutObject", "s3:DeleteObject"] : []),
        ],
        Resource: [
          `arn:aws:s3:::${bucketName}`,
          `arn:aws:s3:::${bucketName}/*`,
        ],
      },
    ],
  };

  try {
    // Put the inline policy
    await iamClient.send(
      new PutUserPolicyCommand({
        UserName: username,
        PolicyName: `s3-access-${bucketName}`,
        PolicyDocument: JSON.stringify(policyDocument),
      })
    );
    return true;
  } catch (error) {
    console.error("Error updating bucket permissions:", error);
    return false;
  }
};

export const getBucketPermissions = async (
  bucketName: string,
  region: string
) => {
  const creds = await getCreds();
  if (!creds) return [];
  const users = await AWSUsers();
  const iamClient = new IAMClient({
    region,
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
        read: false,
        write: false,
      };

      try {
        // Get the user's attached policies
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

        // Check each policy document for S3 bucket-specific permissions
        allPolicyDocuments.forEach((doc) => {
          if (doc) {
            const policy = JSON.parse(decodeURIComponent(doc));

            policy.Statement.forEach(
              (statement: {
                Effect: string;
                Resource: string | string[];
                Action: string | string[];
              }) => {
                // Check if statement allows access to this specific bucket
                const resources = Array.isArray(statement.Resource)
                  ? statement.Resource
                  : [statement.Resource];

                const hasBucketAccess = resources.some(
                  (resource) =>
                    resource === `arn:aws:s3:::${bucketName}` ||
                    resource === `arn:aws:s3:::${bucketName}/*` ||
                    resource === "*"
                );

                if (statement.Effect === "Allow" && hasBucketAccess) {
                  const actions = Array.isArray(statement.Action)
                    ? statement.Action
                    : [statement.Action];

                  // Check for read permissions
                  if (
                    actions.some((action) =>
                      ["s3:GetObject", "s3:ListBucket", "s3:*"].includes(action)
                    )
                  ) {
                    permissions.read = true;
                  }

                  // Check for write permissions
                  if (
                    actions.some((action) =>
                      ["s3:PutObject", "s3:DeleteObject", "s3:*"].includes(
                        action
                      )
                    )
                  ) {
                    permissions.write = true;
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

import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";

export const assumeAWSRole = async (credentials: { roleArn: string }) => {
  const { roleArn } = credentials;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  console.log(region, accessKeyId, secretAccessKey);
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not set");
  }

  const client = new STSClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const params = {
    RoleArn: roleArn,
    RoleSessionName: `session-${Date.now()}`,
    DurationSeconds: 3600,
  };

  try {
    const command = new AssumeRoleCommand(params);
    const response = await client.send(command);

    if (!response.Credentials) {
      throw new Error("Failed to assume role");
    }
    return response.Credentials;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to assume AWS role");
  }
};

/**




#!/bin/bash

# Set variables
ROLE_NAME="UserAccessManager"
POLICY_NAME="UserAccessManagerPolicy"
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Create the IAM policy
POLICY_ARN=$(aws iam create-policy --policy-name $POLICY_NAME --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UserAccessManagement",
      "Effect": "Allow",
      "Action": [
        "iam:ListUsers",
        "iam:GetUser",
        "iam:ListGroupsForUser",
        "iam:ListUserPolicies",
        "iam:ListAttachedUserPolicies",
        "iam:ListUserTags",
        "iam:AttachUserPolicy",
        "iam:DetachUserPolicy",
        "iam:AddUserToGroup",
        "iam:RemoveUserFromGroup",
        "iam:ListGroups",
        "iam:ListPolicies",
        "iam:TagUser",
        "iam:UntagUser",
        "organizations:ListAWSServiceAccessForOrganization",
        "organizations:DescribeOrganization",
        "organizations:EnableAWSServiceAccess",
        "organizations:DisableAWSServiceAccess",
        "sts:AssumeRole"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ServiceAccess",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "s3:List*",
        "s3:Get*",
        "rds:Describe*",
        "lambda:List*",
        "lambda:Get*",
        "cloudwatch:Get*",
        "cloudwatch:List*",
        "logs:Describe*",
        "logs:Get*",
        "logs:List*",
        "cloudfront:List*",
        "cloudfront:Get*",
        "route53:List*",
        "route53:Get*",
        "elasticloadbalancing:Describe*",
        "autoscaling:Describe*",
        "apigateway:GET"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyDangerousOperations",
      "Effect": "Allow",
      "Action": [
        "iam:CreateUser",
        "iam:DeleteUser",
        "iam:UpdateUser",
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:CreateGroup",
        "iam:DeleteGroup"
      ],
      "Resource": "*"
    }
  ]
}' --query 'Policy.Arn' --output text)

# Create the IAM role with trust relationship
ROLE_ARN=$(aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::'"$ACCOUNT_ID"':root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {}
    }
  ]
}' --query 'Role.Arn' --output text)

# Attach the policy to the role
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn $POLICY_ARN

# Create user groups for different access levels
aws iam create-group --group-name Administrators
aws iam create-group --group-name Developers
aws iam create-group --group-name ReadOnly

# Create basic policies for each group
aws iam put-group-policy --group-name Administrators --policy-name AdminAccess --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:*",
        "organizations:*"
      ],
      "Resource": "*"
    }
  ]
}'

aws iam put-group-policy --group-name Developers --policy-name DeveloperAccess --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "s3:*",
        "lambda:*",
        "cloudwatch:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}'

aws iam put-group-policy --group-name ReadOnly --policy-name ReadOnlyAccess --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "s3:List*",
        "s3:Get*",
        "lambda:List*",
        "lambda:Get*",
        "cloudwatch:Get*",
        "cloudwatch:List*"
      ],
      "Resource": "*"
    }
  ]
}'

echo -e "
============================================
Setup Complete!

Role ARN: $ROLE_ARN
Policy ARN: $POLICY_ARN

Groups Created:
- Administrators
- Developers
- ReadOnly

To add a user to a group:
aws iam add-user-to-group --user-name USERNAME --group-name GROUPNAME

To view role details:
aws iam get-role --role-name $ROLE_NAME

To view policy details:
aws iam get-policy --policy-arn $POLICY_ARN
============================================
"

 */

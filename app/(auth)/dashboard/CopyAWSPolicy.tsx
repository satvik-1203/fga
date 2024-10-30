"use client";

import { Button } from "#/components/ui/button";
import { toast } from "#/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { CopyArnAction } from "./CopyArnAction";
import { useSearchParams } from "next/navigation";

const policy = `

/**
 

# Set variables
ROLE_NAME="UserAccessManager"
POLICY_NAME="UserAccessManagerPolicy"
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Create the IAM policy with full access
POLICY_ARN=$(aws iam create-policy --policy-name $POLICY_NAME --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CompleteUserManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateUser",
        "iam:DeleteUser",
        "iam:UpdateUser",
        "iam:GetUser",
        "iam:ListUsers",
        "iam:CreateLoginProfile",
        "iam:DeleteLoginProfile",
        "iam:UpdateLoginProfile",
        "iam:GetLoginProfile",
        "iam:ListGroupsForUser",
        "iam:ListUserPolicies",
        "iam:ListAttachedUserPolicies",
        "iam:ListUserTags",
        "iam:AttachUserPolicy",
        "iam:DetachUserPolicy",
        "iam:AddUserToGroup",
        "iam:RemoveUserFromGroup",
        "iam:ListGroups",
        "iam:CreateGroup",
        "iam:DeleteGroup",
        "iam:UpdateGroup",
        "iam:ListPolicies",
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:CreatePolicyVersion",
        "iam:DeletePolicyVersion",
        "iam:GetPolicyVersion",
        "iam:ListPolicyVersions",
        "iam:TagUser",
        "iam:UntagUser",
        "iam:CreateAccessKey",
        "iam:DeleteAccessKey",
        "iam:UpdateAccessKey",
        "iam:ListAccessKeys",
        "iam:GetAccountPasswordPolicy",
        "iam:UpdateAccountPasswordPolicy",
        "iam:GetAccountSummary",
        "iam:PutUserPolicy",
        "iam:DeleteUserPolicy",
        "iam:GetRole",
        "iam:ListRoles",
        "iam:SimulatePrincipalPolicy"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OrganizationAccess",
      "Effect": "Allow",
      "Action": [
        "organizations:*",
        "account:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ServiceAccess",
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "s3:*",
        "rds:*",
        "lambda:*",
        "cloudwatch:*",
        "logs:*",
        "cloudfront:*",
        "route53:*",
        "elasticloadbalancing:*",
        "autoscaling:*",
        "apigateway:*",
        "sts:AssumeRole",
        "sts:GetCallerIdentity",
        "servicequotas:*",
        "service-quotas:*",
        "pricing:*",
        "ce:*",
        "budgets:*",
        "aws-portal:*",
        "resource-groups:*",
        "tag:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SecurityServices",
      "Effect": "Allow",
      "Action": [
        "security-hub:*",
        "trustedadvisor:*",
        "shield:*",
        "health:*",
        "aws-health:*",
        "guardduty:*",
        "config:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ServiceDiscovery",
      "Effect": "Allow",
      "Action": [
        "resource-explorer-2:*",
        "cloudformation:ListStacks",
        "cloudformation:DescribeStacks",
        "cloudformation:GetTemplateSummary",
        "ram:GetResourceShares",
        "ram:ListResources",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:DescribeParameters"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CostAndBilling",
      "Effect": "Allow",
      "Action": [
        "billing:*",
        "cur:*",
        "purchase-orders:*",
        "tax:*"
      ],
      "Resource": "*"
    }
  ]
}' --query 'Policy.Arn' --output text)

# Create the IAM role
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


`;

interface Props {}

const CopyAWSPolicy: React.FC<Props> = () => {
  const [copyClick, setCopyClick] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const description = searchParams.get("description");

  useEffect(() => {
    console.log(error);
    if (error === "InvalidArn") {
      toast({
        title: "Invalid Role ARN",
        description: description || "Please enter a valid Role ARN",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="">
      <p>No AWS credentials on the user</p>
      <Button
        className="my-4"
        onClick={() => {
          navigator.clipboard.writeText(policy);
          setTimeout(() => {
            setCopyClick(true);
          }, 1000);
          toast({
            title: "Copied AWS Policy",
            description: "Paste the policy in AWS console",
          });
        }}
      >
        Copy AWS Policy
      </Button>

      {
        <form
          action={CopyArnAction}
          className={`flex space-x-2 my-8 transition-all items-center ${
            copyClick ? "opacity-100" : "opacity-0"
          }`}
        >
          <input
            type="text"
            name="roleArn"
            placeholder="arn:aws:iam::<id>:role/UserAccessManager"
            className="bg-transparent border-2 w-[550px] m-2 outline-none  px-4 py-2 rounded border-gray-2"
          />
          <Button type="submit">Assume Role</Button>
        </form>
      }
    </div>
  );
};

export default CopyAWSPolicy;

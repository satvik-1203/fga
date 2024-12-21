"use client";

import { Button } from "#/components/ui/button";
import { toast } from "#/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { CopyArnAction } from "../../dashboard/CopyArnAction";
import { useSearchParams } from "next/navigation";

const policy = `


 

# Set variables
ROLE_NAME="UserAccessManager"
POLICY_NAME="UserAccessManagerPolicy"
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Create the IAM policy with full access
POLICY_ARN=$(aws iam create-policy --policy-name $POLICY_NAME --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": "*",
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

const CopyAWSPolicy: React.FC = () => {
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

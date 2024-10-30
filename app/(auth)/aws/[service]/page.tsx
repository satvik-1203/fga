import { AWSUsers } from "#/lib/aws/displayUsers";
import { checkS3Access } from "#/lib/aws/getUsersWithS3";
import { getServiceAccessMap } from "#/lib/aws/listUsersByServices";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";

interface Props {
  params: Promise<{
    service: string;
  }>;
}

const page: React.FC<Props> = async (props) => {
  const { service } = await props.params;

  const workingIntegrations = [
    "s3",
    "ec2",
    "dynamodb",
    "lambda",
    "sqs",
    "sns",
    "cloudwatch",
    "iam",
    "rds",
    "cloudformation",
    "apigateway",
    "s3",
    "amplify",
    "route53",
  ];

  if (!workingIntegrations.includes(service)) {
    return <div className="">Invalid service</div>;
  }

  const users = await AWSUsers();

  const usersWithAccess = await Promise.all(
    users.map(async (userName) => checkS3Access(userName.username))
  );

  return (
    <div className="">
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Read Access</TableHead>
              <TableHead>Write Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithAccess.map((user) => (
              <TableRow key={user.username}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.readAccess ? "Yes" : "No"}</TableCell>
                <TableCell>{user.writeAccess ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* {JSON.stringify(usersWithAccess)} */}
        {/* {usersWithAccess.map((name) => (
          <div>{name}</div>
        ))} */}
      </div>
    </div>
  );
};

export default page;

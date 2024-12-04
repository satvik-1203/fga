import { getBucketPermissions } from "#/lib/aws/s3";
import { Bucket } from "@aws-sdk/client-s3";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import UpdateS3Permission from "./UpdateS3Permission";

interface Props {
  bucket: Bucket;
}

const S3BucketPermissions: React.FC<Props> = async ({ bucket }) => {
  const permissions = await getBucketPermissions(
    bucket.Name!,
    bucket.BucketRegion!
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Read</TableHead>
            <TableHead>Write</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.username}>
              <TableCell>{permission.username}</TableCell>
              <TableCell>
                <UpdateS3Permission
                  hasPermission={permission.read}
                  type="read"
                  username={permission.username}
                  bucketName={bucket.Name!}
                  allPermissions={permission}
                />
              </TableCell>
              <TableCell>
                <UpdateS3Permission
                  hasPermission={permission.write}
                  type="write"
                  username={permission.username}
                  bucketName={bucket.Name!}
                  allPermissions={permission}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default S3BucketPermissions;

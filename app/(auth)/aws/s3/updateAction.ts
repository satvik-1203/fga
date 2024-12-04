"use server";

import { updateBucketPermissions } from "#/lib/aws/s3";
import { revalidatePath } from "next/cache";

export const updateS3Permission = async (
  bucketName: string,
  username: string,
  type: "read" | "write",
  allPermissions: {
    read: boolean;
    write: boolean;
  }
) => {
  await updateBucketPermissions(
    bucketName,
    "us-east-2",
    username,
    type === "read" ? !allPermissions.read : allPermissions.read,
    type === "write" ? !allPermissions.write : allPermissions.write
  );

  revalidatePath(`/aws/s3`);
};

"use server";

import { updateLambdaPermissions } from "#/lib/aws/lambda";
import { revalidatePath } from "next/cache";

export const updateLambdaPermission = async (
  functionName: string,
  username: string,
  type: "read" | "write" | "execute",
  allPermissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  }
) => {
  await updateLambdaPermissions(
    functionName,
    username,
    type === "read" ? !allPermissions.read : allPermissions.read,
    type === "write" ? !allPermissions.write : allPermissions.write,
    type === "execute" ? !allPermissions.execute : allPermissions.execute
  );

  revalidatePath(`/aws/lambda`);
};

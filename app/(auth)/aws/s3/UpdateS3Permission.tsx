"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "#/components/ui/button";
import { updateS3Permission } from "./updateAction";
import { toast } from "#/hooks/use-toast";

interface Props {
  hasPermission: boolean;
  type: "read" | "write";
  username: string;
  bucketName: string;
  allPermissions: {
    read: boolean;
    write: boolean;
  };
}

const UpdateS3Permission: React.FC<Props> = ({
  hasPermission,
  type,
  username,
  bucketName,
  allPermissions,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={async () => {
        toast({
          title: "Updating permission",
          description: "Please wait while we update the permission",
        });
        await updateS3Permission(bucketName, username, type, allPermissions);
        toast({
          title: "Permission updated",
          description: "The permission has been updated",
        });
      }}
      className="h-4 w-4 p-3"
    >
      {hasPermission ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
    </Button>
  );
};

export default UpdateS3Permission;

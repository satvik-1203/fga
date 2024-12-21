"use client";
import { Button } from "#/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "#/components/ui/table";
import { toast } from "#/hooks/use-toast";
import { Check, X } from "lucide-react";
import React from "react";
import { updateLambdaPermission } from "./updateAction";

interface Props {
  userPermissions: {
    username: string;
    permissions: {
      read: boolean;
      write: boolean;
      execute: boolean;
    };
  }[];
  funcName: string;
}

const LambdaTable: React.FC<Props> = ({ userPermissions, funcName }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Read</TableHead>
          <TableHead>Write</TableHead>
          <TableHead>Execute</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userPermissions.map((permission) => (
          <TableRow key={permission.username}>
            <TableCell>{permission.username}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  toast({
                    title: "Updating permission",
                    description: "Please wait while we update the permission",
                  });
                  await updateLambdaPermission(
                    funcName,
                    permission.username,
                    "read",
                    permission.permissions
                  );
                  toast({
                    title: "Permission updated",
                    description: "The permission has been updated",
                  });
                }}
                className="h-4 w-4 p-3"
              >
                {permission.permissions.read ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  toast({
                    title: "Updating permission",
                    description: "Please wait while we update the permission",
                  });
                  await updateLambdaPermission(
                    funcName,
                    permission.username,
                    "write",
                    permission.permissions
                  );
                  toast({
                    title: "Permission updated",
                    description: "The permission has been updated",
                  });
                }}
                className="h-4 w-4 p-3"
              >
                {permission.permissions.write ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  toast({
                    title: "Updating permission",
                    description: "Please wait while we update the permission",
                  });
                  await updateLambdaPermission(
                    funcName,
                    permission.username,
                    "execute",
                    permission.permissions
                  );
                  toast({
                    title: "Permission updated",
                    description: "The permission has been updated",
                  });
                }}
                className="h-4 w-4 p-3"
              >
                {permission.permissions.execute ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LambdaTable;

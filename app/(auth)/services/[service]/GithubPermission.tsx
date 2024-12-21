"use client";

import React from "react";
import { Collaborator } from "./Repo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { CheckIcon, X } from "lucide-react";
import { updateUserPermission } from "./GithubActions";

interface Props {
  collaborators: Collaborator[];
  org: string;
  repo: string;
}

const GithubPermission: React.FC<Props> = ({ collaborators, org, repo }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Push</TableHead>
          <TableHead>Pull</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collaborators.map((collaborator) => (
          <TableRow key={collaborator.login}>
            <TableCell>
              {collaborator.login},{" "}
              <span className="text-xs text-gray-500">
                {collaborator.admin ? "Admin" : "User"}
              </span>
            </TableCell>
            <TableCell
              onClick={() =>
                updateUserPermission(org, repo, collaborator.login, {
                  pull: true,
                  push: !collaborator.permissions.push,
                })
              }
            >
              <div className="cursor-pointer w-fit p-2 rounded-md hover:bg-gray-800">
                {collaborator.permissions.push ? (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4  text-red-500" />
                )}
              </div>
            </TableCell>
            <TableCell
              onClick={() =>
                updateUserPermission(org, repo, collaborator.login, {
                  pull: !collaborator.permissions.pull,
                  push: false,
                })
              }
            >
              <div className="cursor-pointer w-fit p-2 rounded-md hover:bg-gray-800">
                {collaborator.permissions.pull ? (
                  <CheckIcon className="w-4 h-4  text-green-500" />
                ) : (
                  <X className="w-4 h-4  text-red-500" />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GithubPermission;

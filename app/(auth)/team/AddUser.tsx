"use client";
import { Button } from "#/components/ui/button";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { addUserAction } from "./addUserAction";
import { toast } from "#/hooks/use-toast";

const AddUser: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const success = await addUserAction(formData);
            if (success) {
              toast({
                title: "User added",
                description: "User has been added to the team",
              });
            } else {
              toast({
                title: "Failed to add user",
                description: "Failed to add user to the team",
              });
            }
          }}
          className="space-y-4"
        >
          <Input type="email" name="email" placeholder="Enter email address" />
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUser;

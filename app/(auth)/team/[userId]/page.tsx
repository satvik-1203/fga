import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { deleteAWSUser } from "#/lib/aws/deleteUser";
import { AWSUsers } from "#/lib/aws/displayUsers";
import prisma from "#/prisma/prisma.config";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{ userId: string }>;
}

const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
};

const getServiceUsers = async (userId: string) => {
  const serviceUsers = await prisma.serviceUser.findMany({
    where: {
      userId,
    },
  });
  return serviceUsers;
};

const page: React.FC<Props> = async ({ params }) => {
  const { userId } = await params;
  const user = await getUser(userId);
  if (!user) return redirect("/team");
  const users = await AWSUsers();
  const serviceUsers = await getServiceUsers(userId);

  const handleSubmit = async (formData: FormData) => {
    "use server";

    const formDataKeys = [...formData.keys()];

    await Promise.all(
      formDataKeys.map(async (key) => {
        if (!formData.get(key) || key.startsWith("$")) return;

        const prismaSU = serviceUsers.find((su) => su.service == key);
        console.log(formData.get(key));

        if (prismaSU) {
          await prisma.serviceUser.update({
            where: {
              id: prismaSU.id,
            },
            data: {
              serviceUserId: formData.get(key) as string,
            },
          });
        } else {
          await prisma.serviceUser.create({
            data: {
              service: key as string,
              serviceUserId: formData.get(key) as string,
              userId,
            },
          });
        }
      })
    );
  };

  const deleteUser = async () => {
    "use server";
    try {
      const deletedUser = await prisma.user.delete({
        where: {
          id: userId,
        },
        include: {
          ServiceUser: true,
        },
      });

      if (!deletedUser) return true;

      const awsUser = deletedUser.ServiceUser.find(
        (su) => su.service === "aws"
      );

      if (!awsUser) return true;

      console.log(awsUser.serviceUserId);

      await deleteAWSUser(awsUser.serviceUserId);
    } catch (error) {
      console.error(error);
      return false;
    }

    redirect("/team");
  };

  return (
    <div className="">
      <Link href="/team" className="flex items-center gap-4 my-8 w-fit">
        <ChevronLeft />
        <h1 className="text-white text-2xl font-bold">Users</h1>
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">{user.name}</h1>
          <p>You can link and link the user to the services</p>
        </div>
        <div>
          <Button onClick={deleteUser}>Delete User</Button>
        </div>
      </div>

      <form action={handleSubmit} className="my-12">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-bold">Assign User</h3>
          <Button type="submit">Assign</Button>
        </div>
        <div className="my-8">
          <h4 className="text-white font-bold">AWS</h4>
          <div className="flex space-x-4 items-center">
            <span className="text-white">User: </span>
            <div className="w-[400px]">
              <Select
                name="aws"
                defaultValue={
                  serviceUsers.find((su) => su.service === "aws")?.serviceUserId
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.username} value={user.arn}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default page;

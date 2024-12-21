import prisma from "#/prisma/prisma.config";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AddUser from "./AddUser";

const getUsers = async () => {
  const user = await currentUser();

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user!.id,
    },
    include: {
      Org: {
        include: {
          users: true,
        },
      },
    },
  });

  return dbUser?.Org?.users || [];
};

const getPendingUsers = async () => {
  const user = await currentUser();

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user!.id,
    },
    select: {
      Org: {
        include: {
          PendingUser: true,
        },
      },
    },
  });

  return dbUser?.Org?.PendingUser || [];
};

const page: React.FC = async () => {
  const users = await getUsers();
  const pendingUsers = await getPendingUsers();
  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <div>
          <AddUser />
        </div>
      </div>
      <div className="my-12">
        <div className="flex flex-wrap gap-4">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/team/${user.id}`}
              className="flex items-center gap-4 hover:bg-gray-800 p-2 rounded-md select-none w-[300px] cursor-pointer bg-gray-900"
            >
              <div className="rounded overflow-hidden">
                {user.pfp ? (
                  <Image alt="pfp" width={50} height={50} src={user.pfp} />
                ) : (
                  <User className="w-[50px] h-[50px]" />
                )}
              </div>
              <div>
                <p className="text-white">{user.name}</p>
                <p>{user.email}</p>
              </div>
            </Link>
          ))}
        </div>
        {pendingUsers.length > 0 && (
          <>
            <div className="my-4 flex items-center gap-2">
              <h3 className="text-white">Pending users</h3>
              <p className="text-gray-500">
                {pendingUsers.length} pending users
              </p>
            </div>
            <div className="flex flex-wrap gap-4 my-2">
              {pendingUsers.map((user) => (
                <div
                  className="flex items-center gap-4 hover:bg-gray-800 p-2 rounded-md select-none w-[300px] cursor-pointer bg-gray-900"
                  key={user.id}
                >
                  <p>{user.email}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default page;

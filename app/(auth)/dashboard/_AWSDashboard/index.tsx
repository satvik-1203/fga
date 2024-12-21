import { getCreds } from "#/lib/aws/getCreds";

import React from "react";
import { AWSUsers } from "#/lib/aws/displayUsers";

interface Props {}

const index: React.FC<Props> = async () => {
  const creds = await getCreds();
  if (!creds) {
    throw new Error("No AWS credentials found");
  }

  const users = await AWSUsers();

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl text-white">Users</h2>
        <div className="px-8 py-4 my-4 flex flex-wrap gap-2">
          {users.map((user) => (
            <div
              className="px-4 py-2 rounded bg-gray-700 w-[200px]"
              key={user.username}
            >
              {user.username}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default index;

import { getCreds } from "#/lib/aws/getCreds";
import {
  ListServicesCommand,
  ServiceQuotasClient,
} from "@aws-sdk/client-service-quotas";
import { Credentials, STSClient } from "@aws-sdk/client-sts";
import {
  CloudControlClient,
  ListResourceRequestsCommand,
} from "@aws-sdk/client-cloudcontrol";
import React from "react";
import { getServiceAccessMap } from "#/lib/aws/listUsersByServices";
import { AWSUsers } from "#/lib/aws/displayUsers";
import Link from "next/link";

interface Props {}

const index: React.FC<Props> = async () => {
  const creds = await getCreds();
  if (!creds) {
    throw new Error("No AWS credentials found");
  }

  const users = await AWSUsers();

  const services = await getServiceAccessMap();
  if (!services) {
    return <div>No services found</div>;
  }

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

      <div className="flex flex-col gap-2">
        <h2 className="text-xl text-white">Services</h2>
        <div className="px-8 py-4 my-4 flex flex-wrap gap-2">
          {Array.from(services.keys()).map((service) => (
            <Link
              href={`/aws/${service}`}
              className="px-4 py-2 rounded bg-gray-700 w-[200px]"
              key={service}
            >
              {service}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default index;

import { getCreds } from "#/lib/aws/getCreds";
import React from "react";
import CopyAWSPolicy from "./CopyAWSPolicy";
import AWSDashboard from "./_AWSDashboard";

interface Props {}

const getAwsAccount = async () => {};

const page: React.FC<Props> = async () => {
  const creds = await getCreds().catch((err) => {});
  console.log(creds);
  return (
    <div className="">
      <h1 className="text-3xl text-white">Dashboard</h1>

      <div className="p-4 ">
        {!creds ? <CopyAWSPolicy /> : <AWSDashboard />}
      </div>
    </div>
  );
};

export default page;

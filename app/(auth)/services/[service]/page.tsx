import S3 from "./S3";
import React from "react";

import Lambda from "./Lambda";
import { services } from "../services";
import Repo from "./Repo";

interface Props {
  params: Promise<{ service: string }>;
  searchParams: Promise<{ name: string | undefined }>;
}

const page: React.FC<Props> = async ({ params, searchParams }) => {
  const routeParams = await params;
  const service = routeParams.service;
  const pathParams = await searchParams;

  console.log(service, services);
  const serviceName =
    pathParams.name || services[service as keyof typeof services][0];

  return (
    <div className="">
      <div className="my-12">
        {serviceName === "s3" && <S3 />}
        {serviceName === "lambda" && <Lambda />}
        {serviceName === "repos" && <Repo />}
      </div>
    </div>
  );
};

export default page;

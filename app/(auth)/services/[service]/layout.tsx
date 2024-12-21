import React from "react";
import Sidebar from "./Sidebar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import prisma from "#/prisma/prisma.config";
import { currentUser } from "@clerk/nextjs/server";
import AWSService from "./AWSService";
import GithubLogin from "./GithubLogin";

interface Props {
  children: React.ReactNode;
  params: Promise<{ service: string }>;
}

const layout: React.FC<Props> = async (props) => {
  const { children, params } = props;
  const routeParams = await params;
  const { service } = routeParams;
  const user = await currentUser();

  if (service == "aws") {
    const awsCreds = await prisma.user.findFirst({
      where: {
        id: user!.id,
      },
      select: {
        Org: {
          select: {
            creds: {
              where: {
                name: "aws",
              },
            },
          },
        },
      },
    });

    if (!awsCreds?.Org?.creds[0]) {
      return <AWSService />;
    }
  }

  if (service == "github") {
    const githubCreds = await prisma.user.findFirst({
      where: {
        id: user!.id,
      },
      select: {
        Org: {
          select: {
            creds: {
              where: {
                name: "github",
              },
            },
          },
        },
      },
    });

    if (!githubCreds?.Org?.creds[0]) {
      return <GithubLogin />;
    }
  }

  return (
    <div className="">
      <div>
        <Link
          href="/services"
          className="flex items-center gap-2 text-white cursor-pointer my-8 w-fit text-lg"
        >
          <ChevronLeft /> <span>Services</span>
        </Link>
      </div>
      <div className="flex space-x-8">
        <Sidebar service={service} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default layout;

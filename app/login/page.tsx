import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
interface Props {}

const login: React.FC<Props> = async () => {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="container h-full">
      <div className="flex items-center h-full justify-center space-x-8">
        <div className="flex-1">
          <Image src="/bg.png" alt="Signal" width={400} height={400} />
        </div>
        <div className="flex-1">
          <div className="my-4">
            <h1 className="text-4xl font-bold text-white">Login to Signal</h1>
            <ul className="text-lg my-2 ">
              <li className="ml-2">
                Forgot to off board your previous client? We got you.
              </li>
              <li className="ml-2">
                Need to give access to a new client? We got you.
              </li>
            </ul>
          </div>
          <SignedOut>
            <div className="bg-gray-800 px-4 py-2 rounded-lg w-fit cursor-pointer">
              <SignInButton
                children={"Login"}
                forceRedirectUrl={"/api/login/callback"}
              />
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default login;

"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

interface Props {}

const Page: React.FC<Props> = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut();
    router.push("/login");
  }, []);

  return <div className=""></div>;
};

export default Page;

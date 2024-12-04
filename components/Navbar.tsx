import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface Props {}

const nonAuthLinks = [
  {
    name: "Login",
    href: "/login",
  },
];

const authLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

const Navbar: React.FC<Props> = async () => {
  const user = await currentUser();

  if (!user) {
    return (
      <nav className="flex justify-between bg-gray-900 items-center fixed top-0 w-full z-50 p-4">
        <div>
          <h1 className="text-2xl font-bold  text-white">Signal</h1>
        </div>
        <div>
          <ul>
            {nonAuthLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }
  return (
    <nav className="flex justify-between bg-gray-900 items-center fixed top-0 w-full z-50 p-4">
      <div>
        <h1 className="text-2xl font-bold  text-white">Signal</h1>
      </div>
      <div className="flex space-x-2 items-center">
        <ul className="flex space-x-2">
          {authLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href}>{link.name}</Link>
            </li>
          ))}
        </ul>
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;

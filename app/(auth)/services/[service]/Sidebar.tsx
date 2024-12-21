"use client";
import { Circle } from "lucide-react";
import {
  redirect,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import React, { useCallback } from "react";

interface Props {
  service: string;
}

export const services = {
  aws: ["s3", "lambda"],
  github: ["repos"],
};

const Sidebar: React.FC<Props> = ({ service }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  if (!services[service as keyof typeof services]) return redirect("/services");
  const routeServiceUrl =
    searchParams.get("name") || services[service as keyof typeof services][0];

  return (
    <div className="w-[300px] h-fit bg-slate-500 rounded-lg px-4 py-4 flex flex-col">
      {services[service as keyof typeof services].map((routeService, index) => (
        <div key={routeService} className="text-white">
          <div
            onClick={() => {
              router.push(
                `${pathname}?${createQueryString("name", routeService)}`
              );
            }}
            className={`flex items-center gap-2 my-2 hover:bg-slate-600 transition-colors duration-300 rounded-md p-2 cursor-pointer ${
              routeServiceUrl === routeService ? "bg-slate-800" : ""
            }`}
          >
            <Circle className="w-6 h-6" />
            <span>{routeService}</span>
          </div>
          {index !== services[service as keyof typeof services].length - 1 && (
            <div className="h-[40px] ml-[18px] border-dotted border-l-4 border-slate-600"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;

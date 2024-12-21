import { SquareGanttChart } from "lucide-react";
import Link from "next/link";
import React from "react";

const page: React.FC = async () => {
  const services = ["aws", "vercel", "github"];

  return (
    <div className="">
      <h1 className="text-2xl font-bold text-white">Services</h1>

      <div className="my-12 flex flex-wrap gap-4">
        {services.map((service) => (
          <Link
            key={service}
            href={`/services/${service}`}
            className="flex items-center gap-4 hover:bg-gray-800 p-2 rounded-md select-none w-[300px] cursor-pointer bg-gray-900"
          >
            <div className="rounded overflow-hidden">
              <SquareGanttChart className="w-[50px] h-[50px]" />
            </div>
            <div>
              <p className="text-white">{service.toUpperCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default page;

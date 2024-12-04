import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion";
import { getBuckets } from "#/lib/aws/s3";
import S3BucketPermissions from "./S3BucketPermissions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const page: React.FC = async () => {
  const buckets = await getBuckets();

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <div>
              <ChevronLeft className="w-10 h-10 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">S3 Buckets</h1>
        </div>
      </div>
      <Accordion type="single" collapsible defaultValue={buckets[0].Name}>
        {buckets.map((bucket) => (
          <AccordionItem key={bucket.Name} value={bucket.Name!}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex w-full justify-between items-center">
                <div>
                  <span className="text-white">Bucket:</span> {bucket.Name}
                </div>
                <div>
                  <span className="text-white">Region:</span>{" "}
                  {bucket.BucketRegion}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <S3BucketPermissions bucket={bucket} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default page;

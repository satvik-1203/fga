import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "#/components/ui/accordion";
import React from "react";
import S3BucketPermissions from "../../aws/s3/S3BucketPermissions";
import { getBuckets } from "#/lib/aws/s3";

const S3: React.FC = async () => {
  const buckets = await getBuckets();

  return (
    <div className="">
      <div className="">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">S3 Buckets</h1>
          </div>
        </div>
        <Accordion type="single" collapsible>
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
    </div>
  );
};

export default S3;

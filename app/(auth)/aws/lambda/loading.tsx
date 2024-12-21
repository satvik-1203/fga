import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion";

const Loading: React.FC = () => {
  return (
    <div className="">
      <Accordion type="single" collapsible>
        {[1, 2, 3].map((i) => (
          <AccordionItem key={i} value={i.toString()}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex w-full justify-between items-center">
                <div className="h-6 w-48 bg-gray-300 animate-pulse rounded" />
              </div>
            </AccordionTrigger>
            <AccordionContent></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Loading;

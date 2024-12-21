import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion";
import { getFunctions } from "#/lib/aws/lambda";
import LambdaFunctionPermission from "./LambdaFunctionPermission";

const LambdaFunctions: React.FC = async () => {
  // Get all Lambda functions

  const functions = await getFunctions();

  return (
    <div className="space-y-4">
      {functions.length === 0 ? (
        <div>No functions found</div>
      ) : (
        <Accordion type="single" collapsible>
          {functions.map((func) => (
            <AccordionItem
              key={func.FunctionName}
              value={func.FunctionName || ""}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full justify-between items-center">
                  <div>
                    <span className="text-white">Function:</span>{" "}
                    {func.FunctionName}
                  </div>
                  <div>
                    <span className="text-white">Runtime:</span> {func.Runtime}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <LambdaFunctionPermission func={func} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default LambdaFunctions;

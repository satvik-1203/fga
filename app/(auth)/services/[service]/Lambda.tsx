import React from "react";
import LambdaFunctions from "../../aws/lambda/LambdaFunctions";

const Lambda: React.FC = () => {
  return (
    <div className="">
      <h1 className="text-2xl font-bold text-white">Lambda Functions</h1>
      <div className="my-12">
        <LambdaFunctions />
      </div>
    </div>
  );
};

export default Lambda;

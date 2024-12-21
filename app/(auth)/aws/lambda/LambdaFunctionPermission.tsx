import { getLambdaUserPermissions } from "#/lib/aws/lambda";
import { ListFunctionsCommandOutput } from "@aws-sdk/client-lambda";

import React from "react";
import LambdaTable from "./LambdaTable";

interface Props {
  func: NonNullable<ListFunctionsCommandOutput["Functions"]>[number];
}

const LambdaFunctionPermission: React.FC<Props> = async ({ func }) => {
  if (!func.FunctionName) return null;
  const userPermissions = await getLambdaUserPermissions(func.FunctionName);

  return (
    <div className="space-y-2 p-4">
      <div>
        <span className="font-semibold">IAM Role:</span> {func.Role}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Permissions:</h3>
        <LambdaTable
          userPermissions={userPermissions}
          funcName={func.FunctionName}
        />
      </div>
    </div>
  );
};

export default LambdaFunctionPermission;

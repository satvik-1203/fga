import { NextRequest, NextResponse } from "next/server";
import { assumeAWSRole } from "#/lib/aws/credential-service";
import { displayUsers } from "#/lib/aws/displayUsers";
import { getCreds } from "#/lib/aws/getCreds";

export async function GET(request: NextRequest) {
  try {
    const creds = await getCreds();
    const users = await displayUsers(creds);

    return NextResponse.json({
      message: "Successfully assumed role",
      users: users,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

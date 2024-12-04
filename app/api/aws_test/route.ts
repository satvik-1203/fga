import { NextRequest, NextResponse } from "next/server";
import { AWSUsers } from "#/lib/aws/displayUsers";

export async function GET(request: NextRequest) {
  try {
    const users = await AWSUsers();

    return NextResponse.json({
      message: "Successfully assumed role",
      users: users,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

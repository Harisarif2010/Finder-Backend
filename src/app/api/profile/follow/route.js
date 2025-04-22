import { NextResponse } from "next/server";
import { getToken } from "../../../../../libs/getToken";
import Users from "../../../../../models/User";
import connectMongoDB from "../../../../../libs/dbConnect";

export async function GET(req) {
  try {
    await connectMongoDB();

    // Get The Token
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401 }
      );
    }

    // Get The User
    const user = await Users.findById(token?.id);
    if (!user) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }
    if (user?.profilePrivacy === "private") {
      return NextResponse.json(
        { error: "User Profile Is Private" },
        { status: 403 }
      );
    }

    user.following.push(token?.id);
    await user.save();

    return NextResponse.json(
      {
        message: "User Followed Successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error In Follow User", err);
    return NextResponse.json(
      { error: "Error In Follow User" },
      { status: 500 }
    );
  }
}

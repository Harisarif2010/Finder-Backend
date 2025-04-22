import { NextResponse } from "next/server";
import Users from "../../../../../models/User";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";

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
    // Get All Users
    const allUsers = await Users.findById(token?.id).select(
      "followers following"
    );
    if (!allUsers) {
      return NextResponse.json(
        { error: "No Followers & Following Found" },
        { status: 401 }
      );
    }

    // Merge followers and following
    const ids = [...(allUsers.followers || []), ...(allUsers.following || [])];

    // Optional: remove duplicates
    const uniqueIds = [...new Set(ids.map((id) => id.toString()))];

    // Fetch users from the IDs
    const users = await Users.find({
      _id: { $in: uniqueIds },
    }).select("_id fullName image");
    console.log(users)
    return NextResponse.json(
      {
        message: "Users Fetched Successfully",
        users: users,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error In Get All Users", err);
    return NextResponse.json(
      { error: "Error In Get All Users" },
      { status: 500 }
    );
  }
}

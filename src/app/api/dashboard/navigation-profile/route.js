import { NextResponse } from "next/server";
import { getToken } from "../../../../../libs/getToken";
import Users from "../../../../../models/User";

export async function POST(req) {
  try {
    await connectMongoDB();
    // Get Token
    const token = await getToken(req);
   if (!token || token.error) {
     return NextResponse.json(
       { error: token?.error || "Unauthorized Access" },
       { status: 401 }
     );
   }
    // Find user
    const user = await Users.findById(token?.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalFolowers = user.followers.length;
    const totalFollowing = user.following.length;

    // Find users (excluding current) with at least one common interest
    const users = await Users.find({
      _id: { $ne: user._id },
      interests: { $in: userInterests },
    }).select("_id fullName image interests");

    return NextResponse.json(
      { users, totalFolowers, totalFollowing },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in discover api:", err);
    return NextResponse.json(
      { error: "Error in discover api" },
      { status: 500 }
    );
  }
}

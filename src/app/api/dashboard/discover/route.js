import { NextResponse } from "next/server";
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

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get query params from URL (like /api/users?interests=music,travel)
    const { searchParams } = new URL(req.url);
    const interests = searchParams.get("interests"); // comma-separated string

    // Build query
    let query = {
      createdAt: {
        $gte: oneWeekAgo,
        $lte: now,
      },
    };

    // If interests are provided, add to query
    if (interests) {
      const interestArray = interests.split(","); // convert to array
      query.interests = { $in: interestArray }; // assuming 'interests' is an array field in user schema
    }
    const users = await Users.find(query).select(
      "_id fullName image interests createdAt"
    );

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("Error in discover api:", err);
    return NextResponse.json(
      { error: "Error in discover api" },
      { status: 500 }
    );
  }
}

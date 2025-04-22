import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Users from "../../../../../models/User";
import Posts from "../../../../../models/Posts";

export async function GET(req) {
  try {
    await connectMongoDB();

    // Parse body for pagination
    const body = await req.json();
    // const page = parseInt(body.page) || 1;
    // const limit = parseInt(body.limit) || 10;
    // const skip = (page - 1) * limit;

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
    // Find who blacklisted this user
    const checkInBlackList = await Users.find({ blackList: user._id }).select(
      "_id"
    );
    const blackListedUserIds = checkInBlackList.map((u) => u._id.toString());

    // Find who whitelisted this user
    const checkInWhiteList = await Users.find({ whiteList: user._id }).select(
      "_id"
    );
    const whiteListedUserIds = checkInWhiteList.map((u) => u._id.toString());

    let matchCondition = {};

    // 🔴 If whitelist exists, only show those
    if (whiteListedUserIds.length > 0) {
      matchCondition.userId = { $in: whiteListedUserIds };
    }
    // ❌ Otherwise, filter out blacklisted ones
    else if (blackListedUserIds.length > 0) {
      matchCondition.userId = { $nin: blackListedUserIds };
    }

    // Total count for pagination
    const totalPosts = await Posts.countDocuments(matchCondition);

    // Fetch paginated posts
    const posts = await Posts.aggregate([
      { $match: matchCondition },
      { $sort: { createdAt: -1 } },
      // { $skip: skip },
      // { $limit: limit },
      {
        $lookup: {
          from: "users", // collection name (must be lowercase and pluralized by default)
          localField: "userId",
          foreignField: "_id",
          as: "user", // the field where user data will be populated
        },
      },
      { $unwind: "$user" }, // flatten the user array (if you only want 1 user object)
      {
        $project: {
          _id: 1,
          userId: "$user._id", // populated userId
          userFullName: "$user.fullName",
          userImage: "$user.image",
          description: 1,
          image: 1,
          createdAt: 1,
          // Include other user fields or post fields here
        },
      },
    ]);
    return NextResponse.json(
      {
        message: "Posts fetched successfully",
        posts,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error while fetching posts:", err);
    return NextResponse.json(
      { error: "Error while getting all posts" },
      { status: 500 }
    );
  }
}

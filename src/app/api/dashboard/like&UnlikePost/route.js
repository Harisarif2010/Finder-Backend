import { NextResponse } from "next/server";
import { getToken } from "../../../../../libs/getToken";
import connectMongoDB from "../../../../../libs/dbConnect";
import Posts from "../../../../../models/Posts";

export async function POST(req) {
  try {
    await connectMongoDB();

    const token = await getToken(req);
   if (!token || token.error) {
     return NextResponse.json(
       { error: token?.error || "Unauthorized Access" },
       { status: 401 }
     );
   }

    const body = await req.json(); // contains postId and userId
    const { postId, id } = body;

    const post = await Posts.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let updatedPost;
    let action;

    if (post.likes.includes(id)) {
      // If already liked, remove the like (unlike)
      updatedPost = await Posts.findByIdAndUpdate(
        postId,
        { $pull: { likes: id } },
        { new: true }
      );
      action = "unliked";
    } else {
      // Else, add like
      updatedPost = await Posts.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: id } },
        { new: true }
      );
      action = "liked";
    }

    return NextResponse.json(
      {
        message: `Post successfully ${action}`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(`Error while post ${action}`, err);
    return NextResponse.json(
      { error: `Error while post ${action}` },
      { status: 500 }
    );
  }
}

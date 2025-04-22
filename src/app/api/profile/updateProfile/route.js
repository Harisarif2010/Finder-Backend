import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";

export async function PATCH(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // { fullName: "" , email : "" , password : "" , }

    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401 }
      );
    }
      let update = { ...body };
    if (body?.password) {
      update.password = await hash(body?.password, 10);
      }
      

   // Update user
const updatedUser = await Users.findByIdAndUpdate(token.id, update, {
  new: true, // Return the updated document
});
      if (updatedUser) {
        return NextResponse.json(
          {
            message: "User Updated",
            data: updatedUser,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error("Failed to update user", err);
      return NextResponse.json(
        { error: "Failed to update user. Try Again" },
        { status: 500 }
      );
    }
  } 


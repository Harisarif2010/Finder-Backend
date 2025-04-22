import { NextResponse } from "next/server";
import { getToken } from "../../../../../libs/getToken";
import Users from "../../../../../models/User";

export async function POST(req) {
  try {
    await connectMongoDB();

    const whiteUsers = await req?.json(); //  { whiteUser : [ '' , ''] }
    // Get The Token
    const token = await getToken(req);
   if (!token || token.error) {
     return NextResponse.json(
       { error: token?.error || "Unauthorized Access" },
       { status: 401 }
     );
   }
    // Get All Users
    const addWhiteLists = await Users.findByIdAndUpdate(
      token?.id,
      {
        $push: { whiteList: whiteUsers?.whiteUser },
      },
      { new: true }
    );
    if (!addWhiteLists) {
      return NextResponse.json(
        { error: "Error Adding WhiteList" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "WhiteList Added Successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error In Adding WhiteList", err);
    return NextResponse.json(
      { error: "Error In Adding WhiteList" },
      { status: 500 }
    );
  }
}

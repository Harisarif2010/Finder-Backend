import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Users from "../../../../../models/User";

export async function POST(req) {
  try {
    await connectMongoDB();
    const blackUser = await req?.json(); //  { blackUser : [ '' , ''] }
    // Get The Token
    const token = await getToken(req);
   if (!token || token.error) {
     return NextResponse.json(
       { error: token?.error || "Unauthorized Access" },
       { status: 401 }
     );
   }
    // Get All Users
    const addBlackList = await Users.findByIdAndUpdate(
      token?.id,
      {
        $push: { blackList: blackUser?.blackUser },
      },
      { new: true }
    );
    if (!addBlackList) {
      return NextResponse.json(
        { error: "Error Adding BlackList" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "BlackList Added Successfully" },
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

import { NextResponse } from "next/server";
import { compare, hash } from "bcrypt";
import { loginSchema } from "../../../../../validations/authValidation";
import Users from "../../../../../models/User";
import connectMongoDB from "../../../../../libs/dbConnect";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // this reads the ReadableStream internally

    // ! Validate the request body against the Joi
    const { error } = loginSchema.validate(body);
    // If validation fails, return an error responses
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message }, // Extract the error message from Joist error object
        { status: 400 }
      );
    }
    // Check if the user exists
    const checkUser = await Users.findOne({
      email: body?.email,
    });
    if (!checkUser) {
      return NextResponse.json({ error: "Invalid email" }, { status: 401 });
    }
    // ! Comapre the password
    const isPasswordCorrect = await compare(
      body?.password.toString(),
      checkUser.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    // 4. Generate the JWT using saved user info
    const token = jwt.sign(
      {
        id: checkUser._id,
        email: checkUser.email,
        role: checkUser.role,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Update user document with the token
    checkUser.token = token;
    checkUser.isLoggedIn = true;
    await checkUser.save(); // save the updated token field

    return NextResponse.json(
      {
        message: "Login Successful",
        token: checkUser?.token,
        role: checkUser?.role,
        id: checkUser?._id,
        isLoggedIn: checkUser?.isLoggedIn,
        isProfileCompleted: checkUser?.isProfileCompleted,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error In Login API", err);
    return NextResponse.json(
      { error: "Error In Login API. Try Again" },
      { status: 500 }
    );
  }
}

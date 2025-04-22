// middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "No Token Found In Middleware. Please Provide Token" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid Token In Middleware. Can't Proceed" },
      { status: 403 }
    );
  }
}

export const config = {
  matcher: [
    // Match all /api routes except these:
    "/api/(?!signup|otpVerification|forgotPassword|resetPassword).*",
  ],
};




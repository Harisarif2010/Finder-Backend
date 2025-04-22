// import CredentialsProvider from "next-auth/providers/credentials";
// import dbConnect from "../../../../../libs/dbConnect";
// import GoogleProvider from "next-auth/providers/google";
// import { compare } from "bcrypt";
// import NextAuth from "next-auth";
// import Owner from "../../../../../models/OwnerDetail";

// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       //   type: "credentials",
//       credentials: {},
//       async authorize(credentials) {
//         try {
//           await dbConnect();
//           const { email, password } = credentials;
//           // Find User From DB
//           const user = await Owner.findOne({
//             email: email,
//           });
//           if (user === null) throw new Error("User not found");
//           const hashP = user.password;
//           const comp = await compare(password, hashP);
//           if (!comp) throw new Error("Password Not Matched");
//           return {
//             id: user._id,
//             email: user.email,
//           };
//         } catch (error) {
//           throw new Error(error);
//         }
//       },
//     }),
//     // GoogleProvider({
//     //   clientId: process.env.GOOGLE_CLIENT_ID,
//     //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     // }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt",
//     maxAge: 24 * 60 * 60,
//   },
//   jwt: {
//     maxAge: 24 * 60 * 60,
//   },
//   // when the authorize function is called, the user object is passed as an argument.
//   callbacks: {
//     // async signIn({ user, account, profile }) {
//     //   // Sign in With Google
//     //   if (account?.provider !== "credentials") {
//     //     console.log("Google");
//     //     await dbConnect();
//     //     // Register with Google
//     //     let exist = await Doctor.findOne({ email: profile?.email });
//     //     if (!exist) {
//     //       let newRecord = await Doctor.create({
//     //         email: user.email,
//     //       });
//     //       user.id = newRecord._id;
//     //     } else {
//     //       user.id = exist._id;
//     //     }
//     //   }
//     //   return true;
//     // },
//     jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         return token;
//       }
//       return token;
//     },
//     session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;
//       }
//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };

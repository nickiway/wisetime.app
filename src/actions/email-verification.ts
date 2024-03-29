"use server";

import { dbConnect } from "@/lib/dbConnect";
import {
  IVerificationToken,
  VerificationToken,
} from "@/db/models/auth/VerificationToken";
import { User, UserType } from "@/db/models/auth/User";

export const emailVerification = async (token: string) => {
  const now = new Date().getTime();

  await dbConnect();

  const verificationToken = (await VerificationToken.findOne({
    token,
  })) as IVerificationToken;

  if (!verificationToken) return { error: "Such token does not exists" };

  if (verificationToken.expiers.getTime() < now)
    return { error: "The token expired" };

  const user = (await User.findOne({
    email: verificationToken.email,
  })) as UserType;

  if (user.emailVerified) {
    return { error: "Token is already validated" };
  }

  await User.updateOne(
    { email: verificationToken.email },
    { emailVerified: new Date() }
  );

  return { success: "Your email was verified" };
};

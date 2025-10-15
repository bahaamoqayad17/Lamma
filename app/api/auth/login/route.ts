import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongo";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  // Check if the user exists
  // Find user by email
  const { email, password, rememberMe } = await request.json();
  await connectToDatabase();

  const user = await User.findOne({ email }).lean();

  if (!user) {
    return NextResponse.json({
      status: false,
      error: "invalidEmailOrPassword",
    });
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return NextResponse.json({
      status: false,
      error: "invalidEmailOrPassword",
    });
  }

  if (!user.isVerified) {
    return NextResponse.json({
      status: false,
      error: "userNotVerified",
    });
  }

  await User.updateOne({ _id: user._id }, { $set: { lastActive: new Date() } });

  // Create a shorter session token with minimal data
  const sessionData = {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      id_number: user.id_number,
      tax_number: user.tax_number,
      bank_iban: user.bank_iban,
      bank_name: user.bank_name,
      commercial_number: user.commercial_number,
    },
  };

  let session;
  if (rememberMe) {
    session = jwt.sign(sessionData, process.env.NEXTAUTH_SECRET as string, {
      expiresIn: "30d",
    });
  } else {
    session = jwt.sign(sessionData, process.env.NEXTAUTH_SECRET as string, {
      expiresIn: "1d",
    });
  }

  // Return user object without password
  return NextResponse.json(
    {
      status: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        id_number: user.id_number,
        tax_number: user.tax_number,
        bank_iban: user.bank_iban,
        bank_name: user.bank_name,
        commercial_number: user.commercial_number,
      },
    },
    {
      headers: {
        "Set-Cookie": `session=${session}; HttpOnly; Path=/; Max-Age=${
          // 30 days if remember me, 1 day if not
          rememberMe ? 2592000 : 3600
        }; SameSite=Lax`,
      },
    }
  );
}

// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectToDatabase } from "@/lib/mongo";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { uploadFileToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const mobile_number = data.get("mobile_number") as string;
    const id_number = data.get("id_number") as string;
    const tax_number = data.get("tax_number") as string;
    const bank_iban = data.get("bank_iban") as string;
    const bank_name = data.get("bank_name") as string;
    const commercial_number = data.get("commercial_number") as string;
    const password = data.get("password") as string;
    const documents = data.getAll("documents") as File[];
    const role = data.get("role") as string;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { status: false, error: "All required fields must be filled" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { status: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile_number }, { id_number }, { commercial_number }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: false,
          error: "alreadyTaken",
          field: email || mobile_number || id_number || commercial_number,
        },
        { status: 409 }
      );
    }

    // Hash password
    const pwSalt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, pwSalt);

    const documentUrls = await Promise.all(
      documents.map(async (document: File) => {
        try {
          return await uploadFileToCloudinary(document);
        } catch (error) {
          console.error(`Failed to upload document ${document.name}:`, error);
          throw new Error(
            `Failed to upload ${document.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      })
    ).catch((error) => {
      console.error("Error uploading documents:", error);
      throw new Error("File upload failed. Please try again.");
    });

    // Create user (do NOT persist passwordConfirm)
    const newUser = await User.create({
      name,
      email,
      mobile_number,
      id_number,
      tax_number,
      bank_iban,
      bank_name,
      commercial_number,
      password: hashedPassword,
      isVerified: false, // ensure default
      role,
      documents: documentUrls,
    });

    if (!newUser) {
      return NextResponse.json(
        { status: false, error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create wallet (optional per your app)
    await Wallet.create({ user: newUser._id });

    // Populate for response/session
    const populatedUser = await User.findById(newUser._id).populate("role");

    // Create session (optional — you might block access until verified)
    const sessionData = {
      user: {
        id: populatedUser!._id.toString(),
        email: populatedUser!.email,
        name: populatedUser!.name,
        role: populatedUser!.role,
        id_number: populatedUser!.id_number,
        tax_number: populatedUser!.tax_number,
        bank_iban: populatedUser!.bank_iban,
        bank_name: populatedUser!.bank_name,
        commercial_number: populatedUser!.commercial_number,
      },
    };

    const session = jwt.sign(
      sessionData,
      process.env.NEXTAUTH_SECRET as string,
      {
        expiresIn: "30d",
      }
    );

    return NextResponse.json(
      {
        status: true,
        message:
          "Registration successful! Please check your email to verify your account.",
        user: {
          id: populatedUser!._id,
          email: populatedUser!.email,
          name: populatedUser!.name,
          role: populatedUser!.role,
          id_number: populatedUser!.id_number,
          tax_number: populatedUser!.tax_number,
          bank_iban: populatedUser!.bank_iban,
          bank_name: populatedUser!.bank_name,
          commercial_number: populatedUser!.commercial_number,
          isVerified: populatedUser!.isVerified,
          isActive: populatedUser!.isActive,
        },
      },
      {
        headers: {
          // 30 days
          "Set-Cookie": `session=${session}; HttpOnly; Path=/; Max-Age=${2592000}; SameSite=Lax`,
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        status: false,
        error: "An error occurred during registration. Please try again.",
      },
      { status: 500 }
    );
  }
}

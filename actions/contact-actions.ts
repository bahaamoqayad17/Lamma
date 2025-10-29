"use server";

import { connectToDatabase } from "@/lib/mongo";
import Contact from "@/models/Contact";

export const createContact = async (data: any) => {
  try {
    await connectToDatabase();

    await Contact.create(data);

    return { success: true, message: "Contact created successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create contact" };
  }
};

export const getContacts = async () => {
  try {
    await connectToDatabase();
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return {
      success: true,
      message: "Contacts fetched successfully",
      data: contacts,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to get contacts" };
  }
};

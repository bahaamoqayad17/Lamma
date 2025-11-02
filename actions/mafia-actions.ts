"use server";

import { getUserFromCookie } from "@/lib/cookie";
import { connectToDatabase } from "@/lib/mongo";
import MafiaSession from "@/models/MafiaSession";

export const getMafiaSession = async (id: string) => {
  try {
    await connectToDatabase();
    const mafiaSession = await MafiaSession.findOne({ gameId: id }).populate(
      "players"
    );

    if (!mafiaSession) {
      return { success: false, message: "Mafia session not found", data: null };
    }

    return {
      success: true,
      message: "Mafia session fetched successfully",
      data: mafiaSession,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to get mafia session",
      data: null,
    };
  }
};

export const startGame = async (
  name: string,
  number_of_players: number,
  gameId: string
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not found", data: null };
  }
  const user = session.user;
  try {
    await connectToDatabase();
    const mafiaSession = await MafiaSession.create({
      name,
      number_of_players,
      gameId,
      players: [user.id],
    });
    return {
      success: true,
      message: "Game started successfully",
      data: mafiaSession,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to start game", data: null };
  }
};

"use server";

import mongoose from "mongoose";
import { getUserFromCookie } from "@/lib/cookie";
import { connectToDatabase } from "@/lib/mongo";
import LammaSession from "@/models/LammaSession";
import HelpingCard from "@/models/HelpingCard";
import helpingCardsData from "@/data/helping-cards.json";

interface CreateLammaGameData {
  name: string;
  team1Name: string;
  team2Name: string;
  selectedSubcategories: string[];
  team1SelectedCards: number[];
  team2SelectedCards: number[];
  playWithoutCards: boolean;
}

// Helper function to convert numeric card IDs to ObjectIds
const convertCardIdsToObjectIds = async (
  cardIds: number[]
): Promise<mongoose.Types.ObjectId[]> => {
  if (cardIds.length === 0) return [];

  const objectIds: mongoose.Types.ObjectId[] = [];

  for (const cardId of cardIds) {
    // Find the card in JSON data by ID
    const cardData = helpingCardsData.find((card: any) => card.id === cardId);
    if (!cardData) continue;

    // Try to find the card in database by name, or create it if it doesn't exist
    let card = await HelpingCard.findOne({ name: cardData.name });
    if (!card) {
      card = await HelpingCard.create({
        name: cardData.name,
        description: cardData.description,
      });
    }
    objectIds.push(card._id as mongoose.Types.ObjectId);
  }

  return objectIds;
};

export const createLammaGame = async (
  data: CreateLammaGameData
): Promise<{ success: boolean; message: string; data: any }> => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not found", data: null };
  }

  try {
    await connectToDatabase();

    // Validate required fields
    if (!data.name || !data.team1Name || !data.team2Name) {
      return {
        success: false,
        message: "يرجى إدخال اسم اللعبة وأسماء الفريقين",
        data: null,
      };
    }

    // Validate subcategories selection
    if (!data.playWithoutCards && data.selectedSubcategories.length === 0) {
      return {
        success: false,
        message: "يرجى اختيار فئة واحدة على الأقل",
        data: null,
      };
    }

    // Convert subcategory IDs to ObjectIds
    const subcategoryObjectIds = data.selectedSubcategories.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Convert card IDs to ObjectIds
    const team1CardObjectIds = data.playWithoutCards
      ? []
      : await convertCardIdsToObjectIds(data.team1SelectedCards);
    const team2CardObjectIds = data.playWithoutCards
      ? []
      : await convertCardIdsToObjectIds(data.team2SelectedCards);

    // Create the session
    const lammaSession = await LammaSession.create({
      name: data.name,
      team1: {
        name: data.team1Name,
        score: 0,
        selectedCards: team1CardObjectIds,
      },
      team2: {
        name: data.team2Name,
        score: 0,
        selectedCards: team2CardObjectIds,
      },
      selectedSubcategories: subcategoryObjectIds,
      playWithoutCards: data.playWithoutCards,
      currentRound: 1,
      finished: false,
      moves: [],
    });

    return {
      success: true,
      message: "تم إنشاء اللعبة بنجاح",
      data: {
        _id: lammaSession._id.toString(),
        name: lammaSession.name,
      },
    };
  } catch (error: any) {
    console.error("Error creating Lamma game:", error);
    return {
      success: false,
      message: error.message || "Failed to create game",
      data: null,
    };
  }
};

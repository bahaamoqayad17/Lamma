"use server";

import mongoose from "mongoose";
import { getUserFromCookie } from "@/lib/cookie";
import { connectToDatabase } from "@/lib/mongo";
import LammaSession from "@/models/LammaSession";
import HelpingCard from "@/models/HelpingCard";
import Question from "@/models/Question";
import Category from "@/models/Category";
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
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
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

    console.log(session);

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
      currentTurn: "team1",
      finished: false,
      moves: [],
      user: session.user.id,
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

export const getLammaSession = async (id: string) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }
  try {
    await connectToDatabase();

    // First, get the session to check if it exists and get selectedSubcategories
    const lammaSession = await LammaSession.findOne({
      _id: id,
      user: session.user.id,
    })
      .populate("team1.selectedCards")
      .populate("team2.selectedCards")
      .populate("user")
      .lean();

    if (!lammaSession) {
      return { success: false, message: "Lamma session not found", data: null };
    }

    const lammaSessionData = lammaSession as any;
    const selectedSubcategoryIds = Array.isArray(
      lammaSessionData.selectedSubcategories
    )
      ? lammaSessionData.selectedSubcategories.map((id: any) =>
          typeof id === "object" && id._id
            ? new mongoose.Types.ObjectId(id._id)
            : new mongoose.Types.ObjectId(id)
        )
      : [];

    if (selectedSubcategoryIds.length === 0) {
      return {
        success: true,
        message: "Lamma session fetched successfully",
        data: [],
      };
    }

    // Single aggregation query to get categories with their questions
    const gameData = await Category.aggregate([
      // Match only the selected categories
      { $match: { _id: { $in: selectedSubcategoryIds } } },
      // Lookup questions for each category
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "category",
          as: "questions",
        },
      },
      // Project and format the data
      {
        $project: {
          _id: { $toString: "$_id" },
          name: { $ifNull: ["$name", ""] },
          description: { $ifNull: ["$description", ""] },
          image: { $ifNull: ["$image", ""] },
          questions: {
            $map: {
              input: "$questions",
              as: "question",
              in: {
                _id: { $toString: "$$question._id" },
                category: {
                  _id: { $toString: "$_id" },
                  name: { $ifNull: ["$name", ""] },
                  description: { $ifNull: ["$description", ""] },
                  image: { $ifNull: ["$image", ""] },
                },
                file: { $ifNull: ["$$question.file_question", ""] },
                question: { $ifNull: ["$$question.question", ""] },
                answer: { $ifNull: ["$$question.answer", ""] },
                points: { $ifNull: ["$$question.points", 0] },
              },
            },
          },
        },
      },
    ]);

    return {
      success: true,
      message: "Lamma session fetched successfully",
      data: {
        session: lammaSession,
        gameData,
      },
    };
  } catch (error) {
    console.error("Error getting Lamma session:", error);
    return {
      success: false,
      message: "Failed to get Lamma session",
      data: null,
    };
  }
};

export const submitAnswer = async (
  sessionId: string,
  questionId: string,
  teamName: string,
  isCorrect: boolean,
  points: number
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }
  try {
    await connectToDatabase();

    const lammaSessionData = await LammaSession.findOne({
      _id: sessionId,
      user: session.user.id,
    });
    if (!lammaSessionData) {
      return {
        success: false,
        message: "Session not found",
        data: null,
      };
    }

    // Update team score
    if (isCorrect) {
      lammaSessionData[teamName].score =
        (lammaSessionData[teamName].score || 0) + points;
    }

    // Add move to moves array
    lammaSessionData.moves.push({
      question: new mongoose.Types.ObjectId(questionId),
      answeredBy: teamName,
      isCorrect,
      pointsAwarded: isCorrect ? points : 0,
      createdAt: new Date(),
    });

    // Switch turn to the other team after answering
    lammaSessionData.currentTurn = teamName === "team1" ? "team2" : "team1";

    await lammaSessionData.save();

    // Check if all questions are answered
    await checkAndFinishGameIfComplete(sessionId, lammaSessionData);

    return {
      success: true,
      message: "Answer submitted successfully",
      data: {
        team1Score: lammaSessionData.team1.score,
        team2Score: lammaSessionData.team2.score,
      },
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: "Failed to submit answer",
      data: null,
    };
  }
};

export const updateTeamScore = async (
  sessionId: string,
  team1Score: number,
  team2Score: number
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }
  try {
    await connectToDatabase();

    const lammaSessionData = await LammaSession.findOne({
      _id: sessionId,
      user: session.user.id,
    });
    if (!lammaSessionData) {
      return {
        success: false,
        message: "Session not found",
        data: null,
      };
    }

    // Update team scores directly (set the final score, not increment)
    lammaSessionData.team1.score = team1Score;
    lammaSessionData.team2.score = team2Score;

    await lammaSessionData.save();

    return {
      success: true,
      message: "Scores updated successfully",
      data: {
        team1Score: lammaSessionData.team1.score,
        team2Score: lammaSessionData.team2.score,
      },
    };
  } catch (error) {
    console.error("Error updating team scores:", error);
    return {
      success: false,
      message: "Failed to update scores",
      data: null,
    };
  }
};

export const updateTurn = async (
  sessionId: string,
  newTurn: "team1" | "team2"
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }
  try {
    await connectToDatabase();

    const lammaSessionData = await LammaSession.findOne({
      _id: sessionId,
      user: session.user.id,
    });
    if (!lammaSessionData) {
      return {
        success: false,
        message: "Session not found",
        data: null,
      };
    }

    // Update current turn
    lammaSessionData.currentTurn = newTurn;

    await lammaSessionData.save();

    return {
      success: true,
      message: "Turn updated successfully",
      data: {
        currentTurn: lammaSessionData.currentTurn,
      },
    };
  } catch (error) {
    console.error("Error updating turn:", error);
    return {
      success: false,
      message: "Failed to update turn",
      data: null,
    };
  }
};

export const useCard = async (
  sessionId: string,
  cardId: string,
  teamName: "team1" | "team2",
  cardData?: {
    cardType: string;
    lockedPoints?: number[];
    questionId?: string;
    targetTeam?: "team1" | "team2";
  }
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }
  try {
    await connectToDatabase();

    const lammaSessionData = await LammaSession.findOne({
      _id: sessionId,
      user: session.user.id,
    });
    if (!lammaSessionData) {
      return {
        success: false,
        message: "Session not found",
        data: null,
      };
    }

    // Check if it's the team's turn
    if (lammaSessionData.currentTurn !== teamName) {
      return {
        success: false,
        message: "Not your turn",
        data: null,
      };
    }

    // Check if card is already used
    const usedCardsField =
      teamName === "team1" ? "team1UsedCards" : "team2UsedCards";
    const cardObjectId = new mongoose.Types.ObjectId(cardId);
    if (lammaSessionData[usedCardsField].includes(cardObjectId)) {
      return {
        success: false,
        message: "Card already used",
        data: null,
      };
    }

    // Check if team has this card
    const teamCardsField =
      teamName === "team1" ? "team1.selectedCards" : "team2.selectedCards";
    const hasCard = lammaSessionData[teamName].selectedCards.some(
      (card: any) => card.toString() === cardId
    );
    if (!hasCard) {
      return {
        success: false,
        message: "Team doesn't have this card",
        data: null,
      };
    }

    // Check if target team has lock card active
    const targetTeam = teamName === "team1" ? "team2" : "team1";
    if (
      lammaSessionData.activeEffects?.lockCard?.active &&
      lammaSessionData.activeEffects?.lockCard?.targetTeam === teamName
    ) {
      return {
        success: false,
        message: "Cards are locked for this round",
        data: null,
      };
    }

    // Mark card as used
    lammaSessionData[usedCardsField].push(cardObjectId);

    // Apply card effects based on card type
    const cardType = cardData?.cardType || "";
    const targetTeamName = cardData?.targetTeam || targetTeam;

    // Initialize activeEffects if it doesn't exist
    if (!lammaSessionData.activeEffects) {
      lammaSessionData.activeEffects = {
        lockedCategories: [],
        preventedQuestions: [],
        doublePoints: { team: "", active: false },
        doubleAnswers: { team: "", remaining: 0 },
        lockCard: { team: "", targetTeam: "", active: false },
        counterAttack: {
          team: "",
          available: false,
          triggeredBy: "",
          attackType: "",
        },
      };
    }

    switch (cardType) {
      case "lockCategories":
        // Lock Categories
        if (cardData?.lockedPoints) {
          lammaSessionData.activeEffects.lockedCategories.push({
            team: teamName,
            targetTeam: targetTeamName,
            lockedPoints: cardData.lockedPoints,
          });
        }
        break;

      case "preventAnswer":
        // Prevent Answer
        if (cardData?.questionId) {
          lammaSessionData.activeEffects.preventedQuestions.push({
            team: teamName,
            targetTeam: targetTeamName,
            questionId: new mongoose.Types.ObjectId(cardData.questionId),
          });
        }
        break;

      case "doublePoints":
        // Double Points - activate for next question
        lammaSessionData.activeEffects.doublePoints = {
          team: teamName,
          active: true,
        };
        break;

      case "doubleAnswers":
        // Double Answers - allow 2 answers
        lammaSessionData.activeEffects.doubleAnswers = {
          team: teamName,
          remaining: 2,
        };
        break;

      case "lockCard":
        // Lock Card - prevent other team from using cards next round
        lammaSessionData.activeEffects.lockCard = {
          team: teamName,
          targetTeam: targetTeamName,
          active: true,
        };
        break;

      case "randomAttack":
        // Random Attack - randomly use one of: lockCategories, preventAnswer, silent, lockCard
        const attackCards = ["lockCategories", "preventAnswer", "silent", "lockCard"];
        const randomAttack = attackCards[Math.floor(Math.random() * attackCards.length)];
        // Apply the random attack (simplified - you might want to handle each case)
        if (randomAttack === "lockCard") {
          lammaSessionData.activeEffects.lockCard = {
            team: teamName,
            targetTeam: targetTeamName,
            active: true,
          };
        }
        // Note: For lockCategories and preventAnswer, we'd need additional data
        break;

      case "counterAttack":
        // Counter Attack - cancel the active attack
        if (lammaSessionData.activeEffects.counterAttack.available) {
          // Cancel the attack that triggered it
          const attackType =
            lammaSessionData.activeEffects.counterAttack.attackType;
          if (attackType === "lockCategories") {
            lammaSessionData.activeEffects.lockedCategories =
              lammaSessionData.activeEffects.lockedCategories.filter(
                (lock: any) =>
                  !(
                    lock.team ===
                      lammaSessionData.activeEffects.counterAttack.triggeredBy &&
                    lock.targetTeam === teamName
                  )
              );
          } else if (attackType === "preventAnswer") {
            lammaSessionData.activeEffects.preventedQuestions =
              lammaSessionData.activeEffects.preventedQuestions.filter(
                (prevent: any) =>
                  !(
                    prevent.team ===
                      lammaSessionData.activeEffects.counterAttack.triggeredBy &&
                    prevent.targetTeam === teamName
                  )
              );
          }
          // Reset counter attack
          lammaSessionData.activeEffects.counterAttack = {
            team: "",
            available: false,
            triggeredBy: "",
            attackType: "",
          };
        }
        break;
    }

    // If it's an attack card (except counterAttack), trigger counter attack availability for target team
    const attackCards = [
      "lockCategories",
      "preventAnswer",
      "randomAttack",
      "silent",
      "lockCard",
    ];
    if (attackCards.includes(cardType) && cardType !== "counterAttack") {
      lammaSessionData.activeEffects.counterAttack = {
        team: targetTeamName,
        available: true,
        triggeredBy: teamName,
        attackType: cardType,
      };
    }

    await lammaSessionData.save();

    return {
      success: true,
      message: "Card used successfully",
      data: {
        usedCard: cardId,
        activeEffects: lammaSessionData.activeEffects,
      },
    };
  } catch (error) {
    console.error("Error using card:", error);
    return {
      success: false,
      message: "Failed to use card",
      data: null,
    };
  }
};

export const markQuestionAsNoAnswer = async (
  sessionId: string,
  questionId: string
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }
  try {
    await connectToDatabase();

    const lammaSessionData = await LammaSession.findOne({
      _id: sessionId,
      user: session.user.id,
    });
    if (!lammaSessionData) {
      return {
        success: false,
        message: "Session not found",
        data: null,
      };
    }

    // Add move indicating no one answered
    lammaSessionData.moves.push({
      question: new mongoose.Types.ObjectId(questionId),
      answeredBy: "none",
      isCorrect: false,
      pointsAwarded: 0,
      createdAt: new Date(),
    });

    // Switch turn
    lammaSessionData.currentTurn =
      lammaSessionData.currentTurn === "team1" ? "team2" : "team1";

    // Clear double points effect if active
    if (lammaSessionData.activeEffects?.doublePoints?.active) {
      lammaSessionData.activeEffects.doublePoints.active = false;
    }

    // Clear lock card effect after round
    if (lammaSessionData.activeEffects?.lockCard?.active) {
      lammaSessionData.activeEffects.lockCard.active = false;
    }

    await lammaSessionData.save();

    // Check if all questions are answered
    await checkAndFinishGameIfComplete(sessionId, lammaSessionData);

    return {
      success: true,
      message: "Question marked as no answer",
      data: {
        currentTurn: lammaSessionData.currentTurn,
      },
    };
  } catch (error) {
    console.error("Error marking question as no answer:", error);
    return {
      success: false,
      message: "Failed to mark question",
      data: null,
    };
  }
};

export const finishGame = async (sessionId: string) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }
  try {
    await connectToDatabase();

    const lammaSessionData = await LammaSession.findOne({
      _id: sessionId,
      user: session.user.id,
    });
    if (!lammaSessionData) {
      return {
        success: false,
        message: "Session not found",
        data: null,
      };
    }

    // Mark game as finished
    lammaSessionData.finished = true;

    await lammaSessionData.save();

    return {
      success: true,
      message: "Game finished successfully",
      data: {
        finished: true,
      },
    };
  } catch (error) {
    console.error("Error finishing game:", error);
    return {
      success: false,
      message: "Failed to finish game",
      data: null,
    };
  }
};

// Helper function to check if all questions are answered and finish game
const checkAndFinishGameIfComplete = async (
  sessionId: string,
  lammaSessionData: any
) => {
  try {
    // Skip if already finished
    if (lammaSessionData.finished) {
      return;
    }

    // Get all questions from selected categories
    const selectedSubcategoryIds = Array.isArray(
      lammaSessionData.selectedSubcategories
    )
      ? lammaSessionData.selectedSubcategories.map((id: any) =>
          typeof id === "object" && id._id
            ? new mongoose.Types.ObjectId(id._id)
            : new mongoose.Types.ObjectId(id)
        )
      : [];

    if (selectedSubcategoryIds.length === 0) {
      return;
    }

    // Get all questions from selected categories
    const allQuestions = await Question.find({
      category: { $in: selectedSubcategoryIds },
    }).select("_id");

    const totalQuestions = allQuestions.length;

    if (totalQuestions === 0) {
      return;
    }

    // Get answered question IDs from moves
    const answeredQuestionIds = new Set(
      lammaSessionData.moves
        .filter((move: any) => move.question)
        .map((move: any) => {
          const questionId =
            typeof move.question === "object" && move.question._id
              ? move.question._id.toString()
              : move.question.toString();
          return questionId;
        })
    );

    // Check if all questions are answered
    if (answeredQuestionIds.size >= totalQuestions) {
      lammaSessionData.finished = true;
      await lammaSessionData.save();
      console.log("Game automatically finished - all questions answered");
    }
  } catch (error) {
    console.error("Error checking game completion:", error);
  }
};

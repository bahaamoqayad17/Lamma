"use server";

import { getUserFromCookie } from "@/lib/cookie";
import { connectToDatabase } from "@/lib/mongo";
import MafiaSession from "@/models/MafiaSession";
import Chat from "@/models/Chat";
import User from "@/models/User";
import mongoose from "mongoose";
import { emitToGame } from "@/lib/socket-server";

export const getMafiaSession = async (id: string) => {
  try {
    await connectToDatabase();
    const mafiaSession = await MafiaSession.findOne({ gameId: id })
      .populate("players.user", "name email")
      .populate("currentPhaseActions.mafiaKill.actor", "name")
      .populate("currentPhaseActions.mafiaKill.target", "name")
      .populate("currentPhaseActions.doctorHeal.actor", "name")
      .populate("currentPhaseActions.doctorHeal.target", "name")
      .populate("currentPhaseActions.detectiveReveal.actor", "name")
      .populate("currentPhaseActions.detectiveReveal.target", "name")
      .populate("votes.voter", "name")
      .populate("votes.target", "name")
      .lean();

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

export const createMafiaGame = async (
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
    const userId = new mongoose.Types.ObjectId(user.id);

    // Validate number of players
    if (number_of_players < 4) {
      return {
        success: false,
        message: "Minimum 6 players required",
        data: null,
      };
    }

    const mafiaSession = await MafiaSession.create({
      name,
      number_of_players,
      gameId,
      status: "created",
      phase: "waiting",
      players: [
        {
          user: userId,
          host: true,
          role: "citizen", // Will be reassigned when game starts
          isActive: true,
          eliminatedAt: null,
        },
      ],
    });

    const returnedSession = await MafiaSession.findById(mafiaSession._id)
      .populate("players.user", "name email")
      .lean();

    // Emit WebSocket event
    emitToGame(gameId, "game-state-update", returnedSession);

    return {
      success: true,
      message: "Game created successfully",
      data: returnedSession,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create game", data: null };
  }
};

export const joinMafiaGame = async (gameId: string) => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not authenticated", data: null };
  }

  try {
    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const mafiaSession = await MafiaSession.findOne({ gameId });
    if (!mafiaSession) {
      return { success: false, message: "Game not found", data: null };
    }

    if (mafiaSession.status !== "created") {
      return { success: false, message: "Game already started", data: null };
    }

    // Check if user already joined
    const alreadyJoined = mafiaSession.players.some(
      (p: any) => p.user.toString() === userId.toString()
    );

    if (alreadyJoined) {
      const updatedSession = await MafiaSession.findOne({ gameId })
        .populate("players.user", "name email")
        .lean();
      return {
        success: true,
        message: "Already in game",
        data: updatedSession,
      };
    }

    // Check if game is full
    if (mafiaSession.players.length >= mafiaSession.number_of_players) {
      return { success: false, message: "Game is full", data: null };
    }

    // Add player
    mafiaSession.players.push({
      user: userId,
      host: false,
      role: "citizen",
      isActive: true,
      eliminatedAt: null,
    });

    await mafiaSession.save();

    const updatedSession = await MafiaSession.findOne({ gameId })
      .populate("players.user", "name email")
      .lean();

    // Emit WebSocket event
    emitToGame(gameId, "game-state-update", updatedSession);
    emitToGame(gameId, "game-event", { type: "player-joined", gameId });

    return {
      success: true,
      message: "Joined game successfully",
      data: updatedSession,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to join game", data: null };
  }
};

export const startMafiaGame = async (gameId: string) => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not authenticated", data: null };
  }

  try {
    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const mafiaSession = await MafiaSession.findOne({ gameId });
    if (!mafiaSession) {
      return { success: false, message: "Game not found", data: null };
    }

    // Check if user is host
    const hostPlayer = mafiaSession.players.find((p: any) => p.host);
    if (!hostPlayer || hostPlayer.user.toString() !== userId.toString()) {
      return {
        success: false,
        message: "Only host can start the game",
        data: null,
      };
    }

    // Check minimum players (6 or more)
    if (mafiaSession.players.length < 6) {
      return {
        success: false,
        message: "Need at least 6 players to start",
        data: null,
      };
    }

    if (mafiaSession.status !== "created") {
      return { success: false, message: "Game already started", data: null };
    }

    // Assign roles randomly
    const players = mafiaSession.players.map((p: any) => p.user.toString());
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    // Assign roles: 1 mafia, 1 doctor, 1 detective, rest citizens
    mafiaSession.players.forEach((player: any, index: number) => {
      const playerIndex = players.indexOf(player.user.toString());
      if (shuffled[0] === player.user.toString()) {
        player.role = "mafia";
      } else if (shuffled[1] === player.user.toString()) {
        player.role = "doctor";
      } else if (shuffled[2] === player.user.toString()) {
        player.role = "detective";
      } else {
        player.role = "citizen";
      }
    });

    // Create chat sessions
    await Chat.create({
      mafiaSession: mafiaSession._id,
      type: "all",
      messages: [],
    });

    await Chat.create({
      mafiaSession: mafiaSession._id,
      type: "mafia",
      messages: [],
    });

    // Start game - first round, action phase
    mafiaSession.status = "started";
    mafiaSession.phase = "action";
    mafiaSession.roundNumber = 1;
    mafiaSession.phaseEndTime = new Date(Date.now() + 60 * 1000); // 60 seconds for action phase

    await mafiaSession.save();

    const updatedSession = await MafiaSession.findOne({ gameId })
      .populate("players.user", "name email")
      .lean();

    // Emit WebSocket event
    emitToGame(gameId, "game-state-update", updatedSession);
    emitToGame(gameId, "game-event", { type: "game-started", gameId });
    emitToGame(gameId, "phase-transition", { phase: "action", gameId });

    return {
      success: true,
      message: "Game started successfully",
      data: updatedSession,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to start game", data: null };
  }
};

export const performAction = async (
  gameId: string,
  actionType: "kill" | "heal" | "reveal",
  targetUserId: string | null
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not authenticated", data: null };
  }

  try {
    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const targetId = targetUserId
      ? new mongoose.Types.ObjectId(targetUserId)
      : null;

    const mafiaSession = await MafiaSession.findOne({ gameId });
    if (!mafiaSession) {
      return { success: false, message: "Game not found", data: null };
    }

    if (mafiaSession.status !== "started" || mafiaSession.phase !== "action") {
      return { success: false, message: "Not in action phase", data: null };
    }

    // Find player
    const player = mafiaSession.players.find(
      (p: any) => p.user.toString() === userId.toString() && p.isActive
    );
    if (!player) {
      return {
        success: false,
        message: "Player not found or eliminated",
        data: null,
      };
    }

    // Validate action based on role
    if (actionType === "kill" && player.role !== "mafia") {
      return { success: false, message: "Only mafia can kill", data: null };
    }
    if (actionType === "heal" && player.role !== "doctor") {
      return { success: false, message: "Only doctor can heal", data: null };
    }
    if (actionType === "reveal" && player.role !== "detective") {
      return {
        success: false,
        message: "Only detective can reveal",
        data: null,
      };
    }

    // Validate target (if provided)
    if (targetId) {
      const targetPlayer = mafiaSession.players.find(
        (p: any) => p.user.toString() === targetId.toString() && p.isActive
      );
      if (!targetPlayer) {
        return {
          success: false,
          message: "Target player not found",
          data: null,
        };
      }
      if (
        targetPlayer.user.toString() === userId.toString() &&
        actionType === "kill"
      ) {
        return { success: false, message: "Cannot kill yourself", data: null };
      }
    }

    // Perform action
    if (actionType === "kill") {
      mafiaSession.currentPhaseActions.mafiaKill = {
        actor: userId,
        target: targetId,
      };
    } else if (actionType === "heal") {
      mafiaSession.currentPhaseActions.doctorHeal = {
        actor: userId,
        target: targetId || userId, // Can heal self
      };
    } else if (actionType === "reveal") {
      if (!targetId) {
        return {
          success: false,
          message: "Must select a target to reveal",
          data: null,
        };
      }
      const targetPlayer = mafiaSession.players.find(
        (p: any) => p.user.toString() === targetId.toString()
      );
      if (targetPlayer) {
        mafiaSession.currentPhaseActions.detectiveReveal = {
          actor: userId,
          target: targetId,
          revealedRole: targetPlayer.role,
        };
      }
    }

    await mafiaSession.save();

    const updatedSession = await MafiaSession.findOne({ gameId })
      .populate("players.user", "name email")
      .populate("currentPhaseActions.mafiaKill.target", "name")
      .populate("currentPhaseActions.doctorHeal.target", "name")
      .populate("currentPhaseActions.detectiveReveal.target", "name")
      .lean();

    // Emit WebSocket event
    emitToGame(gameId, "game-state-update", updatedSession);
    emitToGame(gameId, "player-action", { actionType, gameId });

    return {
      success: true,
      message: "Action performed successfully",
      data: updatedSession,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to perform action", data: null };
  }
};

export const submitVote = async (
  gameId: string,
  targetUserId: string | null
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not authenticated", data: null };
  }

  try {
    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const targetId = targetUserId
      ? new mongoose.Types.ObjectId(targetUserId)
      : null;

    const mafiaSession = await MafiaSession.findOne({ gameId });
    if (!mafiaSession) {
      return { success: false, message: "Game not found", data: null };
    }

    if (mafiaSession.status !== "started" || mafiaSession.phase !== "voting") {
      return { success: false, message: "Not in voting phase", data: null };
    }

    // Find player
    const player = mafiaSession.players.find(
      (p: any) => p.user.toString() === userId.toString() && p.isActive
    );
    if (!player) {
      return {
        success: false,
        message: "Player not found or eliminated",
        data: null,
      };
    }

    // Validate target if provided
    if (targetId) {
      const targetPlayer = mafiaSession.players.find(
        (p: any) => p.user.toString() === targetId.toString() && p.isActive
      );
      if (!targetPlayer) {
        return {
          success: false,
          message: "Target player not found",
          data: null,
        };
      }
      if (targetPlayer.user.toString() === userId.toString()) {
        return {
          success: false,
          message: "Cannot vote for yourself",
          data: null,
        };
      }
    }

    // Remove existing vote for this round
    mafiaSession.votes = mafiaSession.votes.filter(
      (v: any) =>
        !(
          v.voter.toString() === userId.toString() &&
          v.roundNumber === mafiaSession.roundNumber
        )
    );

    // Add new vote
    mafiaSession.votes.push({
      voter: userId,
      target: targetId, // null means skip/no vote
      roundNumber: mafiaSession.roundNumber,
      createdAt: new Date(),
    });

    await mafiaSession.save();

    const updatedSession = await MafiaSession.findOne({ gameId })
      .populate("players.user", "name email")
      .populate("votes.voter", "name")
      .populate("votes.target", "name")
      .lean();

    // Emit WebSocket event
    emitToGame(gameId, "game-state-update", updatedSession);
    emitToGame(gameId, "vote-updated", { gameId });

    return {
      success: true,
      message: "Vote submitted successfully",
      data: updatedSession,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to submit vote", data: null };
  }
};

export const sendChatMessage = async (
  gameId: string,
  message: string,
  chatType: "all" | "mafia"
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not authenticated", data: null };
  }

  try {
    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const mafiaSession = await MafiaSession.findOne({ gameId });
    if (!mafiaSession) {
      return { success: false, message: "Game not found", data: null };
    }

    // Check if user is in game and active
    const player = mafiaSession.players.find(
      (p: any) => p.user.toString() === userId.toString() && p.isActive
    );
    if (!player) {
      return {
        success: false,
        message: "Player not found or eliminated",
        data: null,
      };
    }

    // Check if mafia-only chat and user is not mafia
    if (chatType === "mafia" && player.role !== "mafia") {
      return {
        success: false,
        message: "Only mafia can use mafia chat",
        data: null,
      };
    }

    // Find or create chat
    let chat = await Chat.findOne({
      mafiaSession: mafiaSession._id,
      type: chatType,
    });

    if (!chat) {
      chat = await Chat.create({
        mafiaSession: mafiaSession._id,
        type: chatType,
        messages: [],
      });
    }

    const user = await User.findById(userId);
    chat.messages.push({
      sender: userId,
      senderName: user?.name || "Unknown",
      message: message.trim(),
      createdAt: new Date(),
    });

    await chat.save();

    // Emit WebSocket event
    const lastMessage = chat.messages[chat.messages.length - 1];
    emitToGame(gameId, "chat-message", {
      chatType,
      message: lastMessage,
      gameId,
    });

    return {
      success: true,
      message: "Message sent successfully",
      data: chat,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to send message", data: null };
  }
};

export const getChatMessages = async (
  gameId: string,
  chatType: "all" | "mafia"
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return { success: false, message: "User not authenticated", data: null };
  }

  try {
    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const mafiaSession = await MafiaSession.findOne({ gameId });
    if (!mafiaSession) {
      return { success: false, message: "Game not found", data: null };
    }

    // Check if user is in game
    const player = mafiaSession.players.find(
      (p: any) => p.user.toString() === userId.toString()
    );
    if (!player) {
      return { success: false, message: "Player not in game", data: null };
    }

    // Check if mafia-only chat and user is not mafia
    if (chatType === "mafia" && player.role !== "mafia") {
      return {
        success: false,
        message: "Only mafia can access mafia chat",
        data: null,
      };
    }

    const chat = await Chat.findOne({
      mafiaSession: mafiaSession._id,
      type: chatType,
    })
      .populate("messages.sender", "name")
      .lean();

    const chatData = chat as any;

    return {
      success: true,
      message: "Messages fetched successfully",
      data: chatData?.messages || [],
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to get messages", data: null };
  }
};

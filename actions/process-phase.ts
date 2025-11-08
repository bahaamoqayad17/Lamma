"use server";

import { connectToDatabase } from "@/lib/mongo";
import MafiaSession from "@/models/MafiaSession";
import { emitToGame } from "@/lib/socket-server";

export const processGamePhase = async (gameId: string) => {
  try {
    await connectToDatabase();
    const mafiaSession = await MafiaSession.findOne({ gameId })
      .populate("players.user", "name")
      .lean();

    if (!mafiaSession || (mafiaSession as any).status !== "started") {
      return { success: false, message: "Game not active", data: null };
    }

    // Convert back to Mongoose document for updates
    const sessionDoc = await MafiaSession.findById((mafiaSession as any)._id);
    if (!sessionDoc)
      return { success: false, message: "Session not found", data: null };

    const now = new Date();

    if (sessionDoc.phase === "action") {
      // Process action phase results and move to voting
      const killAction = sessionDoc.currentPhaseActions.mafiaKill;
      const healAction = sessionDoc.currentPhaseActions.doctorHeal;

      // Process kill (if not healed)
      if (killAction?.target) {
        const targetPlayer = sessionDoc.players.find(
          (p: any) => p.user.toString() === killAction.target.toString()
        );
        const healedPlayer = healAction?.target;

        // Kill if not healed
        if (
          targetPlayer &&
          (!healedPlayer ||
            healedPlayer.toString() !== killAction.target.toString())
        ) {
          targetPlayer.isActive = false;
          targetPlayer.eliminatedAt = now;

          // Check if mafia was killed - citizens win
          if (targetPlayer.role === "mafia") {
            sessionDoc.status = "ended";
            sessionDoc.winner = "citizens";
            sessionDoc.phase = "results";
          }
        }
      }

      // Check win conditions
      const activePlayers = sessionDoc.players.filter((p: any) => p.isActive);
      const mafiaCount = activePlayers.filter(
        (p: any) => p.role === "mafia"
      ).length;
      const citizenCount = activePlayers.filter(
        (p: any) => p.role !== "mafia"
      ).length;

      if (sessionDoc.status !== "ended") {
        if (mafiaCount >= citizenCount) {
          // Mafia wins
          sessionDoc.status = "ended";
          sessionDoc.winner = "mafia";
          sessionDoc.phase = "results";
        } else {
          // Move to voting phase
          sessionDoc.phase = "voting";
          sessionDoc.phaseEndTime = new Date(now.getTime() + 120 * 1000); // 120 seconds for voting
          // Clear current phase actions
          sessionDoc.currentPhaseActions.mafiaKill = {
            actor: null,
            target: null,
          };
          sessionDoc.currentPhaseActions.doctorHeal = {
            actor: null,
            target: null,
          };
          sessionDoc.currentPhaseActions.detectiveReveal = {
            actor: null,
            target: null,
            revealedRole: null,
          };
        }
      }
    } else if (sessionDoc.phase === "voting") {
      // Process voting and move to next round
      const roundVotes = sessionDoc.votes.filter(
        (v: any) => v.roundNumber === sessionDoc.roundNumber
      );

      // Count votes
      const voteCounts: { [key: string]: number } = {};
      roundVotes.forEach((vote: any) => {
        if (vote.target) {
          const targetId = vote.target.toString();
          voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        }
      });

      // Find player with most votes
      let maxVotes = 0;
      let eliminatedTargetId: string | null = null;

      Object.entries(voteCounts).forEach(
        ([targetId, count]: [string, number]) => {
          if (count > maxVotes) {
            maxVotes = count;
            eliminatedTargetId = targetId;
          }
        }
      );

      // If there's a tie or no votes, no elimination
      const tieCount = Object.values(voteCounts).filter(
        (c) => c === maxVotes
      ).length;
      if (tieCount > 1 || maxVotes === 0) {
        // No elimination, continue to next round
      } else if (eliminatedTargetId) {
        // Eliminate the voted player
        const eliminatedPlayer = sessionDoc.players.find(
          (p: any) => p.user.toString() === eliminatedTargetId
        );
        if (eliminatedPlayer) {
          eliminatedPlayer.isActive = false;
          eliminatedPlayer.eliminatedAt = now;

          // Check if mafia was eliminated - citizens win
          if (eliminatedPlayer.role === "mafia") {
            sessionDoc.status = "ended";
            sessionDoc.winner = "citizens";
            sessionDoc.phase = "results";
          }
        }
      }

      // Check win conditions
      if (sessionDoc.status !== "ended") {
        const activePlayers = sessionDoc.players.filter((p: any) => p.isActive);
        const mafiaCount = activePlayers.filter(
          (p: any) => p.role === "mafia"
        ).length;
        const citizenCount = activePlayers.filter(
          (p: any) => p.role !== "mafia"
        ).length;

        if (mafiaCount >= citizenCount) {
          // Mafia wins
          sessionDoc.status = "ended";
          sessionDoc.winner = "mafia";
          sessionDoc.phase = "results";
        } else {
          // Move to next round - action phase
          sessionDoc.roundNumber += 1;
          sessionDoc.phase = "action";
          sessionDoc.phaseEndTime = new Date(now.getTime() + 60 * 1000); // 60 seconds for action
          // Clear votes for new round
          sessionDoc.votes = sessionDoc.votes.filter(
            (v: any) => v.roundNumber < sessionDoc.roundNumber
          );
        }
      }
    }

    await sessionDoc.save();

    const updatedSession = await MafiaSession.findOne({ gameId })
      .populate("players.user", "name email")
      .populate("currentPhaseActions.mafiaKill.target", "name")
      .populate("currentPhaseActions.doctorHeal.target", "name")
      .populate("currentPhaseActions.detectiveReveal.target", "name")
      .populate("votes.voter", "name")
      .populate("votes.target", "name")
      .lean();

    // Emit WebSocket events
    emitToGame(gameId, "game-state-update", updatedSession);
    emitToGame(gameId, "phase-transition", {
      phase: updatedSession.phase,
      gameId,
    });

    if (updatedSession.status === "ended") {
      emitToGame(gameId, "game-event", {
        type: "game-ended",
        winner: updatedSession.winner,
        gameId,
      });
    }

    return {
      success: true,
      message: "Phase processed successfully",
      data: updatedSession,
    };
  } catch (error) {
    console.error("Error processing phase:", error);
    return { success: false, message: "Failed to process phase", data: null };
  }
};

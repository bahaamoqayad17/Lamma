"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import Image from "next/image";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowBigDown,
  ArrowDown,
  LogOut,
  PlusIcon,
  SkipForward,
} from "lucide-react";
import TimerComponent from "@/components/Timer";
import { MinusIcon } from "lucide-react";
import {
  submitAnswer,
  updateTeamScore,
  updateTurn,
  useCard,
  markQuestionAsNoAnswer,
  finishGame,
} from "@/actions/lamma-actions";
import { toast } from "react-toastify";
import helpingCardsData from "@/data/helping-cards.json";
import LammaEndGame from "@/components/LammaEndGame";
import AnswerCorrectionModal from "@/components/modals/AnswerCorrectionModal";

export default function InGame({ data }: { data: any }) {
  const [step, setStep] = useState<"list" | "question">("list");
  const [gameFinished, setGameFinished] = useState(
    data?.session?.finished || false
  );
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showAnswerCorrectionModal, setShowAnswerCorrectionModal] =
    useState(false);

  // Local state for scores (optimistic updates)
  const [localScores, setLocalScores] = useState({
    team1: data?.session?.team1?.score || 0,
    team2: data?.session?.team2?.score || 0,
  });

  // Local state for current turn
  const [currentTurn, setCurrentTurn] = useState<"team1" | "team2">(
    data?.session?.currentTurn || "team1"
  );

  // Local state for card effects
  const [activeEffects, setActiveEffects] = useState<any>(
    data?.session?.activeEffects || {
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
    }
  );

  // Track used cards (using card IDs from JSON)
  const [usedCards, setUsedCards] = useState<{
    team1: Set<number>;
    team2: Set<number>;
  }>({
    team1: new Set(
      data?.session?.team1UsedCards?.map((cardId: any) =>
        typeof cardId === "number" ? cardId : Number(cardId)
      ) || []
    ),
    team2: new Set(
      data?.session?.team2UsedCards?.map((cardId: any) =>
        typeof cardId === "number" ? cardId : Number(cardId)
      ) || []
    ),
  });

  // Track double answers remaining
  const [doubleAnswersRemaining, setDoubleAnswersRemaining] = useState(
    activeEffects?.doubleAnswers?.remaining || 0
  );

  // Card selection modals
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showCounterAttackPrompt, setShowCounterAttackPrompt] = useState(false);

  // Local state for answered questions (optimistic updates)
  const initialAnsweredQuestions = useMemo<Set<string>>(() => {
    const questionIds: string[] = [];
    if (data?.session?.moves) {
      for (const move of data.session.moves) {
        let questionId: string | null = null;
        if (typeof move.question === "object" && move.question?._id) {
          questionId = move.question._id.toString();
        } else if (move.question) {
          questionId = move.question.toString();
        }
        if (questionId) {
          questionIds.push(questionId);
        }
      }
    }
    return new Set<string>(questionIds);
  }, [data?.session?.moves]);

  const [localAnsweredQuestions, setLocalAnsweredQuestions] = useState<
    Set<string>
  >(initialAnsweredQuestions as Set<string>);

  // Extract answered question IDs from moves (combine server and local)
  const answeredQuestionIds = localAnsweredQuestions;

  // Track blocked points blocks (categoryId-points-side)
  const [blockedBlocks, setBlockedBlocks] = useState<Set<string>>(new Set());

  // Debounce timer for score updates
  const scoreUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingScoreUpdateRef = useRef<{
    team1: number | null;
    team2: number | null;
  }>({ team1: null, team2: null });
  const currentScoresRef = useRef(localScores);

  // Get session ID helper
  const getSessionId = useCallback(() => {
    return data?.session?._id
      ? typeof data.session._id === "string"
        ? data.session._id
        : data.session._id.toString()
      : data?.session?.id;
  }, [data?.session?._id, data?.session?.id]);

  const handleQuestionSelect = (question: any, blockKey?: string) => {
    // Don't allow selecting already answered questions
    const questionId =
      typeof question._id === "string" ? question._id : question._id.toString();
    if (answeredQuestionIds.has(questionId)) {
      console.warn("Question already answered:", questionId);
      return;
    }

    // Check if block is already blocked
    if (blockKey && blockedBlocks.has(blockKey)) {
      console.warn("Block already blocked:", blockKey);
      return;
    }

    // Check if question is prevented for current team
    const isPrevented = activeEffects?.preventedQuestions?.some(
      (prevent: any) =>
        prevent.targetTeam === currentTurn &&
        prevent.questionId?.toString() === questionId
    );
    if (isPrevented) {
      toast.error("هذا السؤال محظور عليك");
      return;
    }

    // Check if category points are locked for current team
    const questionPoints = question.points || 0;
    const isCategoryLocked = activeEffects?.lockedCategories?.some(
      (lock: any) =>
        lock.targetTeam === currentTurn &&
        lock.lockedPoints?.includes(questionPoints)
    );
    if (isCategoryLocked) {
      toast.error("هذه الفئة مقفلة عليك");
      return;
    }

    setSelectedQuestion(question);
    setSelectedBlockKey(blockKey || null);
    setShowAnswer(false);
    setStep("question");

    // Apply double points if active
    if (
      activeEffects?.doublePoints?.active &&
      activeEffects?.doublePoints?.team === currentTurn
    ) {
      // Double points will be applied when answering
      toast.info("كرت دبل النقاط نشط - النقاط ستضاعف!");
    }
  };

  const handleTeamAnswer = async (teamName: "team1" | "team2") => {
    if (!selectedQuestion) return;

    // Ensure questionId is always a string
    const questionId =
      typeof selectedQuestion._id === "string"
        ? selectedQuestion._id
        : selectedQuestion._id.toString();
    let points = selectedQuestion.points || 0;

    // Apply double points if active
    if (
      activeEffects?.doublePoints?.active &&
      activeEffects?.doublePoints?.team === teamName
    ) {
      points = points * 2;
      // Clear double points after use
      setActiveEffects((prev: any) => ({
        ...prev,
        doublePoints: { team: "", active: false },
      }));
    }

    // Double-check: Don't allow answering if already answered
    if (answeredQuestionIds.has(questionId)) {
      console.warn(
        "Attempted to answer already answered question:",
        questionId
      );
      // Reset UI state
      setShowAnswer(false);
      setSelectedQuestion(null);
      setSelectedBlockKey(null);
      setStep("list");
      return;
    }

    // Optimistic update: Update local state immediately
    setLocalScores((prev) => ({
      ...prev,
      [teamName]: prev[teamName] + points,
    }));

    // Mark question as answered locally
    setLocalAnsweredQuestions((prev: Set<string>) => {
      const newSet = new Set<string>(prev);
      newSet.add(questionId);
      return newSet;
    });

    // Block the specific points block that was clicked
    if (selectedBlockKey) {
      setBlockedBlocks((prev) => {
        const newSet = new Set<string>(prev);
        newSet.add(selectedBlockKey);
        return newSet;
      });
    }

    // Handle double answers
    let shouldSwitchTurn = true;
    if (
      activeEffects?.doubleAnswers?.team === teamName &&
      activeEffects?.doubleAnswers?.remaining > 0
    ) {
      const newRemaining = activeEffects.doubleAnswers.remaining - 1;
      setActiveEffects((prev: any) => ({
        ...prev,
        doubleAnswers: {
          team: teamName,
          remaining: newRemaining,
        },
      }));
      setDoubleAnswersRemaining(newRemaining);
      // Don't switch turn if double answers remaining
      if (newRemaining > 0) {
        shouldSwitchTurn = false;
        toast.info(`باقي ${newRemaining} إجابة`);
      }
    }

    // Switch turn optimistically (only if not using double answers)
    const nextTurn = (teamName === "team1" ? "team2" : "team1") as
      | "team1"
      | "team2";
    if (shouldSwitchTurn) {
      setCurrentTurn(nextTurn);
    }

    // Clear lock card effect after round
    if (activeEffects?.lockCard?.active && shouldSwitchTurn) {
      setActiveEffects((prev: any) => ({
        ...prev,
        lockCard: { team: "", targetTeam: "", active: false },
      }));
    }

    // Keep timer running - don't stop it here
    // Timer will reset when new question is selected or reset button is clicked

    // Reset UI state
    setShowAnswer(false);
    setSelectedQuestion(null);
    if (shouldSwitchTurn) {
      setStep("list");
    }

    // Extract session ID properly
    const sessionId = data?.session?._id
      ? typeof data.session._id === "string"
        ? data.session._id
        : data.session._id.toString()
      : data?.session?.id;

    if (sessionId) {
      submitAnswer(
        sessionId,
        questionId,
        teamName,
        true, // isCorrect - always true when team button is clicked
        points
      )
        .then(() => {
          // Turn is already updated in submitAnswer server action
          // But we can also explicitly update it here for safety
          if (shouldSwitchTurn) {
            updateTurn(sessionId, nextTurn).catch((error) => {
              console.error("Error updating turn:", error);
            });
          }
          // Check if all questions are answered - server will handle finishing
          // Check game status after a short delay
          setTimeout(async () => {
            const sessionId = getSessionId();
            if (sessionId) {
              // Fetch updated session to check if finished
              const { getLammaSession } = await import(
                "@/actions/lamma-actions"
              );
              const result = await getLammaSession(sessionId);
              if (
                result.success &&
                result.data &&
                typeof result.data === "object" &&
                "session" in result.data
              ) {
                const sessionData = result.data as { session: any };
                if (sessionData.session?.finished) {
                  setGameFinished(true);
                }
              }
            }
          }, 500);
        })
        .catch((error) => {
          console.error("Error submitting answer:", error);
          // Optionally revert optimistic update on error
          // For now, we'll keep it optimistic
        });
    }
  };

  // Handle finish game button
  const handleFinishGame = useCallback(async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Confirm action
    if (!confirm("هل أنت متأكد من إنهاء اللعبة؟")) {
      return;
    }

    const result = await finishGame(sessionId);
    if (result.success) {
      toast.success("تم إنهاء اللعبة");
      // Update state to show end game screen
      setGameFinished(true);
    } else {
      toast.error(result.message || "فشل في إنهاء اللعبة");
    }
  }, [getSessionId]);

  // Update ref when localScores changes
  useEffect(() => {
    currentScoresRef.current = localScores;
  }, [localScores]);

  // Debounced function to update scores on server
  const debouncedUpdateScores = useCallback(() => {
    // Clear existing timer
    if (scoreUpdateTimerRef.current) {
      clearTimeout(scoreUpdateTimerRef.current);
    }

    // Set new timer
    scoreUpdateTimerRef.current = setTimeout(() => {
      const sessionId = getSessionId();

      // Get the latest pending scores, or fallback to current scores from ref
      const team1Score =
        pendingScoreUpdateRef.current.team1 ?? currentScoresRef.current.team1;
      const team2Score =
        pendingScoreUpdateRef.current.team2 ?? currentScoresRef.current.team2;

      if (sessionId) {
        updateTeamScore(sessionId, team1Score, team2Score).catch((error) => {
          console.error("Error updating scores:", error);
        });
      }

      // Reset pending updates
      pendingScoreUpdateRef.current = { team1: null, team2: null };
    }, 1000); // 1 second debounce
  }, [getSessionId]);

  // Handle score adjustment (plus/minus)
  const handleScoreAdjust = useCallback(
    (teamName: "team1" | "team2", delta: number) => {
      // Update local state immediately (optimistic update)
      setLocalScores((prev) => {
        const newScore = Math.max(0, prev[teamName] + delta); // Prevent negative scores

        // Track pending update for server sync
        pendingScoreUpdateRef.current[teamName] = newScore;

        return {
          ...prev,
          [teamName]: newScore,
        };
      });

      // Trigger debounced server update
      debouncedUpdateScores();
    },
    [debouncedUpdateScores]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scoreUpdateTimerRef.current) {
        clearTimeout(scoreUpdateTimerRef.current);
      }
    };
  }, []);

  // Check if card is used (using card ID from JSON)
  const isCardUsed = useCallback(
    (cardId: number, teamName: "team1" | "team2") => {
      return usedCards[teamName].has(cardId);
    },
    [usedCards]
  );

  // Check if team can use cards (not locked)
  const canUseCards = useCallback(
    (teamName: "team1" | "team2") => {
      return !(
        activeEffects?.lockCard?.active &&
        activeEffects?.lockCard?.targetTeam === teamName
      );
    },
    [activeEffects]
  );

  // Handle card click
  const handleCardClick = useCallback(
    (card: any, teamName: "team1" | "team2") => {
      // Only allow using cards on your turn
      if (currentTurn !== teamName) {
        toast.error("ليس دورك لاستخدام الكروت");
        return;
      }

      // Get card ID from JSON data (card.id is the numeric ID from JSON)
      const cardId = card.id || card._id;
      if (!cardId) {
        toast.error("خطأ في بيانات الكرت");
        return;
      }
      const numericCardId =
        typeof cardId === "number" ? cardId : Number(cardId);
      if (isCardUsed(numericCardId, teamName)) {
        toast.error("تم استخدام هذا الكرت مسبقاً");
        return;
      }

      // Check if cards are locked
      if (!canUseCards(teamName)) {
        toast.error("الكروت مقفلة في هذا الدور");
        return;
      }

      // Find card data from JSON
      const cardData = helpingCardsData.find((c: any) => c.name === card.name);

      if (!cardData) {
        toast.error("خطأ في بيانات الكرت");
        return;
      }

      // Handle different card types
      const cardName = cardData.name;

      if (cardName === "قفل الفئة") {
        // Lock Categories - need to select points
        setSelectedCard({ ...card, cardData, teamName });
        setShowCardModal(true);
      } else if (cardName === "منع الإجابة") {
        // Prevent Answer - need to select question
        if (!selectedQuestion) {
          toast.error("يجب اختيار سؤال أولاً");
          return;
        }
        handleUseCard(card, cardData, teamName, {
          cardType: "preventAnswer",
          questionId: selectedQuestion._id.toString(),
        });
      } else if (cardName === "دبل أو ناثينق") {
        // Double Points - activate before question selection
        if (step !== "list") {
          toast.error("يجب تفعيل هذا الكرت قبل اختيار السؤال");
          return;
        }
        handleUseCard(card, cardData, teamName, {
          cardType: "doublePoints",
        });
      } else if (cardName === "إجابتان") {
        // Double Answers
        handleUseCard(card, cardData, teamName, {
          cardType: "doubleAnswers",
        });
      } else if (cardName === "تبديل السؤال") {
        // Switch Question
        if (step !== "question") {
          toast.error("يجب أن تكون في صفحة السؤال");
          return;
        }
        setStep("list");
        setSelectedQuestion(null);
        setShowAnswer(false);
        toast.success("تم العودة لقائمة الأسئلة");
      } else if (cardName === "هجوم عشوائي") {
        // Random Attack
        handleUseCard(card, cardData, teamName, {
          cardType: "randomAttack",
        });
      } else if (cardName === "كرت الصمت") {
        // Silent - just show toast/animation
        handleUseCard(card, cardData, teamName, {
          cardType: "silent",
        });
        toast.info("🔇 تم تفعيل كرت الصمت!");
      } else if (cardName === "قفل الكرت") {
        // Lock Card
        const targetTeam = teamName === "team1" ? "team2" : "team1";
        handleUseCard(card, cardData, teamName, {
          cardType: "lockCard",
          targetTeam,
        });
      } else if (cardName === "تمديد الوقت") {
        // Extend Time - just show toast/animation
        handleUseCard(card, cardData, teamName, {
          cardType: "extendTime",
        });
        toast.info("⏰ تم تمديد الوقت 30 ثانية!");
      } else if (cardName === "كرت الدفاع") {
        // Counter Attack
        if (
          !activeEffects?.counterAttack?.available ||
          activeEffects?.counterAttack?.team !== teamName
        ) {
          toast.error("كرت الدفاع غير متاح");
          return;
        }
        handleUseCard(card, cardData, teamName, {
          cardType: "counterAttack",
        });
      }
    },
    [
      currentTurn,
      isCardUsed,
      canUseCards,
      selectedQuestion,
      step,
      activeEffects,
    ]
  );

  // Use card function
  const handleUseCard = useCallback(
    async (
      card: any,
      cardData: any,
      teamName: "team1" | "team2",
      cardOptions?: any
    ) => {
      const sessionId = getSessionId();
      if (!sessionId) return;

      // Get card ID from JSON data (card.id is the numeric ID from JSON)
      const cardId = card.id || card._id;
      if (!cardId) {
        toast.error("خطأ في بيانات الكرت");
        return;
      }
      const numericCardId =
        typeof cardId === "number" ? cardId : Number(cardId);
      const targetTeam = teamName === "team1" ? "team2" : "team1";

      // Optimistic update - mark card as used
      setUsedCards((prev) => {
        const newSet = new Set(prev[teamName]);
        newSet.add(numericCardId);
        return {
          ...prev,
          [teamName]: newSet,
        };
      });

      // Update active effects optimistically
      if (cardOptions?.cardType === "doublePoints") {
        setActiveEffects((prev: any) => ({
          ...prev,
          doublePoints: { team: teamName, active: true },
        }));
      } else if (cardOptions?.cardType === "doubleAnswers") {
        setActiveEffects((prev: any) => ({
          ...prev,
          doubleAnswers: { team: teamName, remaining: 2 },
        }));
        setDoubleAnswersRemaining(2);
      } else if (cardOptions?.cardType === "lockCard") {
        setActiveEffects((prev: any) => ({
          ...prev,
          lockCard: {
            team: teamName,
            targetTeam: cardOptions.targetTeam,
            active: true,
          },
        }));
      } else if (cardOptions?.cardType === "preventAnswer") {
        setActiveEffects((prev: any) => ({
          ...prev,
          preventedQuestions: [
            ...(prev.preventedQuestions || []),
            {
              team: teamName,
              targetTeam,
              questionId: cardOptions.questionId,
            },
          ],
        }));
      } else if (cardOptions?.cardType === "lockCategories") {
        setActiveEffects((prev: any) => ({
          ...prev,
          lockedCategories: [
            ...(prev.lockedCategories || []),
            {
              team: teamName,
              targetTeam,
              lockedPoints: cardOptions.lockedPoints,
            },
          ],
        }));
      } else if (cardOptions?.cardType === "randomAttack") {
        // Random attack will be handled on server
      } else if (cardOptions?.cardType === "counterAttack") {
        // Cancel the attack
        const attackType = activeEffects?.counterAttack?.attackType;
        if (attackType === "lockCategories") {
          setActiveEffects((prev: any) => ({
            ...prev,
            lockedCategories: (prev.lockedCategories || []).filter(
              (lock: any) =>
                !(
                  lock.team === activeEffects.counterAttack.triggeredBy &&
                  lock.targetTeam === teamName
                )
            ),
          }));
        } else if (attackType === "preventAnswer") {
          setActiveEffects((prev: any) => ({
            ...prev,
            preventedQuestions: (prev.preventedQuestions || []).filter(
              (prevent: any) =>
                !(
                  prevent.team === activeEffects.counterAttack.triggeredBy &&
                  prevent.targetTeam === teamName
                )
            ),
          }));
        }
        setActiveEffects((prev: any) => ({
          ...prev,
          counterAttack: {
            team: "",
            available: false,
            triggeredBy: "",
            attackType: "",
          },
        }));
        setShowCounterAttackPrompt(false);
      }

      // If it's an attack card (except counterAttack), show counter attack prompt for target team
      const attackCards = [
        "lockCategories",
        "preventAnswer",
        "randomAttack",
        "silent",
        "lockCard",
      ];
      if (
        attackCards.includes(cardOptions?.cardType) &&
        cardOptions?.cardType !== "counterAttack"
      ) {
        // Check if target team has counter attack card
        const targetTeamCards =
          targetTeam === "team1"
            ? data?.session?.team1?.selectedCards
            : data?.session?.team2?.selectedCards;
        const hasCounterAttack = targetTeamCards?.some(
          (c: any) => c.name === "كرت الدفاع"
        );
        // Find counter attack card ID
        const counterAttackCard = helpingCardsData.find(
          (c: any) => c.name === "كرت الدفاع"
        );
        if (
          hasCounterAttack &&
          counterAttackCard &&
          !isCardUsed(counterAttackCard.id, targetTeam)
        ) {
          setActiveEffects((prev: any) => ({
            ...prev,
            counterAttack: {
              team: targetTeam,
              available: true,
              triggeredBy: teamName,
              attackType: cardOptions?.cardType,
            },
          }));
          setShowCounterAttackPrompt(true);
        }
      }

      // Fire and forget - call server action
      useCard(sessionId, cardId, teamName, {
        ...cardOptions,
        targetTeam: cardOptions?.targetTeam || targetTeam,
      }).catch((error) => {
        console.error("Error using card:", error);
        // Revert optimistic update on error
        setUsedCards((prev) => {
          const newSet = new Set(prev[teamName]);
          newSet.delete(cardId);
          return {
            ...prev,
            [teamName]: newSet,
          };
        });
        toast.error("فشل في استخدام الكرت");
      });
    },
    [getSessionId, activeEffects, isCardUsed, data]
  );

  // Handle no one answers
  const handleNoOneAnswers = useCallback(async () => {
    if (!selectedQuestion) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    const questionId =
      typeof selectedQuestion._id === "string"
        ? selectedQuestion._id
        : selectedQuestion._id.toString();

    // Optimistic update
    setLocalAnsweredQuestions((prev: Set<string>) => {
      const newSet = new Set(prev);
      newSet.add(questionId);
      return newSet;
    });

    // Switch turn optimistically
    const nextTurn: "team1" | "team2" =
      currentTurn === "team1" ? "team2" : "team1";
    setCurrentTurn(nextTurn);

    // Reset UI
    setShowAnswer(false);
    setSelectedQuestion(null);
    setStep("list");

    // Block the specific points block that was clicked
    if (selectedBlockKey) {
      setBlockedBlocks((prev) => {
        const newSet = new Set<string>(prev);
        newSet.add(selectedBlockKey);
        return newSet;
      });
    }

    // Clear double points if active
    if (activeEffects?.doublePoints?.active) {
      setActiveEffects((prev: any) => ({
        ...prev,
        doublePoints: { team: "", active: false },
      }));
    }

    // Fire and forget
    markQuestionAsNoAnswer(sessionId, questionId)
      .then((result) => {
        if (result.success && result.data?.currentTurn) {
          setCurrentTurn(result.data.currentTurn);
        }
        // Check if all questions are answered - server will handle finishing
        // Check game status after a short delay
        setTimeout(async () => {
          const sessionId = getSessionId();
          if (sessionId) {
            // Fetch updated session to check if finished
            const { getLammaSession } = await import("@/actions/lamma-actions");
            const result = await getLammaSession(sessionId);
            if (
              result.success &&
              result.data &&
              typeof result.data === "object" &&
              "session" in result.data
            ) {
              const sessionData = result.data as { session: any };
              if (sessionData.session?.finished) {
                setGameFinished(true);
              }
            }
          }
        }, 500);
      })
      .catch((error) => {
        console.error("Error marking question:", error);
      });
  }, [selectedQuestion, getSessionId, currentTurn, activeEffects]);

  // Show end game screen if game is finished
  if (gameFinished) {
    return <LammaEndGame data={{ session: data?.session }} />;
  }

  return (
    <main className="overflow-hidden min-h-screen bg-[#E6E6E6]">
      <div className="relative z-10 flex items-center justify-between p-6 md:px-10 bg-[#55504C] h-full backdrop-blur-sm">
        {/* Exit button - Left side for RTL */}

        {/* Team Turn - Right side for RTL */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[#FCBB00]">
            {currentTurn === "team1"
              ? data?.session?.team1?.name
              : data?.session?.team2?.name}
          </span>
          <ArrowBigDown className="w-4 h-4 text-[#FCBB00]" />
        </div>

        {/* Game Name - Center */}
        <div className="flex justify-center text-white">
          <span className="font-bold text-lg">{data?.session?.name}</span>
        </div>

        <div className="flex gap-2 items-center">
          <Link href="/lamma/start">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-200"
              style={{
                boxShadow: "none",
              }}
            >
              <span className="text-sm sm:text-lg font-medium text-[#FCBB00]">
                خروج
              </span>
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-[#FCBB00]" />
            </Button>
          </Link>
          <Button
            onClick={handleFinishGame}
            variant="ghost"
            className="flex items-center gap-2 text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-200"
            style={{
              boxShadow: "none",
            }}
          >
            <span className="text-sm sm:text-lg font-medium text-[#FCBB00]">
              انتهاء اللعبة
            </span>
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-[#FCBB00]" />
          </Button>
        </div>
      </div>
      <div className="pt-4 h-full">
        <div className="mx-auto px-4">
          {/* Main Game Grid - 6 Question Cards */}
          {step === "list" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {data?.gameData?.map((category: any) => (
                <div key={category._id} className="w-full items-stretch">
                  <QuestionCard
                    data={category}
                    onQuestionSelect={handleQuestionSelect}
                    answeredQuestionIds={answeredQuestionIds}
                    blockedBlocks={blockedBlocks}
                    // className="h-full"
                  />
                </div>
              ))}
            </div>
          )}
          {step === "question" && selectedQuestion && (
            <div className="mx-20 mb-8">
              {/* Question Display Container */}
              <div
                className="rounded-xl bg-white border border-[#FCCB97]"
                style={{
                  boxShadow: "10px 10px 20px 0px #FCCB9733",
                }}
              >
                {/* Top Header Bar */}
                <div className="px-6 py-4 flex items-center justify-between">
                  {/* Right - Points */}
                  <div className="text-black font-bold text-lg">
                    {selectedQuestion.points} نقطة
                  </div>

                  {/* Center - Timer */}
                  <TimerComponent key={selectedQuestion._id} />
                  {/* Left - Category Button */}

                  <div className="bg-[#2F2C22] px-12 py-3 rounded-full">
                    <span className="text-[#FCCB97] font-bold text-xl">
                      {selectedQuestion.category.name}
                    </span>
                  </div>
                </div>

                {/* Question Content */}
                <div className="px-8">
                  {/* Question Text */}
                  <div className="text-center mb-8 flex flex-col items-center justify-center gap-6">
                    {showAnswer ? (
                      <h1 className="text-black text-xl md:text-2xl font-medium leading-relaxed text-green-500">
                        الإجابة الصحيحة هي : {selectedQuestion.answer}
                      </h1>
                    ) : (
                      <h1 className="text-black text-xl md:text-2xl font-medium leading-relaxed">
                        {selectedQuestion.question}
                      </h1>
                    )}

                    {!showAnswer ? (
                      <>
                        {selectedQuestion.file_question && (
                          <div className="w-1/2 h-100 [@media(min-width:2160px)]:h-170 relative flex items-center justify-center">
                            <Image
                              src={selectedQuestion.file_question}
                              alt="Question Image"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedQuestion.file_answer && (
                          <div className="w-1/2 h-100 [@media(min-width:2160px)]:h-170 relative flex items-center justify-center">
                            <Image
                              src={selectedQuestion.file_answer}
                              alt="Question Image"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-300 px-6 py-4">
                  {!showAnswer ? (
                    <div className="flex">
                      <button
                        className="text-black font-extrabold text-xl hover:text-white hover:bg-black px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer"
                        onClick={() => setShowAnswer(true)}
                      >
                        عرض الاجابة
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* make it center to right side */}
                      <div className="absolute top-1/2 right-0 -translate-y-1/2">
                        <button
                          className="text-black font-extrabold text-xl hover:text-white hover:bg-black px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer"
                          onClick={() => setShowAnswerCorrectionModal(true)}
                        >
                          تصحيح الإجابة
                        </button>
                      </div>
                      <div className="flex justify-center items-center gap-4">
                        <div className="flex justify-center items-center flex-col gap-4">
                          <h2 className="text-black font-bold text-lg">
                            أي الفريقين أجاب بشكل صحيح
                          </h2>

                          <div className="flex gap-4">
                            <button
                              onClick={() => handleTeamAnswer("team1")}
                              disabled={currentTurn !== "team1"}
                              className={`
                                text-black font-bold text-md border border-gray-300 rounded-xl px-4 py-2 transition-all duration-200
                                hover:bg-gray-300 cursor-pointer
                              `}
                            >
                              {data?.session?.team1?.name}
                            </button>
                            <button
                              onClick={() => handleTeamAnswer("team2")}
                              className={`
                                text-black font-bold text-md border border-gray-300 rounded-xl px-4 py-2 transition-all duration-200 hover:bg-gray-300 cursor-pointer
                              `}
                            >
                              {data?.session?.team2?.name}
                            </button>
                          </div>
                          <div className="flex justify-center items-center">
                            <button
                              onClick={handleNoOneAnswers}
                              className={`
                                text-black font-bold text-md border border-gray-300 rounded-xl px-4 py-2 transition-all duration-200 hover:bg-gray-300 cursor-pointer
                              `}
                            >
                              لا أحد أجاب
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Bottom Section - Teams, Logo, and Cards */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 md:px-16 py-4 bg-[#55504C] bottom-0 fixed w-full">
          {/* Left Section - Team 2 */}
          <div className="flex flex-row items-center justify-around gap-4 flex-1">
            {/* Team 2 Cards */}
            {!data?.session?.playWithoutCards && (
              <div className="flex items-center gap-2">
                {data?.session?.team2?.selectedCards?.map(
                  (card: any, index: number) => {
                    const cardId = card.id || card._id;
                    const numericCardId =
                      typeof cardId === "number" ? cardId : Number(cardId);
                    const isUsed = isCardUsed(numericCardId, "team2");
                    const canUse = canUseCards("team2");
                    const isClickable =
                      currentTurn === "team2" && !isUsed && canUse;

                    return (
                      <button
                        key={`team2-card-${index}`}
                        onClick={() => handleCardClick(card, "team2")}
                        disabled={!isClickable}
                        className={`
                            relative rounded-lg transition-all duration-200
                            ${
                              isClickable
                                ? "hover:scale-110 hover:shadow-lg cursor-pointer"
                                : "opacity-50 cursor-not-allowed"
                            }
                            ${isUsed ? "grayscale" : ""}
                          `}
                        type="button"
                        title={
                          isUsed
                            ? "تم استخدام هذا الكرت"
                            : !canUse
                            ? "الكروت مقفلة"
                            : currentTurn !== "team2"
                            ? "ليس دورك"
                            : card.name
                        }
                      >
                        <Image
                          src={card.image}
                          alt={card.name || "Power Card"}
                          width={80}
                          height={80}
                          className="rounded-lg"
                        />
                        {isUsed && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
            {/* Team 2 Score Display */}
            <div className="bg-[#2F2C22] rounded-full px-6 md:px-8 py-2 shadow-md border border-[#FDD57E] w-full max-w-xs">
              <div className="flex flex-col items-center">
                {/* Team Name with Plus Button */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleScoreAdjust("team2", 100)}
                    className="w-6 h-6 md:w-7 md:h-7 bg-[#FCCB97] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <PlusIcon className="w-4 h-4 text-black" />
                  </button>
                  <div className="flex flex-col items-center justify-center px-2">
                    <span className="text-[#FCCB97] font-bold text-base md:text-lg">
                      {data?.session?.team2?.name}
                    </span>

                    {/* Score Display */}
                    <span className="text-[#FCCB97] font-bold text-3xl md:text-4xl">
                      {localScores.team2}
                    </span>
                  </div>
                  <button
                    onClick={() => handleScoreAdjust("team2", -100)}
                    className="w-6 h-6 md:w-7 md:h-7 bg-[#FCCB97] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <MinusIcon className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Center Section - Logo */}
          <div className="flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="لمة"
              width={150}
              height={56}
              className="h-12 md:h-16 w-auto"
              priority
            />
          </div>

          {/* Right Section - Team 1 */}
          <div className="flex flex-row items-center justify-around gap-4 flex-1">
            {/* Team 1 Score Display */}
            <div className="bg-[#2F2C22] rounded-full px-6 md:px-8 py-2 shadow-md border border-[#FDD57E] w-full max-w-xs">
              <div className="flex flex-col items-center">
                {/* Team Name with Plus Button */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleScoreAdjust("team1", 100)}
                    className="w-6 h-6 md:w-7 md:h-7 bg-[#FCCB97] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <PlusIcon className="w-4 h-4 text-black" />
                  </button>
                  <div className="flex flex-col items-center justify-center px-2">
                    <span className="text-[#FCCB97] font-bold text-base md:text-lg">
                      {data?.session?.team1?.name}
                    </span>

                    {/* Score Display */}
                    <span className="text-[#FCCB97] font-bold text-3xl md:text-4xl">
                      {localScores.team1}
                    </span>
                  </div>
                  <button
                    onClick={() => handleScoreAdjust("team1", -100)}
                    className="w-6 h-6 md:w-7 md:h-7 bg-[#FCCB97] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <MinusIcon className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            </div>
            {/* Team 1 Cards */}
            {!data?.session?.playWithoutCards && (
              <div className="flex items-center gap-2">
                {data?.session?.team1?.selectedCards?.map(
                  (card: any, index: number) => {
                    const cardId = card.id || card._id;
                    const numericCardId =
                      typeof cardId === "number" ? cardId : Number(cardId);
                    const isUsed = isCardUsed(numericCardId, "team1");
                    const canUse = canUseCards("team1");
                    const isClickable =
                      currentTurn === "team1" && !isUsed && canUse;

                    return (
                      <button
                        key={`team1-card-${index}`}
                        onClick={() => handleCardClick(card, "team1")}
                        disabled={!isClickable}
                        className={`
                            relative rounded-lg transition-all duration-200
                            ${
                              isClickable
                                ? "hover:scale-110 hover:shadow-lg cursor-pointer"
                                : "opacity-50 cursor-not-allowed"
                            }
                            ${isUsed ? "grayscale" : ""}
                          `}
                        type="button"
                        title={
                          isUsed
                            ? "تم استخدام هذا الكرت"
                            : !canUse
                            ? "الكروت مقفلة"
                            : currentTurn !== "team1"
                            ? "ليس دورك"
                            : card.name
                        }
                      >
                        <Image
                          src={card.image}
                          alt={card.name || "Power Card"}
                          width={80}
                          height={80}
                          className="rounded-lg"
                        />
                        {isUsed && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Selection Modal for Lock Categories */}
      {showCardModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">
              اختر نقاط الفئة المراد قفلها
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[200, 400, 600, 800].map((points) => (
                <button
                  key={points}
                  onClick={() => {
                    handleUseCard(
                      selectedCard,
                      selectedCard.cardData,
                      selectedCard.teamName,
                      {
                        cardType: "lockCategories",
                        lockedPoints: [points],
                        targetTeam:
                          selectedCard.teamName === "team1" ? "team2" : "team1",
                      }
                    );
                    setShowCardModal(false);
                    setSelectedCard(null);
                  }}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg font-medium transition-colors"
                >
                  {points} نقطة
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowCardModal(false);
                setSelectedCard(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Counter Attack Prompt */}
      {showCounterAttackPrompt && activeEffects?.counterAttack?.available && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">
              تم استخدام كرت هجومي عليك!
            </h3>
            <p className="text-center mb-4">
              هل تريد استخدام كرت الدفاع لإلغاء الهجوم؟
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const teamName = activeEffects.counterAttack.team;
                  const counterCard = (
                    teamName === "team1"
                      ? data?.session?.team1?.selectedCards
                      : data?.session?.team2?.selectedCards
                  )?.find((c: any) => c.name === "كرت الدفاع");
                  if (counterCard) {
                    const cardData = helpingCardsData.find(
                      (c: any) => c.name === "كرت الدفاع"
                    );
                    if (cardData) {
                      handleUseCard(
                        counterCard,
                        cardData,
                        teamName as "team1" | "team2",
                        {
                          cardType: "counterAttack",
                        }
                      );
                    }
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                نعم، استخدم كرت الدفاع
              </button>
              <button
                onClick={() => {
                  setShowCounterAttackPrompt(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
              >
                لا
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Answer Correction Modal */}
      {selectedQuestion && (
        <AnswerCorrectionModal
          isOpen={showAnswerCorrectionModal}
          onClose={() => setShowAnswerCorrectionModal(false)}
          questionId={
            typeof selectedQuestion._id === "string"
              ? selectedQuestion._id
              : selectedQuestion._id.toString()
          }
          questionText={selectedQuestion.question || ""}
          sessionId={getSessionId() || ""}
          teamName={
            currentTurn === "team1"
              ? data?.session?.team1?.name || "الفريق الأول"
              : data?.session?.team2?.name || "الفريق الثاني"
          }
          categoryName={selectedQuestion.category?.name}
        />
      )}
    </main>
  );
}

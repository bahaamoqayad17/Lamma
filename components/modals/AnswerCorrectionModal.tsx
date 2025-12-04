"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { submitAnswerCorrection } from "@/actions/contact-actions";
import { toast } from "react-toastify";

interface AnswerCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionText: string;
  sessionId: string;
  teamName: string;
  categoryName?: string;
}

// Note: The server action uses getUserFromCookie() to get user info,
// so teamName and sessionId are kept for reference but not used in the saved data

export default function AnswerCorrectionModal({
  isOpen,
  onClose,
  questionId,
  questionText,
  sessionId,
  teamName,
  categoryName,
}: AnswerCorrectionModalProps) {
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCorrectAnswer("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!correctAnswer.trim()) {
      setError("يرجى إدخال الإجابة الصحيحة");
      return;
    }

    if (correctAnswer.trim().length < 3) {
      setError("الإجابة يجب أن تكون أكثر من 3 أحرف");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAnswerCorrection(
        correctAnswer.trim(),
        questionText
      );

      if (result.success) {
        toast.success(result.message || "تم إرسال تصحيح الإجابة بنجاح");
        onClose();
      } else {
        setError(result.message || "فشل إرسال تصحيح الإجابة");
        toast.error(result.message || "فشل إرسال تصحيح الإجابة");
      }
    } catch (error) {
      console.error("Error submitting answer correction:", error);
      setError("حدث خطأ أثناء إرسال تصحيح الإجابة");
      toast.error("حدث خطأ أثناء إرسال تصحيح الإجابة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تصحيح الإجابة</DialogTitle>
          <DialogDescription>
            إذا كنت تعتقد أن الإجابة المعروضة غير صحيحة، يرجى إدخال الإجابة
            الصحيحة التي تعتقدها. سيتم حفظ طلبك مع معلومات حسابك.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="question">السؤال:</Label>
            <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
              {questionText}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctAnswer">الإجابة الصحيحة المقترحة:</Label>
            <textarea
              id="correctAnswer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="أدخل الإجابة الصحيحة التي تعتقدها..."
              className="w-full px-3 py-2 border rounded-md resize-none border-gray-300 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

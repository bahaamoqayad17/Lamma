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
import { Input } from "@/components/ui/input";
import { FieldWrap } from "@/components/ui/field-wrap";
import { Label } from "@/components/ui/label";

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    lammaBalance: number,
    mafiaBalance: number
  ) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
  initialLammaBalance?: number;
  initialMafiaBalance?: number;
  userName?: string;
}

export default function BalanceModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialLammaBalance = 0,
  initialMafiaBalance = 0,
  userName = "",
}: BalanceModalProps) {
  const [lammaBalance, setLammaBalance] = useState(initialLammaBalance);
  const [mafiaBalance, setMafiaBalance] = useState(initialMafiaBalance);

  useEffect(() => {
    if (isOpen) {
      setLammaBalance(initialLammaBalance);
      setMafiaBalance(initialMafiaBalance);
    }
  }, [isOpen, initialLammaBalance, initialMafiaBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(lammaBalance, mafiaBalance);
    if (result.success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل الأرصدة - {userName}</DialogTitle>
          <DialogDescription>
            قم بتعديل أرصدة لمة و مافيا للمستخدم
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>رصيد لمة</Label>
              <FieldWrap>
                <Input
                  type="number"
                  value={lammaBalance}
                  onChange={(e) => setLammaBalance(Number(e.target.value) || 0)}
                  placeholder="أدخل رصيد Lamma"
                  min={0}
                  step="0.01"
                />
              </FieldWrap>
            </div>

            <div>
              <Label>رصيد مافيا</Label>
              <FieldWrap>
                <Input
                  type="number"
                  value={mafiaBalance}
                  onChange={(e) => setMafiaBalance(Number(e.target.value) || 0)}
                  placeholder="أدخل رصيد Mafia"
                  min={0}
                  step="0.01"
                />
              </FieldWrap>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

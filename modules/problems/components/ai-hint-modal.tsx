"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, AlertTriangle, Loader2, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIHintModalProps {
  problemId: string;
  userCode: string;
}

export const AIHintModal = ({ problemId, userCode }: AIHintModalProps) => {
  const [open, setOpen] = useState(false);
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);

  const fetchHint = async (level: number) => {
    setLoading(true);
    setError(null);
    setHintLevel(level);

    try {
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          userCode,
          hintLevel: level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch hint.");
      }

      setHint(data.hint);
      if (data.remainingTokens !== undefined) {
        setRemainingTokens(data.remainingTokens);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state on close
      setHint(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all"
        >
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>AI Hint</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                AI Coding Mentor
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Get progressive, policy-guided hints without spoiling the direct solution.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Level Selectors */}
        <div className="grid grid-cols-3 gap-2 my-2">
          {[
            { level: 1, label: "Subtle Nudge", desc: "General direction" },
            { level: 2, label: "Algorithmic", desc: "Data structure tip" },
            { level: 3, label: "Edge Case", desc: "Bug / boundary check" },
          ].map((item) => (
            <button
              key={item.level}
              onClick={() => fetchHint(item.level)}
              disabled={loading}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                hintLevel === item.level && hint
                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Lvl {item.level}
                </span>
                {hintLevel === item.level && loading && (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {item.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Hint Output Container */}
        <div className="min-h-[120px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-center relative">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              <span className="text-xs font-medium">Analyzing your code & policy guards...</span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 text-rose-500 text-xs p-1">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : hint ? (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Level {hintLevel} Hint
                </Badge>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {hint}
              </p>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 dark:text-slate-500">
              Select a hint level above to analyze your current code approach.
            </div>
          )}
        </div>

        {/* Remaining Tokens Budget Indicator */}
        {remainingTokens !== null && (
          <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <KeyRound className="w-3 h-3" />
            <span>Tokens remaining today: {remainingTokens}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
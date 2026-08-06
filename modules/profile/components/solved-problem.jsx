import React from 'react';
import { Trophy, CheckCircle, Calendar, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from "next/link";

const SolvedProblems = ({ solvedProblems = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="mb-8 border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl">
            <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Solved Problems
          </CardTitle>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-medium rounded-full px-2.5">
            {solvedProblems.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {solvedProblems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
              No Problems Solved Yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start solving problems to see your achievements here!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {solvedProblems.map((item) => {
              // Extract target problem ID and Title safely
              const problemId = item.problemId || item.problem?.id || item.id;
              const problemTitle =
                item.problem?.title || item.title || `Problem #${problemId?.slice(0, 8)}`;

              return (
                <Link
                  key={item.id || problemId}
                  href={`/problem/${problemId}`}
                  className="block group"
                >
                  <Card className="h-full border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all duration-200 rounded-xl shadow-none group-hover:shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-950/80 rounded-full p-2 group-hover:scale-105 transition-transform">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {problemTitle}
                            </h3>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mt-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SolvedProblems;
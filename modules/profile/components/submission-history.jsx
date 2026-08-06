import React from 'react';
import { Code, Clock, MemoryStick as Memory, CheckCircle2, Cpu, XCircle, AlertCircle, ChevronDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from "@/components/ui/scroll-area";

const SubmissionsHistory= ({ submissions }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Wrong Answer':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted':
        return 'success';
      case 'Wrong Answer':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseMetrics = (metricString) => {
    try {
      const parsed = JSON.parse(metricString);
      return Array.isArray(parsed) ? parsed[0] : metricString;
    } catch {
      return metricString;
    }
  };
  const parseAndAverage = (val, unit = "") => {
  if (!val) return "N/A";

  let rawArray = [];

  // Handle stringified JSON array: '["3244 KB", "3244 KB", "3236 KB"]'
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try {
      rawArray = JSON.parse(val);
    } catch {
      rawArray = [val];
    }
  } else if (Array.isArray(val)) {
    rawArray = val;
  } else {
    rawArray = [val];
  }

  // Extract clean numerical values out of each entry (e.g., "3244 KB" -> 3244)
  const numbers = rawArray
    .map((item) => {
      if (typeof item === "number") return item;
      if (!item) return null;
      const match = String(item).match(/[\d.]+/);
      return match ? parseFloat(match[0]) : null;
    })
    .filter((num) => num !== null && !isNaN(num));

  if (numbers.length === 0) return "N/A";

  // Calculate Average
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / numbers.length;

  return `${avg.toFixed(unit === "s" ? 3 : 1)} ${unit}`;
};

const formatMemory = (mem) => parseAndAverage(mem, "KB");
const formatTime = (t) => parseAndAverage(t, "s");
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card className="w-full border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300 text-left">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Submission History
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
          Your previous submissions ordered by most recent
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[420px] pr-4">
          <div className="space-y-3">
            {sortedSubmissions.length > 0 ? (
              sortedSubmissions.map((submission) => {
                const isAccepted = submission.status === "Accepted" || submission.status === "ACCEPTED";
                return (
                  <Card key={submission.id} className="border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/50 shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-all rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <Badge className="bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-medium px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Accepted
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-100/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-medium px-2.5 py-0.5 rounded-full">
                              <XCircle className="mr-1.5 h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                              {submission.status || "Failed"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <Calendar className="h-3 w-3" />
                          {formatDate(submission.createdAt)}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md">
                            <Code className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Language</p>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{submission.language}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md">
                            <Cpu className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Memory</p>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{formatMemory(submission.memory)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Time</p>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{formatTime(submission.time)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                No submissions found.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SubmissionsHistory;
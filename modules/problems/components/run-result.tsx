"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CpuIcon,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
} from "lucide-react";

export interface TestResult {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  status: {
    id: number; // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit, 11 = NZEC, etc.
    description: string;
  };
  time?: string | number | null;
  memory?: number | null;
  input?: string;
  expectedOutput?: string;
}

export interface RunResultProps {
  runData: {
    language: string;
    isSuccess: boolean;
    executedAt?: string | Date;
    results: TestResult[];
  };
}

export const RunResultPage = ({ runData }: RunResultProps) => {
  const { language, isSuccess, executedAt, results = [] } = runData;

  // Safe calculation for average memory (KB)
  const memoryValues = results
    .map((r) => (r.memory ? Number(r.memory) : 0))
    .filter((m) => m > 0);
  const averageMemory =
    memoryValues.length > 0
      ? memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length
      : 0;

  // Safe calculation for average time (seconds)
  const timeValues = results
    .map((r) => {
      if (!r.time) return 0;
      return typeof r.time === "string"
        ? parseFloat(r.time.replace("s", "").trim())
        : Number(r.time);
    })
    .filter((t) => !isNaN(t) && t > 0);
  const averageTime =
    timeValues.length > 0
      ? timeValues.reduce((a, b) => a + b, 0) / timeValues.length
      : 0;

  const passedCasesCount = results.filter(
    (r) => r.status?.id === 3
  ).length;
  const isOverallSuccess = results.length > 0 && passedCasesCount === results.length;

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto p-4">
      {/* Top Overview Card */}
      <Card className="w-full border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Run Execution Results
              </CardTitle>
              <Badge
                variant="outline"
                className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              >
                {passedCasesCount} / {results.length} Passed
              </Badge>
            </div>

            {isOverallSuccess ? (
              <Badge className="bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-medium px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Accepted
              </Badge>
            ) : (
              <Badge className="bg-rose-100/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-medium px-2.5 py-0.5 rounded-full">
                <XCircle className="mr-1.5 h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                Failed
              </Badge>
            )}
          </div>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Executed at {new Date(executedAt || Date.now()).toLocaleString()}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Language */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Language
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {language}
                </p>
              </div>
            </div>

            {/* Memory */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <CpuIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Memory (avg)
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {averageMemory.toFixed(2)} KB
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Time (avg)
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {averageTime.toFixed(3)} s
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per Testcase Breakdown */}
      {results.length > 0 && (
        <Card className="w-full border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Terminal className="w-4 h-4 text-indigo-500" />
              TestCase Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="case-0" className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-slate-100/70 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                {results.map((res, idx) => {
                  const passed =
                    res.status?.id === 3 ||
                    res.status?.description === "Accepted";
                  return (
                    <TabsTrigger
                      key={idx}
                      value={`case-${idx}`}
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-lg text-xs font-medium px-3 py-1.5 flex items-center gap-2"
                    >
                      {passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      Test Case #{idx + 1}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {results.map((res, idx) => {
                const passed =
                  res.status?.id === 3 || res.status?.description === "Accepted";
                const timeSec = res.time
                  ? typeof res.time === "string"
                    ? res.time
                    : `${res.time} s`
                  : "0.00 s";

                return (
                  <TabsContent
                    key={idx}
                    value={`case-${idx}`}
                    className="space-y-4 pt-4 mt-0 focus-visible:outline-none"
                  >
                    {/* Status Badge + Metadata */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Status:
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            passed
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                          }
                        >
                          {res.status?.description || "Unknown"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span>Time: {timeSec}</span>
                        <span>Memory: {res.memory || 0} KB</span>
                      </div>
                    </div>

                    {/* Inputs & Outputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {res.input !== undefined && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                            Input
                          </p>
                          <pre className="p-3 text-xs font-mono bg-slate-950 text-slate-100 rounded-lg overflow-x-auto border border-slate-800 min-h-16">
                            {res.input || "N/A"}
                          </pre>
                        </div>
                      )}

                      {res.expectedOutput !== undefined && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                            Expected Output
                          </p>
                          <pre className="p-3 text-xs font-mono bg-slate-950 text-slate-100 rounded-lg overflow-x-auto border border-slate-800 min-h-16">
                            {res.expectedOutput || "N/A"}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Standard Output */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Actual Output (stdout)
                      </p>
                      <pre className="p-3 text-xs font-mono bg-slate-950 text-slate-100 rounded-lg overflow-x-auto border border-slate-800 min-h-16">
                        {res.stdout ? res.stdout.trim() : "<No Output>"}
                      </pre>
                    </div>

                    {/* Standard Error / Compilation Errors */}
                    {(res.stderr || res.compile_output) && (
                      <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 space-y-2">
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4" />
                          Execution Logs / Errors
                        </div>
                        <pre className="text-xs font-mono text-rose-300 whitespace-pre-wrap overflow-x-auto">
                          {res.compile_output || res.stderr}
                        </pre>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
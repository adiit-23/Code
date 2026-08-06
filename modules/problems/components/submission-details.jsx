import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CpuIcon, Code, CheckCircle2, XCircle } from "lucide-react";

export const SubmissionDetails = ({ submission }) => {
  const isSuccess = submission.status === "Accepted";
  const averageMemory = submission.memory ? 
    JSON.parse(submission.memory).reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / 
    JSON.parse(submission.memory).length : 0;
    
  const averageTime = submission.time ? 
    JSON.parse(submission.time)
      .map(t => parseFloat(t.replace(" s", "")))
      .reduce((a, b) => a + b, 0) / 
    JSON.parse(submission.time).length : 0;

  return (
    <Card className="w-full border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Submission Details
          </CardTitle>
          {isSuccess ? (
            <Badge className="bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-medium px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Success
            </Badge>
          ) : (
            <Badge className="bg-rose-100/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-medium px-2.5 py-0.5 rounded-full">
              <XCircle className="mr-1.5 h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              Failed
            </Badge>
          )}
        </div>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Submitted at {new Date(submission?.createdAt || Date.now()).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Code className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Language</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{submission?.language}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <CpuIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Memory (avg)</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{averageMemory.toFixed(2)} KB</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time (avg)</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{averageTime.toFixed(3)} s</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
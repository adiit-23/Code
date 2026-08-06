import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, Cpu, Code, Calendar } from "lucide-react";

export const SubmissionHistory = ({ submissions = [] }) => {
  if (!submissions.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>No submissions yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    try {
      const memoryArray = JSON.parse(memory);
      const avgMemory = memoryArray.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / memoryArray.length;
      return `${avgMemory.toFixed(2)} KB`;
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    try {
      const timeArray = JSON.parse(time);
      const avgTime = timeArray
        .map(t => parseFloat(t.replace(" s", "")))
        .reduce((a, b) => a + b, 0) / timeArray.length;
      return `${avgTime.toFixed(3)} s`;
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300 text-left">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Submission History
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
          Your previous submissions for this problem
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {submissions.length > 0 ? (
              submissions.map((submission) => {
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
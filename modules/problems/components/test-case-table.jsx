import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
export const dynamic = "force-dynamic";
export const TestCaseTable = ({ testCases }) => {
  return (
    <div className="w-full rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden transition-colors duration-300">
      <Table>
        <TableCaption className="text-xs text-slate-500 dark:text-slate-400 my-3">
          Test Case Results Execution Details
        </TableCaption>
        <TableHeader className="bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200/70 dark:border-slate-800">
          <TableRow>
            <TableHead className="w-[100px] text-slate-500 dark:text-slate-400">Case #</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400">Memory</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400">Time</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400">Output</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400">Expected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testCases.length > 0 ? (
            testCases.map((testCase, index) => {
              const isPassed = testCase.passed || testCase.status === "PASSED" || testCase.status === "Accepted";
              return (
                <TableRow 
                  key={testCase.id || index} 
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Case #{index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isPassed ? (
                        <Badge className="bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-medium px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-medium px-2.5 py-0.5 rounded-full">
                          <XCircle className="mr-1.5 h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {(testCase.memory)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {(testCase.time)}
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <code className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-mono block truncate border border-slate-200/50 dark:border-slate-800/50">
                      {testCase.stdout ?? testCase.output ?? "N/A"}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <code className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-mono block truncate border border-slate-200/50 dark:border-slate-800/50">
                      {testCase.expected ?? "N/A"}
                    </code>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                No test case results available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
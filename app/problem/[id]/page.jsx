'use client';

import { useTheme } from 'next-themes';
import Editor from '@monaco-editor/react';
import { executeOnly, executeAndSubmit, getAllSubmissionByCurrentUserForProblem, getProblemById } from '@/modules/problems/actions';
import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RunResultPage } from '@/modules/problems/components/run-result';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Send, Code, FileText, Lightbulb, Trophy, ArrowLeft, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { getJudge0laguageId } from '@/lib/judge0';
import { toast } from 'sonner';
import { SubmissionHistory } from '@/modules/problems/components/submission-history';
import Link from 'next/link';
import { AIHintModal } from '@/modules/problems/components/ai-hint-modal';

export const dynamic = "force-dynamic";

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'EASY':
      return 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    case 'MEDIUM':
      return 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    case 'HARD':
      return 'bg-rose-100/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  }
};

const ProblemIdPage = ({ params }) => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('JAVASCRIPT');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [executionResponse, setExecutionResponse] = useState(null);
  const { theme, resolvedTheme } = useTheme();
  const editorRef = useRef(null); // 1. Create an Editor reference
  // Resolves system or explicit light/dark setting for Monaco Editor
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const editorTheme = currentTheme === 'dark' ? 'vs-dark' : 'light';

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const resolvedParams = await params;
        const problemData = await getProblemById(resolvedParams.id);
        if (problemData.success) {
          setProblem(problemData.data);
          setCode(problemData.data.codeSnippets[selectedLanguage] || '');
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [params]);

  useEffect(() => {
    const fetchSubmissionHistory = async () => {
      try {
        const resolvedParams = await params;
        const submissionHistory = await getAllSubmissionByCurrentUserForProblem(resolvedParams.id);
        if (submissionHistory.success) {
          setSubmissionHistory(submissionHistory.data);
        }
      } catch (error) {
        console.error('Error fetching submission history:', error);
      }
    };

    fetchSubmissionHistory();
  }, [params]);

  useEffect(() => {
    if (problem && problem.codeSnippets[selectedLanguage]) {
      setCode(problem.codeSnippets[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // 2. Helper to always retrieve the fresh live code string
  const getLiveCode = () => {
    if (editorRef.current) {
      return editorRef.current.getValue();
    }
    return code;
  };

  const getExecutionPayload = () => {
    return {
      language_id: getJudge0laguageId(selectedLanguage),
      stdin: problem.testCases.map((tc) => tc.input),
      expected_outputs: problem.testCases.map((tc) => tc.output)
    };
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const currentCode = getLiveCode();
      const { language_id, stdin, expected_outputs } = getExecutionPayload();
      const res = await executeOnly(currentCode, language_id, stdin, expected_outputs);
      console.log("EXECUTION RESPONSE FROM SERVER:", res);
      setExecutionResponse(res);
      
      if (res.success) {
        toast.success("Code ran successfully!");
      } else {
        toast.error(res.error || "Failed to run code.");
      }
    } catch (error) {
      console.log("Error running code", error);
      toast.error("Error running code.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const currentCode = getLiveCode();
      const { language_id, stdin, expected_outputs } = getExecutionPayload();

      // 1. Call server action
      const res = await executeAndSubmit(currentCode, language_id, stdin, expected_outputs, problem.id);
      
      console.log("SUBMIT ACTION RESPONSE:", res); // Debug log

      if (res && res.success) {
        setExecutionResponse(res);

        if (res.allPassed) {
          toast.success("Code submitted and accepted!");
        } else {
          toast.error("Submission saved: Some test cases failed.");
        }

        // 2. IMMEDIATELY RE-FETCH SUBMISSION HISTORY FROM DATABASE
        const resolvedParams = await params;
        const historyRes = await getAllSubmissionByCurrentUserForProblem(resolvedParams.id);
        
        if (historyRes && historyRes.success) {
          setSubmissionHistory(historyRes.data);
        }
      } else {
        toast.error(res?.error || "Failed to save submission to database.");
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      toast.error("An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format Judge0 / server execution response for <RunResultPage />
  const formatRunData = () => {
    if (!executionResponse) return null;

    let rawPayload = executionResponse;
    if (typeof executionResponse === "string") {
      try {
        const cleanedJson = executionResponse.replace(/^[0-9]+:/, "").trim();
        rawPayload = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("Failed to parse stringified response:", e);
      }
    }

    const resultsList =
      rawPayload.detailedResults ||
      rawPayload.results ||
      rawPayload.submission?.testCases ||
      rawPayload.testCases ||
      [];

    // --- REPLACED THIS SECTION WITH YOUR STRICT CHECK CODE ---
    const formattedResults = resultsList.map((item, idx) => {
      const origTestCase = problem?.testCases?.[idx] || {};

      const actualOutput = item.stdout ?? item.actualOutput ?? "";
      const expectedOutput = item.expected ?? item.expectedOutput ?? origTestCase.output ?? "";

      // 1. STRICT CHECK: Trust item.passed explicitly from your backend calculation
      // DO NOT trust item.status alone, as Judge0 returns "Accepted" for non-crashing Wrong Answers!
      const isPassed = item.passed === true;

      return {
        stdout: actualOutput,
        stderr: item.stderr ?? item.error ?? null,
        compile_output: item.compile_output ?? null,
        status: {
          id: isPassed ? 3 : 4,
          description: isPassed ? "Accepted" : "Wrong Answer",
        },
        time: item.time ?? "0.00 s",
        memory: item.memory ? parseInt(String(item.memory)) : 0,
        input: item.input ?? origTestCase.input ?? "",
        expectedOutput: expectedOutput,
      };
    });
    // --- END REPLACEMENT ---

    const isOverallSuccess =
      formattedResults.length > 0 &&
      formattedResults.every((r) => r.status.id === 3);

    return {
      language: selectedLanguage,
      isSuccess: isOverallSuccess,
      executedAt: new Date(),
      results: formattedResults,
    };
  };
  const formattedRunData = formatRunData();

  if (!problem) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-rose-50/20 dark:bg-slate-950'>
        <Loader2 className='animate-spin size-8 text-indigo-500' />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/30 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6 pt-24">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-5">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Link href="/problem">
                <Button variant="outline" size="icon" className="rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/50">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{problem?.title}</h1>
              <Badge className={cn('font-medium px-2.5 py-0.5 rounded-full border', getDifficultyColor(problem?.difficulty))}>
                {problem?.difficulty}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {problem?.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/30">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <ModeToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description */}
          <div className="space-y-6">
            <Card className="border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                  Problem Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{problem?.description}</p>
                  
                  {/* Examples */}
                  <div>
                    <h3 className="font-semibold text-md mb-3 text-slate-900 dark:text-slate-100">Example:</h3>
                    {problem?.examples[selectedLanguage] && (
                      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-xl space-y-3">
                        <div>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400 text-sm">Input: </span>
                          <code className="text-sm bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-2 py-0.5 rounded font-mono">
                            {problem?.examples[selectedLanguage].input}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">Output: </span>
                          <code className="text-sm bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-2 py-0.5 rounded font-mono">
                            {problem?.examples[selectedLanguage].output}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-sm text-slate-600 dark:text-slate-400">Explanation: </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{problem?.examples[selectedLanguage]?.explanation}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Constraints */}
                  <div>
                    <h3 className="font-semibold text-md mb-3 text-slate-900 dark:text-slate-100">Constraints:</h3>
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-xl">
                      <pre className="text-sm text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap">{problem?.constraints}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Submissions, Editorial, Hints */}
            <Card className="border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
              <CardContent className="p-3">
                <Tabs defaultValue="submissions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100/70 dark:bg-slate-950 rounded-lg">
                    <TabsTrigger value="submissions" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400">
                      <Trophy className="h-4 w-4" />
                      Submissions
                    </TabsTrigger>
                    <TabsTrigger value="editorial" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400">
                      <FileText className="h-4 w-4" />
                      Editorial
                    </TabsTrigger>
                    <TabsTrigger value="hints" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400">
                      <Lightbulb className="h-4 w-4" />
                      Hints
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="submissions" className="p-4">
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                      <SubmissionHistory submissions={submissionHistory} />
                    </div>
                  </TabsContent>
                  <TabsContent value="editorial" className="p-4">
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      {problem.editorial ? problem.editorial : 'Editorial not available yet.'}
                    </div>
                  </TabsContent>
                  <TabsContent value="hints" className="p-4">
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      {problem.hints ? problem.hints : 'No hints available for this problem.'}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Code Editor and Test Cases / Results */}
          <div className="space-y-6">
            {/* Code Editor */}
            <Card className="border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Code className="h-5 w-5" />
                    Code Editor
                  </CardTitle>

                  {/* AI Hint Trigger Button & Language Selector */}
                  <div className="flex items-center gap-3">
                    <AIHintModal problemId={problem.id} userCode={code} />

                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-36 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                        <SelectItem value="PYTHON">Python</SelectItem>
                        <SelectItem value="CPP">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <Editor
                    height="400px"
                    language={selectedLanguage.toLowerCase() === 'javascript' ? 'javascript' : selectedLanguage.toLowerCase()}
                    value={code}
                    onMount={handleEditorDidMount}
                    onChange={(value) => setCode(value || '')}
                    theme={editorTheme}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 15,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      padding: { top: 12, bottom: 12 }
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-4 justify-end">
                  <Button
                    onClick={handleRun}
                    disabled={isRunning || isSubmitting}
                    variant="outline"
                    className="flex items-center gap-2 rounded-full border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current text-emerald-500" />}
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isRunning}
                    className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Cases Panel */}
            <Card className="border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
                <CardTitle className="text-base text-slate-800 dark:text-slate-200">Test Cases</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Verify your solution inputs and expected outputs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-48">
                  <div className="space-y-3 pr-3">
                    {problem.testCases.map((testCase, index) => (
                      <div key={index} className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/40">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Test Case {index + 1}</div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 min-w-16">Input:</span>
                            <code className="bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                              {testCase.input}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 min-w-16">Expected:</span>
                            <code className="bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                              {testCase.output}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Execution & Run Results View */}
            {formattedRunData && (
              <div className="mt-6">
                <RunResultPage runData={formattedRunData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemIdPage;
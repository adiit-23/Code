"use server";
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from "next/cache";
import { getLanguageName,submitBatch,pollBatchResults, sanitizeCode } from '@/lib/judge0';
import { NextResponse } from "next/server";
import { getCurrentStreak } from "@/lib/streak";

export const getAllProblems = async () => {
  try {
    const user = await currentUser();
    const data = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    });
  const problems = await prisma.problem.findMany({
  include: {
    // 1. First relation
    solvedBy: {
      where: {
        userId: data.id,
      },
    },
    // 2. Second relation (No extra "include:" keyword needed here!)
    problemsPlaylists: {
      where: {
        playlist: {
          userId: data.id // ONLY includes it if the playlist belongs to THIS user
        }
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});

    return { success: true, data: problems };
  } catch (error) {
    console.error("❌ Error fetching problems:", error);
    return { success: false, error: "Failed to fetch problems" };
  }
};

// Get a single problem by ID
export const getProblemById = async(id) => {
    try {
        const problem = await prisma.problem.findUnique({
            where: {
                id: id,
            },
        });
        return { success: true, data: problem };
    } catch (error) {
        console.error("❌ Error fetching problem:", error);
        return { success: false, error: "Failed to fetch problem" };
    }
}

// Get all problems solved by the current user
export const getAllProblemSolveByUser = async() => {
    try {
        const user = await currentUser();
        const userId = await prisma.user.findUnique({
            where: {
                clerkId: user.id,
            },
            select: {
                id: true,
            },
        });

        const problems = await prisma.problem.findMany({
            include: {
                solvedBy: {
                  where: {
                    userId: userId.id,
                  },
                },
            },
        });
        return { success: true, data: problems };
    } catch (error) {
        console.error("❌ Error fetching solved problems:", error);
        return { success: false, error: "Failed to fetch solved problems" };
    }
}

// Delete a problem (admin only)
export const deleteProblem = async (problemId) => {
    try {
        const user = await currentUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        // Verify if user is admin
        const prismaUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: { role: true }
        });

        if (prismaUser?.role !== UserRole.ADMIN) {
            throw new Error("Only admins can delete problems");
        }

        await prisma.problem.delete({
            where: { id: problemId }
        });

        revalidatePath("/problem");
        return { success: true, message: "Problem deleted successfully" };
    } catch (error) {
        console.error("Error deleting problem:", error);
        return { success: false, error: error.message || "Failed to delete problem" };
    }
}

// Create a new playlist
export const createPlaylist = async (title, description) => {
    try {
        const user = await currentUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const prismaUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!prismaUser) {
            throw new Error("User not found");
        }

        const playlist = await prisma.playlist.create({
            data: {
                title,
                description,
                userId: prismaUser.id
            }
        });

        revalidatePath("/problem");
        return { success: true, data: playlist };
    } catch (error) {
        console.error("Error creating playlist:", error);
        return { success: false, error: error.message || "Failed to create playlist" };
    }
}

// Add a problem to a playlist
export const addProblemToPlaylist = async (problemId, playlistId) => {
    try {
        const user = await currentUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const prismaUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!prismaUser) {
            throw new Error("User not found");
        }

        // Verify playlist belongs to user
        const playlist = await prisma.playlist.findFirst({
            where: {
                id: playlistId,
                userId: prismaUser.id
            }
        });

        if (!playlist) {
            throw new Error("Playlist not found or unauthorized");
        }

        await prisma.playlistProblem.create({
            data: {
                playlistId,
                problemId
            }
        });

        revalidatePath("/problem");
        return { success: true, message: "Problem added to playlist" };
    } catch (error) {
        console.error("Error adding problem to playlist:", error);
        return { success: false, error: error.message || "Failed to add problem to playlist" };
    }
}


export const executeOnly = async (source_code, language_id, stdin, expected_outputs) => {
  if (
    !Array.isArray(stdin) ||
    stdin.length === 0 ||
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
    return { success: false, error: "Invalid test cases" };
  }

  try {
   const cleanedSource = sanitizeCode(source_code || "");

const submissions = stdin.map((input) => ({
  source_code: cleanedSource,
  language_id: Number(language_id),
  stdin: String(input).trim(),
}));

    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);

    const results = await pollBatchResults(tokens);

    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      // Fallback to "" instead of null so it compares strings to strings perfectly
      const stdout = result.stdout ? String(result.stdout).trim() : "";
      const expected_output = expected_outputs[i] ? String(expected_outputs[i]).trim() : "";

      const passed = stdout === expected_output;
      if (!passed) allPassed = false;

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    return { 
      success: true, 
      allPassed, 
      detailedResults 
    };
  } catch (error) {
    console.error("🔥 EXECUTION ERROR:", error.message || error);
    return { success: false, error: "Code execution failed" };
  }
};


/**
 * 2. EXECUTION + SUBMISSION
 * Validates the user, executes the code, and saves the submission/results to Prisma.
 * Useful for a "Submit" button.
 */
export const executeAndSubmit = async (source_code, language_id, stdin, expected_outputs, id) => {
  try {
    const user = await currentUser();

    // 1. Guard against unauthenticated requests
    if (!user || !user.id) {
      return { success: false, error: "Unauthorized user" };
    }

    const prismaUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!prismaUser) {
      return { success: false, error: "User not found in database" };
    }

    // 2. Run code execution via executeOnly
    const executionData = await executeOnly(source_code, language_id, stdin, expected_outputs);

    if (!executionData.success) {
      return { success: false, error: executionData.error || "Execution failed" };
    }

    const { detailedResults = [] } = executionData;

    // Helper to normalize strings and prevent space formatting discrepancies in DB
    const normalize = (str) => (str || "").replace(/\s+/g, "").trim();

    // Re-verify that every test case actually passed
    const allPassed =
      detailedResults.length > 0 &&
      detailedResults.every((res) => {
        const statusOk = res.status === "Accepted" || res.status?.id === 3 || res.passed === true;
        const outputMatches = normalize(res.stdout) === normalize(res.expected);
        return statusOk || outputMatches;
      });

    // 3. Streak & Date Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSub = prismaUser.lastSubmissionDate ? new Date(prismaUser.lastSubmissionDate) : null;
    if (lastSub) lastSub.setHours(0, 0, 0, 0);

    const submittedToday = lastSub?.getTime() === today.getTime();
    const currentStreak = getCurrentStreak(prismaUser);

    // 4. Perform atomic transaction
    const submissionId = await prisma.$transaction(async (tx) => {
      // Create Main Submission Record
      const newSubmission = await tx.submission.create({
        data: {
          userId: prismaUser.id,
          problemId: id,
          sourceCode: source_code,
          language: getLanguageName(language_id),
          stdin: Array.isArray(stdin) ? stdin.join("\n") : String(stdin || ""),
          stdout: JSON.stringify(detailedResults.map((r) => r.stdout || "")),
          stderr: detailedResults.some((r) => r.stderr)
            ? JSON.stringify(detailedResults.map((r) => r.stderr || ""))
            : null,
          compileOutput: detailedResults.some((r) => r.compile_output)
            ? JSON.stringify(detailedResults.map((r) => r.compile_output || ""))
            : null,
          status: allPassed ? "Accepted" : "Wrong Answer",
          memory: JSON.stringify(detailedResults.map((r) => r.memory || "0")),
          time: JSON.stringify(detailedResults.map((r) => r.time || "0s")),
        },
      });

      // Save detailed test case results
      const testCaseResults = detailedResults.map((result) => ({
        submissionId: newSubmission.id,
        testCase: result.testCase,
        passed: Boolean(result.passed || result.status === "Accepted"),
        stdout: result.stdout || "",
        expected: result.expected || "",
        stderr: result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status === "Accepted" || result.passed ? "Accepted" : "Wrong Answer",
        memory: String(result.memory || "0"),
        time: String(result.time || "0s"),
      }));

      await tx.testCaseResult.createMany({ data: testCaseResults });

      // If all tests passed, update problem solved status & user streak
      if (allPassed) {
        await tx.problemSolved.upsert({
          where: {
            userId_problemId: { userId: prismaUser.id, problemId: id },
          },
          update: {},
          create: { userId: prismaUser.id, problemId: id },
        });

        if (!submittedToday) {
          await tx.user.update({
            where: { id: prismaUser.id },
            data: {
              streak: currentStreak + 1,
              lastSubmissionDate: new Date(),
            },
          });
        }
      }

      return newSubmission.id;
    });

    // 5. Fetch submission record with test cases
    const submissionWithTestCases = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { testCases: true },
    });

    return {
      success: true,
      allPassed,
      submission: submissionWithTestCases,
      detailedResults,
    };
  } catch (error) {
    console.error("🔥 DB/SUBMISSION ERROR:", error.message || error);
    return {
      success: false,
      error: error.message || "Failed to process submission",
    };
  }
};
export const getAllSubmissionByCurrentUserForProblem = async (problemId) => {
    const user = await currentUser();
    const userId = await prisma.user.findUnique({
        where: {
            clerkId: user.id,
        },
        select: {
            id: true,
        },
    });
    const submissions = await prisma.submission.findMany({
        where: {
            problemId: problemId,
            userId: userId.id,
        },
        include: {
            problem: {
            select: {
                id: true,
                title: true,
            },
            },
        },
        orderBy: {
                    createdAt: "desc",
        },
        });
    return { success: true, data: submissions };
}
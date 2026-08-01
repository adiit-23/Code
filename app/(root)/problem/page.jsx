import { getAllProblems } from '@/modules/problems/actions';
import ProblemsTable from "@/modules/problems/components/problem-table"
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const ProblemsPage = async () => {
  try {
    const user = await currentUser();
    let dbUser = null;
    
    if (user) {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        select: { id: true, role: true }
      });
    }

    const result = await getAllProblems();

    if (!result.success) {
      console.error("Failed:", result.error);
      // ✅ FIX 1: Return valid JSX instead of 'undefined'
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-destructive">Error loading problems.</p>
        </div>
      );
    }

    const problemsList = result.data;

    return (
      <div className="container mx-auto py-32">
        <ProblemsTable problems={problemsList} user={dbUser ?? undefined} />
      </div>
    );
    
  } catch (error) {
    // ✅ FIX 2: Intercept thrown plain objects ({clientVersion: "7.9.1"})
    console.error("CRITICAL ERROR IN ProblemsPage:", error);
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">An unexpected system error occurred.</p>
      </div>
    );
  }
}

export default ProblemsPage;
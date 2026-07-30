import { getAllProblems } from '@/modules/problems/actions';
import ProblemsTable from "@/modules/problems/components/problem-table"
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const ProblemsPage = async () => {
  const user = await currentUser();
  let dbUser = null;
  
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true }
    });
  }

  const { data: problems, error } = await getAllProblems();
  const problemsList = problems ?? [];

  console.log(problemsList);
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error loading problems: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-32">
      <ProblemsTable problems={problemsList} user={dbUser} />
    </div>
  );
}

export default ProblemsPage

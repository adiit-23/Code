// app/sign-in/[[...sign-in]]/page.jsx
import { SignIn } from "@clerk/nextjs";
export const dynamic = "force-dynamic";
export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-rose-50/50 dark:bg-slate-950 px-4">
      <SignIn />
    </div>
  );
}
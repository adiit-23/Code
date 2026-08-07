// app/sign-up/[[...sign-up]]/page.jsx
import { SignUp } from "@clerk/nextjs";
export const dynamic = "force-dynamic";
export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-rose-50/50 dark:bg-slate-950 px-4">
      <SignUp />
    </div>
  );
}
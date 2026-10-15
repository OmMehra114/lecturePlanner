import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <SignUp />
    </div>
  );
}

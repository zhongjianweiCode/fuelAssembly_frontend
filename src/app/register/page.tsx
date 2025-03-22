import { RegisterForm } from "@/components/RegisterForm";

export default function Page() {
  return (
    <div className="grid min-h-svh w-full md:grid-cols-2">
      <div className="hidden bg-gradient-to-r from-blue-300 to-purple-900 md:block" />
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-md space-y-8">          
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

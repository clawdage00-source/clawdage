import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | CLAWDAGE",
  description: "Sign in to your CLAWDAGE account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#050505] px-6 py-12">
      
      <div className="w-full max-w-[24rem] flex flex-col items-center">
        
        {/* --- BRANDING SECTION --- */}
        <div className="flex flex-col items-center mb-10 text-center">
          
          {/* 1. The Cloud Icon (logo.png) */}
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-[#3333FF] blur-2xl opacity-20 animate-pulse"></div>
            <img 
              src="/logo.png" 
              alt="CLAWDAGE Icon"
              className="relative z-10 w-full h-full object-contain"
            />
          </div>
          
          {/* 2. The Brand Name Image (named-logo.png) */}
          <div className="h-10 mb-2">
            <img 
              src="/named-logo.png" 
              alt="CLAWDAGE"
              className="h-full w-auto object-contain dark:invert" 
            />
            {/* dark:invert will make the black text white if the user is in Dark Mode */}
          </div>
          
          <p className="mt-2 text-[15px] font-medium text-zinc-500 dark:text-zinc-400">
            Next-gen Cloud Solutions
          </p>
        </div>

        {/* --- LOGIN FORM --- */}
        <div className="w-full">
          <LoginForm />
        </div>

      </div>
    </div>
  );
}
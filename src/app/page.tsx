"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/forms/loginForm";
import { RegistrationForm } from "@/components/forms/registrationForm";
import { ResetPasswordForm } from "@/components/forms/resetPasswordForm";
import Image from "next/image";
import { Zap, Brain, Rocket, ArrowRight, Sparkles, Users, Trophy, ChevronDown } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<"intro" | "login" | "register" | "resetPassword">("intro");

  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background layers with Phoenix color theme */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-900/20 via-black to-red-900/20 z-0"></div>
      
      {/* Animated grid pattern with Phoenix colors */}
      <div className="fixed inset-0 opacity-20 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.1)_1px,transparent_1px)] bg-[size:80px_80px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,115,22,0.1)_1px,transparent_1px)] bg-[size:80px_80px] animate-pulse"></div>
      </div>

      {/* Floating orbs with Phoenix color palette */}
      <div className="fixed top-10 left-5 w-48 h-48 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-3xl opacity-15 animate-float z-0"></div>
      <div className="fixed bottom-10 right-5 w-64 h-64 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full blur-3xl opacity-15 animate-float-delayed z-0"></div>
      <div className="fixed top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-3xl opacity-10 animate-pulse z-0"></div>

      {/* Navigation Header with Round Logo */}
      <div className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-black/50 border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Round logo container */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 p-0.5 shadow-lg shadow-orange-500/25">
                <div className="w-full h-full rounded-full overflow-hidden bg-black/20 backdrop-blur-sm">
                  <Image
                    src="/team-logo-1.jpg"
                    alt="Phoenix Team Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  PHOENIX
                </h2>
                <p className="text-xs text-gray-400">AI Resume Builder</p>
              </div>
            </div>
            {view === "intro" && (
              <button
                onClick={() => setView("login")}
                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-lg shadow-orange-500/25"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 pt-20">
        {view === "intro" && (
          <div className="min-h-screen flex flex-col justify-center items-center px-6 py-20">
            <div className="text-center max-w-6xl mx-auto animate-fade-in-up">
              {/* Launch badge with Phoenix colors */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-6 py-3 mb-12 backdrop-blur-sm animate-glow">
                <Rocket className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium text-orange-300"> Now Launching • Join the Beta</span>
                <Sparkles className="w-5 h-5 text-red-400" />
              </div>

              {/* Hero section with round logo */}
              <div className="mb-16">
                {/* Round logo showcase */}
                <div className="flex justify-center mb-8 animate-slide-up">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 p-2 shadow-2xl shadow-orange-500/30">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black/30 backdrop-blur-sm">
                      <Image
                        src="/team-logo-1.jpg"
                        alt="Phoenix Team Logo"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 animate-slide-up leading-none">
                  <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text text-transparent">
                    PHOENIX
                  </span>
                </h1>
                
                <div className="flex items-center justify-center gap-4 mb-10 animate-slide-up animation-delay-200">
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-16 md:w-24"></div>
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white/90 tracking-wider whitespace-nowrap">AI RESUME BUILDER</span>
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-16 md:w-24"></div>
                </div>

                <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed animate-slide-up animation-delay-400">
                  The future of resume building is here. Create stunning, ATS-optimized resumes with cutting-edge AI technology. 
                  <span className="block mt-2 text-orange-400 font-semibold">Be among the first to experience the revolution.</span>
                </p>
              </div>

              {/* Feature grid with Phoenix color theme */}
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20 animate-slide-up animation-delay-600 max-w-5xl mx-auto">
                <div className="group relative bg-gradient-to-br from-orange-900/40 to-black/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">Neural AI Engine</h3>
                    <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                      Advanced machine learning algorithms analyze millions of successful resumes to craft your perfect profile
                    </p>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-red-900/40 to-black/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-red-500/20 hover:border-red-400/40 transition-all duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-r from-red-500 to-yellow-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">Lightning Fast</h3>
                    <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                      Generate professional resumes in seconds, not hours. Our AI works at the speed of thought
                    </p>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-yellow-900/40 to-black/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">Career Accelerator</h3>
                    <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                      Join Team Phoenix and unlock opportunities that propel your career to new heights
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Section with Phoenix colors */}
              <div className="space-y-8 animate-slide-up animation-delay-800 mb-16">
                <button
                  className="group relative px-10 lg:px-12 py-5 lg:py-6 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 rounded-full font-bold text-lg lg:text-xl text-white shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 overflow-hidden"
                  onClick={() => setView("login")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <span>Launch My Career</span>
                    <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Free Beta Access</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Customized for students</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="animate-bounce mt-8">
              <ChevronDown className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        )}

        {view !== "intro" && (
          <div className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-lg animate-fade-in-up">
              <Card className="relative backdrop-blur-2xl bg-black/60 border border-orange-500/30 shadow-2xl shadow-orange-500/10 rounded-3xl overflow-hidden">
                {/* Animated border with Phoenix colors */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-red-500/30 to-yellow-500/30 rounded-3xl blur-sm opacity-75 animate-pulse"></div>
                <div className="absolute inset-[1px] bg-black/90 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <CardHeader className="text-center pb-6 pt-10 px-8">
                    {/* Round logo in form header */}
                    <div className="mx-auto mb-6 relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 p-1 shadow-lg shadow-orange-500/25">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black/30 backdrop-blur-sm">
                        <Image
                          src="/team-logo-1.jpg"
                          alt="Phoenix Team Logo"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <CardTitle className="text-2xl lg:text-3xl font-bold text-white mb-3">
                      {view === "login" && "Welcome Back, Phoenix"}
                      {view === "register" && "Join the Revolution"}
                      {view === "resetPassword" && "Reset & Soar"}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-base lg:text-lg">
                      {view === "login" && "Ready to elevate your career?"}
                      {view === "register" && "Your journey to career excellence starts here"}
                      {view === "resetPassword" && "We'll get you back on track"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-8 pb-6">
                    {view === "login" && (
                      <>
                        <LoginForm
                          onLogin={() => router.push("/home")}
                          onForgotPassword={() => setView("resetPassword")}
                        />
                        <div className="mt-8 text-center">
                          <p className="text-gray-400">
                            New to the Phoenix family?{" "}
                            <button
                              onClick={() => setView("register")}
                              className="text-orange-400 hover:text-orange-300 font-semibold hover:underline transition-colors"
                            >
                              Join the beta now
                            </button>
                          </p>
                        </div>
                      </>
                    )}

                    {view === "register" && (
                      <>
                        <RegistrationForm onRegister={() => setView("login")} />
                        <div className="mt-8 text-center">
                          <p className="text-gray-400">
                            Already part of Team Phoenix?{" "}
                            <button
                              onClick={() => setView("login")}
                              className="text-orange-400 hover:text-orange-300 font-semibold hover:underline transition-colors"
                            >
                              Sign in here
                            </button>
                          </p>
                        </div>
                      </>
                    )}

                    {view === "resetPassword" && (
                      <>
                        <ResetPasswordForm
                          onSuccess={() => setView("login")}
                          buttonText="Send Recovery Link"
                        />
                        <div className="mt-8 text-center">
                          <p className="text-gray-400">
                            Ready to soar again?{" "}
                            <button
                              onClick={() => setView("login")}
                              className="text-orange-400 hover:text-orange-300 font-semibold hover:underline transition-colors"
                            >
                              Back to launch pad
                            </button>
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                  
                  <CardFooter className="px-8 pb-10">
                    <button
                      onClick={() => setView("intro")}
                      className="text-gray-500 hover:text-orange-400 transition-colors flex items-center gap-2 mx-auto group"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                      Back to Mission Control
                    </button>
                  </CardFooter>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer with round logo */}
      <div className="fixed bottom-6 left-0 right-0 z-20">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 backdrop-blur-md bg-black/50 border border-orange-500/20 rounded-full px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src="/team-logo-1.jpg"
                  alt="Phoenix Team Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">© 2025 Phoenix Team Ltd.</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <span className="text-sm text-orange-400 font-medium">Launching Careers Into Orbit 🚀</span>
          </div>
        </div>
      </div>
   
      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-2deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
          50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
          animation-fill-mode: both;
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}
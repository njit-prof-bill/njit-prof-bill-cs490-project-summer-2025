"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TopBanner from "@/app/homepage/topBanner";
import Testimonials from "@/app/homepage/testimonials";

export default function MarketingPage() {
  const steps = [
    {
      title: "Enter Your Details",
      desc: "Tell us about your experience and goals.",
      icon: "📝",
    },
    {
      title: "AI Crafts Your Resume",
      desc: "Our technology creates polished, tailored content.",
      icon: "🤖",
    },
    {
      title: "Download & Apply",
      desc: "Export to PDF or Word and start applying.",
      icon: "✅",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <>
      <TopBanner />
      <main className="flex flex-col items-center justify-start pt-20 bg-white text-gray-900 font-sans">
        {/* Hero Section */}
        <section
          className="w-full bg-white py-20 px-4 fade-in-up"
          style={{ animationDelay: "0s" }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                <span className="text-gray-900">Create a</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">
                  Winning Resume
                </span>{" "}
                <span className="text-gray-900">in Minutes</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl">
                Generate professional, tailored resumes that land you interviews — no design skills required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/examples"
                  className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-md transition"
                >
                  See Examples
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <Image
                src="/womanphoto.png"
                alt="Woman creating resume"
                width={400}
                height={400}
                className="w-full max-w-sm"
                priority
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          className="w-full py-16 px-4 bg-sky-50 fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-4xl font-extrabold text-center mb-12 leading-snug tracking-tight">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow transition-transform duration-500 ${index === activeStep
                  ? "scale-110 bg-white"
                  : "scale-100 bg-sky-50 opacity-90"
                  }`}
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section
          className="w-full py-16 px-4 bg-white fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-4xl font-extrabold text-center mb-12 leading-snug tracking-tight">
            Why Choose AI Resume Writer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { label: "Instant Results", icon: "⚡" },
              { label: "Tailored Content", icon: "🎯" },
              { label: "Professional Templates", icon: "🎨" },
              { label: "ATS Optimized", icon: "✅" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center text-center p-4 bg-gray-50 border border-gray-200 rounded"
              >
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-lg">{feature.label}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Templates */}
        <section
          className="w-full py-16 px-4 bg-sky-50 fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <h2 className="text-4xl font-extrabold text-center mb-12 leading-snug tracking-tight">
            Sample Resume Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {["modern", "classic", "creative"].map((style) => (
              <div
                key={style}
                className="border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white"
              >
                <Image
                  src={`/templates/${style}.png`}
                  alt={`${style} template`}
                  width={400}
                  height={500}
                  className="w-full h-auto"
                />
                <div className="p-4 text-center">
                  <h3 className="font-semibold capitalize">{style} Template</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section
          className="w-full fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          <Testimonials />
        </section>

        {/* Call to Action */}
        <section
          className="w-full py-16 px-4 bg-sky-50 text-center fade-in-up"
          style={{ animationDelay: "1s" }}
        >
          <h2 className="text-4xl font-extrabold mb-4 leading-snug tracking-tight">
            Ready to Create Your Resume?
          </h2>
          <p className="mb-6 text-gray-600 text-lg">
            Start for free and build your professional resume today.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Get Started Free
          </Link>
        </section>
      </main>
    </>
  );
}

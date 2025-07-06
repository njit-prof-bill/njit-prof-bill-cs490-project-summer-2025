"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
    <main className="flex flex-col items-center justify-start">
      {/* Hero Section */}
      <section className="w-full bg-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Create a Winning Resume in Minutes
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Generate professional, tailored resumes that land you interviews — no design skills required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md"
              >
                Get Started Free
              </Link>
              <Link
                href="/examples"
                className="inline-block border border-blue-500 text-blue-400 hover:bg-blue-800 font-medium px-6 py-3 rounded-md"
              >
                See Examples
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex justify-center md:justify-end">
            <Image
              src="/lady-illustration.png"
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
      <section className="w-full py-16 px-4 bg-gray-800">
        <h2 className="text-3xl font-semibold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex flex-col items-center text-center p-6 border border-gray-700 rounded-lg shadow transition-transform duration-500
                ${
                  index === activeStep
                    ? "scale-110 bg-gray-900"
                    : "scale-100 bg-gray-900 opacity-80"
                }`}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full py-16 px-4 bg-gray-900">
        <h2 className="text-3xl font-semibold text-center mb-12">
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
              className="flex flex-col items-center text-center p-4 bg-gray-800 border border-gray-700 rounded"
            >
              <div className="text-4xl mb-2">{feature.icon}</div>
              <h3 className="font-medium">{feature.label}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Templates */}
      <section className="w-full py-16 px-4 bg-gray-800">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Sample Resume Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {["modern", "classic", "creative"].map((style) => (
            <div
              key={style}
              className="border border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-gray-900"
            >
              <Image
                src={`/templates/${style}.png`}
                alt={`${style} template`}
                width={400}
                height={500}
                className="w-full h-auto"
              />
              <div className="p-4 text-center">
                <h3 className="font-medium capitalize">{style} Template</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-16 px-4 bg-gray-900">
        <h2 className="text-3xl font-semibold text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              quote:
                "I landed my dream job in just two weeks thanks to this resume builder!",
              name: "Sarah L.",
            },
            {
              quote:
                "The AI made my resume stand out instantly. Highly recommend.",
              name: "Mike P.",
            },
          ].map((testi) => (
            <div
              key={testi.name}
              className="bg-gray-800 p-6 border border-gray-700 rounded-lg shadow-sm"
            >
              <p className="italic mb-4 text-gray-300">“{testi.quote}”</p>
              <p className="font-medium text-gray-200">— {testi.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16 px-4 bg-blue-700 text-white text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Ready to Create Your Resume?
        </h2>
        <p className="mb-6">
          Start for free and build your professional resume today.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-blue-700 font-medium px-6 py-3 rounded-md hover:bg-gray-100"
        >
          Get Started Free
        </Link>
      </section>
    </main>
  );
}


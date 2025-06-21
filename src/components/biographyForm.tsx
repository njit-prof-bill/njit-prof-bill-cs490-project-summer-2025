// src/components/forms/biographyForm.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

import { Sparkles } from "@/components/icons/sparkles";
import { FileText } from "@/components/icons/fileText";

import { useAuth } from "@/context/authContext";
import { useProfile } from "@/context/profileContext";
import { parseBiographyText } from "@/utils/documentParserClient";
import { useToast } from "@/context/toastContext";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FormValues {
  biography: string;
}

const BiographyForm: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { parseAndUpdate } = useProfile();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    if (!data.biography.trim()) {
      toast("Please enter your career biography", "error");
      return;
    }

    setIsProcessing(true);
    try {
      // parse via API
      const parsedData = await parseBiographyText(data.biography);
      parseAndUpdate(parsedData);

      // save to Firestore
      if (user) {
        await addDoc(
          collection(db, "users", user.uid, "corpus"),
          {
            source:    "biography",
            createdAt: serverTimestamp(),
            ...parsedData,
          }
        );
      }

      toast("Biography processed & saved!", "success");
      reset();
    } catch {
      toast("Failed to process biography", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Biography Text Area */}
        <div>
          <label
            htmlFor="biography"
            className="block text-sm font-medium text-neutral-200 mb-2"
          >
            Career Biography
          </label>
          <textarea
            id="biography"
            {...register("biography", {
              required: "Biography is required",
              minLength: {
                value: 100,
                message: "Biography should be at least 100 characters",
              },
            })}
            rows={12}
            className="w-full px-4 py-3 border border-neutral-600 rounded-lg bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Write your professional biography here. Include objectives, experience, education, skills…"
          />
          {errors.biography && (
            <p className="mt-1 text-sm text-red-500">
              {errors.biography.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isProcessing}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span>Process Biography</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Writing Tips */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-400 mb-2 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-400" />
          <span>✍️ Writing Tips:</span>
        </h4>
        <ul className="text-sm text-neutral-200 space-y-1">
          <li>• Include your career objectives and goals</li>
          <li>• List work experience with company, title, dates</li>
          <li>• Mention education, degrees, institutions</li>
          <li>• Describe key skills and technologies</li>
          <li>• Add specific accomplishments and achievements</li>
          <li>• Write in a natural, conversational style</li>
        </ul>
      </div>

      {/* Example */}
      <div className="bg-neutral-900 rounded-lg p-4">
        <h4 className="font-semibold text-neutral-100 mb-2">
          💡 Example Biography:
        </h4>
        <p className="text-sm text-neutral-300 italic">
          I am a marketing professional with 7 years of experience in digital marketing and brand management. I graduated from State University with a Marketing degree in 2017. I started my career at StartupCo as a Marketing Coordinator, then moved to TechCorp as a Senior Marketing Manager where I led campaigns that increased brand awareness by 40%. My skills include SEO, social media marketing, Google Analytics, and team leadership. I&apos;m passionate about data-driven marketing strategies and building strong brand identities...
        </p>
      </div>
    </div>
  );
};

export default BiographyForm;

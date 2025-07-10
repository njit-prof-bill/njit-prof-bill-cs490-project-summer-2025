// src/components/profile/CareerObjectiveSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Target } from "lucide-react";
import { useProfile } from "@/context/profileContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ObjectiveForm {
  careerObjective: string;
}

const CareerObjectiveSection: React.FC = () => {
  const { activeProfile, updateCareerObjective } = useProfile();
  const [text, setText] = useState(activeProfile.careerObjective || "");
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
  } = useForm<ObjectiveForm>({
    defaultValues: {
      careerObjective: activeProfile.careerObjective,
    },
  });

  useEffect(() => {
    setValue("careerObjective", text, { shouldValidate: true });
    if (text.length >= 50) {
      clearErrors("careerObjective");
    }
  }, [text, setValue, clearErrors]);

  const onSubmit = (data: ObjectiveForm) => {
    setSubmittedOnce(true);

    if (text.length < 50) {
      setError("careerObjective", {
        type: "manual",
        message: "Career objective should be at least 50 characters",
      });
      return;
    }

    clearErrors("careerObjective");
    updateCareerObjective(data.careerObjective);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Career Objective
        </h2>
        <p className="text-muted-foreground">
          Define your professional goals and career aspirations
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="careerObjective">Career Objective Statement</Label>
          <div className="relative">
            <Target className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              {...register("careerObjective")}
              rows={6}
              className="pl-10 resize-none"
              placeholder="Describe your career goals, what you're looking for in your next role, and how you want to contribute to an organization..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Error + Character Counter */}
          <div className="flex justify-between text-sm mt-1">
            {errors.careerObjective && (
              <p className="text-destructive">{errors.careerObjective.message}</p>
            )}
            <p
              className={`ml-auto ${submittedOnce && text.length < 50
                ? "text-red-500"
                : "text-muted-foreground"
                }`}
            >
              {text.length}/50
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Update Career Objective
        </Button>
      </form>

      {/* Writing Tips */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="font-semibold text-blue-400">
            💡 Writing Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            <li>• Keep it concise but impactful (2–3 sentences)</li>
            <li>• Focus on what you can offer, not just what you want</li>
            <li>• Include your key strengths and experience level</li>
            <li>• Mention the type of role or industry you’re targeting</li>
            <li>• Use action words and specific achievements when possible</li>
          </ul>
        </CardContent>
      </Card>

      {/* Example Objectives */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="font-semibold text-blue-400">
            📝 Example Objectives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="border-l-4 border-blue-500 pl-3">
            <strong>Software Engineer:</strong> “Experienced full‐stack
            developer with 5+ years building scalable web applications.
            Seeking a senior engineering role where I can leverage my
            expertise in React, Node.js, and cloud technologies to drive
            innovation and mentor junior developers.”
          </div>
          <div className="border-l-4 border-green-500 pl-3">
            <strong>Marketing Professional:</strong> “Results‐driven digital
            marketing specialist with a proven track record of increasing
            brand awareness by 40% and ROI by 35%. Looking to apply
            data‐driven strategies and creative campaign development in a
            growth‐focused marketing manager position.”
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CareerObjectiveSection;

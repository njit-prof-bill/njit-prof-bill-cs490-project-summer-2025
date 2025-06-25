import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Target } from 'lucide-react';
import { useProfile } from '@/context/profileContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ObjectiveForm {
  careerObjective: string;
}

const CareerObjectiveSection = () => {
  const { profile, updateCareerObjective, markUnsaved } = useProfile();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ObjectiveForm>({
    defaultValues: { careerObjective: profile.careerObjective }
  });

  const onSubmit = (data: ObjectiveForm) => {
    updateCareerObjective(data.careerObjective);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Career Objective</h2>
        <p className="text-muted-foreground">Define your professional goals and career aspirations</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="careerObjective">Career Objective Statement</Label>
          <div className="relative">
            <Target className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              {...register('careerObjective', { 
                required: 'Career objective is required',
                minLength: {
                  value: 50,
                  message: 'Career objective should be at least 50 characters'
                }
              })}
              rows={6}
              className="pl-10 resize-none"
              placeholder="Describe your career goals, what you're looking for in your next role, and how you want to contribute to an organization..."
              onChange={() => markUnsaved()}
            />
          </div>
          {errors.careerObjective && (
            <p className="text-sm text-destructive">{errors.careerObjective.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Write a compelling statement that summarizes your professional goals and what you bring to potential employers.
          </p>
        </div>

        <Button type="submit" className="w-full">
          Update Career Objective
        </Button>
      </form>

      {/* Tips */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="font-semibold text-blue-400">💡 Writing Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            <li>• Keep it concise but impactful (2-3 sentences)</li>
            <li>• Focus on what you can offer, not just what you want</li>
            <li>• Include your key strengths and experience level</li>
            <li>• Mention the type of role or industry you&apos;re targeting</li>
            <li>• Use action words and specific achievements when possible</li>
          </ul>
        </CardContent>
      </Card>

      {/* Examples */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className='font-semibold text-blue-400'>📝 Example Objectives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="border-l-4 border-blue-500 pl-3">
            <strong>Software Engineer:</strong> &quot;Experienced full-stack developer with 5+ years building scalable web applications. Seeking a senior engineering role where I can leverage my expertise in React, Node.js, and cloud technologies to drive innovation and mentor junior developers.&quot;
          </div>
          <div className="border-l-4 border-green-500 pl-3">
            <strong>Marketing Professional:</strong> &quot;Results-driven digital marketing specialist with proven track record of increasing brand awareness by 40% and ROI by 35%. Looking to apply data-driven strategies and creative campaign development in a growth-focused marketing manager position.&quot;
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CareerObjectiveSection;
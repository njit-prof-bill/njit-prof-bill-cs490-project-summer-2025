"use client";

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

import { useProfile } from "@/context/profileContext";
import ContactInfoSection from '@/components/profile/contactInfoSection';
import CareerObjectiveSection from '@/components/profile/careerObjectiveSection';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/context/toastContext";
import { usePathname } from 'next/navigation';
import JobHistory from '@/components/profile/jobHistory';
import EducationHistory from '@/components/profile/educationSection';

const VALID_SECTIONS = ["contact", "objective", "skills", "jobs", "education"] as const;
type SectionKey = typeof VALID_SECTIONS[number];

/** 
 * Reads location.hash and updates whenever:
 *  - the hash changes (in-page navigation)
 *  - the pathname changes to /home/profile (cross-page Link→hash)
 */
function useHash(): SectionKey {
  const pathname = usePathname();
  const getHash = (): SectionKey => {
    const h = window.location.hash.slice(1) as SectionKey;
    return VALID_SECTIONS.includes(h) ? h : "contact";
  };

  const [hash, setHash] = useState<SectionKey>(() => {
    // on first mount, pick up any existing fragment
    if (typeof window !== "undefined") return getHash();
    return "contact";
  });

  React.useEffect(() => {
    // in-page hash changes
    const onHashChange = () => setHash(getHash());
    window.addEventListener("hashchange", onHashChange);

    // cross-page nav: if we just landed on /home/profile, re-read the hash
    if (pathname === "/home/profile") {
      setHash(getHash());
    }

    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  return hash;
}

export default function ProfilePage() {
  const { hasUnsavedChanges, saveChanges } = useProfile();
  const [isReParsing, setIsReParsing] = useState(false);
  const toast = useToast();

  // read + update from URL hash
  const activeTab = useHash();

  // when user clicks the in-page tab buttons:
  const onTabChange = useCallback((val: string) => {
    window.location.hash = val;            // triggers hashchange → our hook updates
  }, []);

  const handleSave = async () => {
    await saveChanges();
    toast.success('Profile saved successfully!');
  };

  const handleReParse = async () => {
    setIsReParsing(true);
    // simulate a re-parse (or you could re-fetch & re-call parseAndUpdate here)
    await new Promise((r) => setTimeout(r, 2000));
    setIsReParsing(false);
    toast.success('Profile re-parsed successfully!');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Your Profile
              </h1>
              <p className="text-muted-foreground">
                Review and edit your structured professional information
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleReParse}
                disabled={isReParsing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isReParsing ? 'animate-spin' : ''
                    }`}
                />
                Re-parse History
              </Button>

              <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {hasUnsavedChanges && (
            <Alert className="mt-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4" color='black' />
              <AlertDescription className="text-amber-800">
                You have unsaved changes
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Sections Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  {VALID_SECTIONS.map((key) => (
                    <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                      {{
                        contact: "👤",
                        objective: "🎯",
                        skills: "⚡",
                        jobs: "💼",
                        education: "🎓",
                      }[key]}
                      <span className="hidden sm:inline capitalize">{key}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="contact" className="mt-6">
                  <ContactInfoSection />
                </TabsContent>
                <TabsContent value="objective" className="mt-6">
                  <CareerObjectiveSection />
                </TabsContent>
                <TabsContent value="jobs" className="mt-6">
                  <JobHistory />
                </TabsContent>
                <TabsContent value="education" className="mt-6">
                  <EducationHistory />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

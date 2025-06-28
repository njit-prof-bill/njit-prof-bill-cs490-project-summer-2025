"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "@/components/icons/uploadField";
import { FileText } from "@/components/icons/fileText";
import { useToast } from "@/context/toastContext";
import { useProfile } from "@/context/profileContext";

import FileUpload from "@/components/fileUpload";
import BiographyForm from "@/components/biographyForm";
import UploadedItems from "@/components/uploadedItems";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import Link from "next/link";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const { profile } = useProfile();

  const SECTIONS = [
    { key: "contact", label: "Contact Info", variant: profile.contactInfo.email, status: 'Complete' },
    { key: "objective", label: "Objective", variant: profile.careerObjective, status: 'Complete' },
    { key: "skills", label: "Skills", variant: profile.skills.length > 0, status: `${profile.skills.length} skills` },
    { key: "jobs", label: "Jobs", variant: profile.jobHistory.length > 0, status: `${profile.jobHistory.length} jobs` },
    { key: "education", label: "Education", variant: profile.education.length > 0, status: `${profile.education.length} entries` },
  ] as const;  

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Import Your Professional History</CardTitle>
                  <CardDescription>
                    Upload documents or write your career biography to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload Files</span>
                      </TabsTrigger>
                      <TabsTrigger value="biography" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Write Biography</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-6">
                      <FileUpload />
                    </TabsContent>
                    <TabsContent value="biography" className="mt-6">
                      <BiographyForm />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* UploadedItems Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Past Uploads</CardTitle>
                  <CardDescription>Manage and review your previously uploaded files or texts</CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadedItems />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/home/profile`} className="hover:underline">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Resume
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SECTIONS.map(({ key, label, variant, status }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Link href={`/home/profile#${key}`} className="text-sm text-muted-foreground hover:underline">{label}</Link>
                        <Badge variant={variant ? 'default' : 'secondary'}>
                          {variant ? status : 'Pending'}
                        </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-neutral-800">
                <CardHeader>
                  <CardTitle className="font-semibold text-purple-400">💡 Pro Tips (match color with gen resume button)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-neutral-200">
                    <li>• Upload multiple documents for better AI parsing</li>
                    <li>• Include your LinkedIn profile for comprehensive data</li>
                    <li>• Review and edit parsed information for accuracy</li>
                    <li>• Add specific accomplishments and metrics</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { parseAndUpdate } = useProfile();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}

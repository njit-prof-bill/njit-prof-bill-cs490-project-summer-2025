import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EducationEntry, JobEntry, useProfile } from "@/context/profileContext";
import { useToast } from "@/context/toastContext";
import { motion } from "framer-motion";
import { Plus, GraduationCap, Calendar, UserRound } from "lucide-react";

const jobHistoryId = (jobs: JobEntry[]): JobEntry[] => {
    return jobs.map((job) => ({
        ...job,
        id: job.id ?? crypto.randomUUID(),
    }));
};

export default function EducationHistory() {
    const { profile, parseAndUpdateProfile, addEducationEntry, deleteEducationEntry, updateEducationEntry } = useProfile();
    const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState<Omit<EducationEntry, "id">>({
        school: "",
        degree: "",
        dates: "",
        gpa: "",
    });

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addEducation = () => {
        addEducationEntry(formData);

        setFormData({
            school: "",
            degree: "",
            dates: "",
            gpa: "",
        });
        setIsAdding(false);
    };
    const handleAdd = () => {
        if (formData.school && formData.degree) {
            addEducationEntry(formData);
            setFormData({ school: "", degree: "", dates: "", gpa: "" });
            setIsAdding(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Education</h2>
                    <p className="text-muted-foreground">
                        Manage your educational background and qualifications
                    </p>
                </div>
                <Button
                    onClick={() => setIsAdding((prev) => !prev)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isAdding ? "Cancel" : "Add Education"}</span>
                </Button>
            </div>
            {isAdding && (<div className="space-y-4 mt-4">
                <div>
                    <Label htmlFor="school">School</Label>
                    <Input
                        id="school"
                        name="school"
                        value={formData.school}
                        onChange={change}
                    />
                </div>
                <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                        id="degree"
                        name="degree"
                        value={formData.degree}
                        onChange={change}
                    />
                </div>
                <div>
                    <Label htmlFor="dates">Dates</Label>
                    <Input
                        id="dates"
                        name="dates"
                        value={formData.dates}
                        placeholder="e.g. 2019–2023"
                        onChange={change}
                    />
                </div>
                <div>
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                        id="gpa"
                        name="gpa"
                        value={formData.gpa}
                        onChange={change}
                        placeholder="e.g. 3.8"
                    />
                </div>
                <Button onClick={handleAdd} className="bg-blue-600 text-white w-full">
                    Submit Education
                </Button>
            </div>
            )}


            <ul className="space-y-4">
                {profile.education.map((edu) => (
                    <li
                        key={edu.id}
                        className="border rounded-lg p-4 shadow-sm flex justify-between items-start bg-white dark:bg-background"
                    >
                        {/* Left section */}
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2 font-semibold text-foreground">
                                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                <span>{edu.school}</span>
                            </div>
                            <p className="text-muted-foreground">{edu.degree}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{edu.dates}</span>
                                </div>
                                {edu.gpa && (
                                    <span>
                                        <strong className="text-foreground">GPA:</strong> {edu.gpa}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right section */}
                        <div className="flex justify-end mt-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteEducationEntry(edu.id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
            {/* Education Tips */}
            <Card className="border-purple-400">
                <CardHeader>
                    <CardTitle className="font-semibold text-purple-500">🎓 Education Tips:</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-sm space-y-1">
                        <li>• List education in reverse chronological order (most recent first)</li>
                        <li>• Include relevant coursework, honors, or achievements</li>
                        <li>• Add GPA if it's 3.5 or higher (or equivalent)</li>
                        <li>• Include certifications, bootcamps, and professional development</li>
                        <li>• Don't forget about relevant online courses or training</li>
                    </ul>
                </CardContent>
            </Card>
        </>
    );

}
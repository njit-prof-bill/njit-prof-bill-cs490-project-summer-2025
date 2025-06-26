import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { JobEntry, useProfile } from "@/context/profileContext";
import { useToast } from "@/context/toastContext";
import { motion } from "framer-motion";
import { Plus, Building, UserRound, Calendar } from "lucide-react";

function formatDate(date: string): string {
    if (!date || date.toLowerCase() === "present") return "Present";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
    }).format(parsed);
}

const jobHistoryId = (jobs: JobEntry[]): JobEntry[] => {
    return jobs.map((job) => ({
        ...job,
        id: job.id ?? crypto.randomUUID(),
    }));
};

export default function JobHistory() {
    const { profile, parseAndUpdateProfile } = useProfile();
    const [jobHistory, setJobHistory] = useState<JobEntry[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        company: "",
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        accomplishments: "",
    });

    const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addJob = () => {

        if (
            formData.endDate.toLowerCase() !== "present" &&
            new Date(formData.endDate) < new Date(formData.startDate)
        ) {
            alert("End date cannot be earlier than start date.");
            return;
        }

        const newJob = {
            id: crypto.randomUUID(),
            company: formData.company,
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            accomplishments: formData.accomplishments.split(",").map(s => s.trim()),
        };

        const updated = [...jobHistory, newJob];
        setJobHistory(updated);
        parseAndUpdateProfile({ jobHistory: updated });
    };

    const deleteJob = (id: string) => {
        const updated = jobHistory.filter(job => job.id !== id);
        setJobHistory(updated);
        parseAndUpdateProfile({ jobHistory: updated });
    };

    useEffect(() => {
        const normalizedJobs = profile.jobHistory.map((job) => ({
            ...job,
            id: job.id ?? crypto.randomUUID(),
        }));

        setJobHistory(normalizedJobs);
        if (normalizedJobs.some(job => !job.id)) {
            parseAndUpdateProfile({ jobHistory: normalizedJobs });
        }
    }, [profile.jobHistory]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Job History</h2>
                    <p className="text-muted-foreground">
                        Manage your work experience and professional background
                    </p>
                </div>

                <Button
                    onClick={() => setIsAdding((prev) => !prev)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isAdding ? "Cancel" : "Add Job"}</span>
                </Button>
            </div>
            {isAdding && (<div className="space-y-4 mt-4">
                <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" onChange={change} value={formData.company} />
                </div>
                <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" name="title" onChange={change} value={formData.title} />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={3} onChange={change} value={formData.description} />
                </div>
                <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input type="date" id="startDate" name="startDate" onChange={change} value={formData.startDate} />
                </div>
                <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" onChange={change} value={formData.endDate} placeholder="e.g. Present or Date" />
                </div>
                <div>
                    <Label htmlFor="accomplishments">Accomplishments</Label>
                    <Input id="accomplishments" name="accomplishments" onChange={change} value={formData.accomplishments} placeholder="Comma-separated list" />
                </div>
                <Button onClick={addJob} className="w-full bg-blue-600 text-white">
                    Submit Job
                </Button>
            </div>
            )}

            <Card>
                <CardContent>
                    {jobHistory.length === 0 ? (
                        <p className="text-muted-foreground">No jobs added yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {jobHistory.map((job) => (
                                <li key={job.id} className="border p-4 rounded shadow space-y-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Building className="w-4 h-4 text-muted-foreground" />
                                            <h3 className="font-bold text-md">{job.company}</h3>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <UserRound className="w-4 h-4 text-muted-foreground" />
                                            <p>{job.title}</p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <p>{formatDate(job.startDate)} - {formatDate(job.endDate)}</p>
                                        </div>
                                    </div>
                                    <p>{job.description}</p>
                                    {job.accomplishments?.length > 0 && (
                                        <>
                                            <p className="mt-2 font-medium text-sm text-gray-300">Key Accomplishments:</p>
                                            <ul className="list-disc pl-6">
                                                {job.accomplishments.map((a, i) => <li key={i}>{a}</li>)}
                                            </ul>
                                        </>
                                    )}
                                    <Button variant="destructive" size="sm" onClick={() => deleteJob(job.id)}>Delete</Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Job History */}
            <Card className="border-green-400">
                <CardHeader>
                    <CardTitle className='font-semibold text-green-400'>💼 Job History Tips:</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-sm space-y-1">
                        <li>• List jobs in reverse chronological order (most recent first)</li>
                        <li>• Include specific accomplishments with numbers when possible</li>
                        <li>• Use action verbs to describe your responsibilities</li>
                        <li>• Focus on achievements rather than just duties</li>
                        <li>• Keep descriptions concise but informative</li>
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
    );
}
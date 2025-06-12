"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useTheme } from "@/context/themeContext";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form"; // Import useFieldArray
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { EyeIcon, EyeSlashIcon, PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline"; // Import new icons

// Assuming this utility exists for error handling
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";


type ThemeType = "light" | "dark" | "system";

// Define the type for a single job history entry
interface JobEntry {
    id: string; // Unique ID for React key and internal management
    company: string;
    role: string;
    startDate: string; // Format: YYYY-MM
    endDate: string;   // Format: YYYY-MM or "Present"
}

// Define the type for a single skill entry
interface SkillEntry {
    id: string; // Unique ID for React key and internal management
    name: string; // Name of the skill
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [careerObjective, setCareerObjective] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isOAuthUser, setIsOAuthUser] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State for job history and skills, initialized with empty arrays
    const [initialJobHistory, setInitialJobHistory] = useState<JobEntry[]>([]);
    const [initialSkills, setInitialSkills] = useState<SkillEntry[]>([]); // ADDED: State for skills

    useEffect(() => {
        const auth = getAuth();

        const fetchUserData = async (user: any) => {
            if (user) {
                setName(user.displayName || "");
                setEmail(user.email || "");

                const db = getFirestore();
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCareerObjective(data.careerObjective || "");

                    // Fetch jobHistory from Firestore and ensure it's an array
                    const fetchedJobHistory: JobEntry[] = Array.isArray(data.jobHistory)
                        ? data.jobHistory.map((entry: any) => ({
                              id: entry.id || Math.random().toString(36).substring(2, 9),
                              company: entry.company || '',
                              role: entry.role || '',
                              startDate: entry.startDate || '',
                              endDate: entry.endDate || '',
                          }))
                        : [];
                    setInitialJobHistory(fetchedJobHistory);

                    // ADDED: Fetch skills from Firestore and ensure it's an array
                    const fetchedSkills: SkillEntry[] = Array.isArray(data.skills)
                        ? data.skills.map((skill: any) => ({
                              id: skill.id || Math.random().toString(36).substring(2, 9),
                              name: skill.name || '',
                          }))
                        : [];
                    setInitialSkills(fetchedSkills);

                } else {
                    setCareerObjective("");
                    setInitialJobHistory([]);
                    setInitialSkills([]); // ADDED: Reset skills if no data
                }

                const isOAuth = user.providerData.some(
                    (provider: any) => provider.providerId !== "password"
                );
                setIsOAuthUser(isOAuth);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, fetchUserData);
        return () => unsubscribe();
    }, []);

    const form = useForm({
        defaultValues: {
            name: name,
            email: email,
            theme: theme,
            careerObjective: careerObjective,
            jobHistory: initialJobHistory,
            skills: initialSkills, // ADDED: Initialize skills with fetched data
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Use useFieldArray to manage dynamic job history fields
    const { fields: jobFields, append: appendJob, remove: removeJob } = useFieldArray({ // Renamed for clarity
        control: form.control,
        name: "jobHistory",
    });

    // ADDED: Use useFieldArray to manage dynamic skills fields
    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control: form.control,
        name: "skills",
    });

    // Reset form when initial data or theme changes
    useEffect(() => {
        // Only reset if form is not dirty, to avoid overwriting user input
        if (name && email && theme && !form.formState.isDirty) {
            form.reset({
                name,
                email,
                theme,
                careerObjective,
                jobHistory: initialJobHistory,
                skills: initialSkills, // ADDED: Reset skills with fetched data
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [name, email, theme, careerObjective, initialJobHistory, initialSkills, form, form.formState.isDirty]); // ADDED initialSkills to dependency array

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const values = form.getValues();

            if (!user) {
                throw new Error("No user is currently signed in.");
            }

            // Update the displayName in Firebase
            if (values.name !== user.displayName) {
                await updateProfile(user, { displayName: values.name });
            }

            // Save theme, careerObjective, jobHistory, and skills to Firestore
            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);
            await setDoc(
                userRef,
                {
                    theme: values.theme,
                    careerObjective: values.careerObjective || "",
                    jobHistory: values.jobHistory, // Save the entire job history array
                    skills: values.skills, // ADDED: Save the entire skills array
                },
                { merge: true }
            );

            // Change password if not OAuth and fields are filled
            if (
                !isOAuthUser &&
                values.currentPassword &&
                values.newPassword &&
                values.confirmPassword
            ) {
                if (values.newPassword !== values.confirmPassword) {
                    throw new Error("New password and confirmation do not match.");
                }
                const credential = EmailAuthProvider.credential(
                    user.email!,
                    values.currentPassword
                );
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, values.newPassword);
                toast.success("Password changed successfully.");
            }

            toast.success("Profile settings saved.");

            // Update initial states to reflect saved changes
            setInitialJobHistory(values.jobHistory);
            setInitialSkills(values.skills); // ADDED: Update initialSkills state

            // Clear password fields after successful save, but keep other fields updated
            form.reset({
                name: values.name,
                email: values.email,
                theme: values.theme,
                careerObjective: values.careerObjective,
                jobHistory: values.jobHistory,
                skills: values.skills, // ADDED: Ensure skills are reset with current values
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (err: unknown) {
            console.error("Error saving changes:", err);
            setError(getFriendlyFirebaseErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push("/home");
    };

    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Settings</h1>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={handleSave}>
                        {/* Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your name"
                                            disabled={isSaving}
                                            className="rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your email"
                                            disabled
                                            className="rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Career Objective / Summary Field */}
                        <FormField
                            control={form.control}
                            name="careerObjective"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Career Objective / Summary</FormLabel>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            placeholder="Write your career objective or summary here"
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                            disabled={isSaving}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Job History Section */}
                        <div className="space-y-4 border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold">Job History</h2>
                            {jobFields.map((item, index) => ( // Using jobFields
                                <div key={item.id} className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 space-y-3">
                                    <Button
                                        type="button"
                                        onClick={() => removeJob(index)} // Using removeJob
                                        disabled={isSaving}
                                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center h-8 w-8"
                                    >
                                        <MinusCircleIcon className="h-5 w-5" />
                                    </Button>
                                    <FormField
                                        control={form.control}
                                        name={`jobHistory.${index}.company`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Company Name" disabled={isSaving} className="rounded-md dark:bg-gray-800 dark:border-gray-600" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`jobHistory.${index}.role`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Your Role" disabled={isSaving} className="rounded-md dark:bg-gray-800 dark:border-gray-600" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex space-x-4">
                                        <FormField
                                            control={form.control}
                                            name={`jobHistory.${index}.startDate`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Start Date (YYYY-MM)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="YYYY-MM" disabled={isSaving} className="rounded-md dark:bg-gray-800 dark:border-gray-600" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`jobHistory.${index}.endDate`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>End Date (YYYY-MM or Present)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="YYYY-MM or Present" disabled={isSaving} className="rounded-md dark:bg-gray-800 dark:border-gray-600" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={() => appendJob({ id: Math.random().toString(36).substring(2, 9), company: "", role: "", startDate: "", endDate: "" })} // Using appendJob
                                disabled={isSaving}
                                className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                            >
                                <PlusCircleIcon className="h-5 w-5" />
                                <span>Add Job Entry</span>
                            </Button>
                        </div>

                        {/* ADDED: Skills Section */}
                        <div className="space-y-4 border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold">Skills</h2>
                            {skillFields.map((item, index) => ( // Using skillFields
                                <div key={item.id} className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 flex items-center space-x-3">
                                    <FormField
                                        control={form.control}
                                        name={`skills.${index}.name`} // Name property for skill
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormLabel className="sr-only">Skill Name</FormLabel> {/* Hidden label for accessibility */}
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., JavaScript, Project Management" disabled={isSaving} className="rounded-md dark:bg-gray-800 dark:border-gray-600" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => removeSkill(index)} // Using removeSkill
                                        disabled={isSaving}
                                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center h-8 w-8 flex-shrink-0"
                                    >
                                        <MinusCircleIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={() => appendSkill({ id: Math.random().toString(36).substring(2, 9), name: "" })} // Using appendSkill
                                disabled={isSaving}
                                className="w-full flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
                            >
                                <PlusCircleIcon className="h-5 w-5" />
                                <span>Add Skill</span>
                            </Button>
                        </div>


                        {/* Theme Field */}
                        <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Theme</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setTheme(value as ThemeType);
                                            }}
                                            value={field.value}
                                            disabled={isSaving}
                                        >
                                            <SelectTrigger id="theme" className="rounded-md dark:bg-gray-700 dark:border-gray-600">
                                                <SelectValue placeholder="Select theme" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                                <SelectItem value="system">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Fields */}
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="Enter your current password"
                                                disabled={isOAuthUser}
                                                className="rounded-md dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword((v) => !v)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                                tabIndex={-1}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="Enter your new password"
                                                disabled={isOAuthUser}
                                                className="rounded-md dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword((v) => !v)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                                tabIndex={-1}
                                            >
                                                {showNewPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                disabled={isOAuthUser}
                                                className="rounded-md dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4 mt-6">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-32 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-all duration-200"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCancel}
                                className="w-32 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-md transition-all duration-200"
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* Error Message */}
                        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                    </form>
                </Form>
            </div>
        </div>
    );
}

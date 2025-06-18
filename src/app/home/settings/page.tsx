'use client';

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
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, enableNetwork } from "firebase/firestore";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getFriendlyFirebaseErrorMessage } from "@/utils/firebaseErrorHandler";

type ThemeType = "light" | "dark" | "system";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const db = getFirestore();
    enableNetwork(db).catch((err) => {
      console.error("Error enabling Firestore network:", err);
    });

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setName(user.displayName || "");
        setEmail(user.email || "");
        const isOAuth = user.providerData.some(
          (provider) => provider.providerId !== "password"
        );
        setIsOAuthUser(isOAuth);

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          // No phone data handling here anymore
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const form = useForm({
    defaultValues: {
      name,
      email,
      theme,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    form.reset({
      name,
      email,
      theme,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [name, email, theme, form]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const values = form.getValues();

      if (!user) throw new Error("No user is currently signed in.");

      if (values.name !== user.displayName) {
        await updateProfile(user, { displayName: values.name });
      }

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      console.log("About to write to Firestore");
      await setDoc(userRef, { theme: values.theme }, { merge: true });
      console.log("Firestore write successful");

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

      form.reset({
        name: values.name,
        email: values.email,
        theme: values.theme,
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
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSave}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your name" disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your email" disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
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
            {/* Password fields */}
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
            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-32 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                className="w-32 bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        </Form>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Plus, 
    Trash2, 
    Save, 
    CheckCircle, 
    AlertCircle,
    Edit3,
    Contact
} from "lucide-react";

type EmailFormProps = {
  emailList: string[];
  setEmailList: React.Dispatch<React.SetStateAction<string[]>>;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

function EmailForm({emailList, setEmailList, submitted, setSubmitted, error, setError}: EmailFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  function handleChange(index: number, value: string) {
    if (submitted) setSubmitted(false);
    if (error) setError(null);
    setEmailList((oldEmails) => oldEmails.map((email, i) => (i === index ? value : email)));
  }

  function addEmail(event: React.MouseEvent<HTMLButtonElement>) {
    if (submitted) setSubmitted(false);
    if (error) setError(null);
    event.preventDefault();
    setEmailList((oldEmails) => [...oldEmails, ""]);
  }

  function removeEmail(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    if (submitted) setSubmitted(false);
    if (error) setError(null);
    event.preventDefault();
    setEmailList((oldEmails) => oldEmails.filter((currEmail, i) => i !== index));
  }

  function placeboSubmit() {
    try {
        setIsSubmitting(true);
        setStatusMessage("Saved!");
        setFormChanged(false);
        setTimeout(() => setStatusMessage(null), 2000);
    } finally {
        setIsSubmitting(false);
    }
  }

  useEffect(() => {
    //handles reload and close tab if there are unsaved changes
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (formChanged) {
            event.preventDefault();
            event.returnValue = ''; //is deprecated but might be necessary to prompt on Chrome
        }
    };

    //handles (most) clicks on links within the page if there are unsaved changes
    const handleClick = (event: MouseEvent) => {
        if (!formChanged) return;

        const nav = document.querySelector('nav');
        if (nav && nav.contains(event.target as Node)) {
            const target = (event.target as HTMLElement).closest('a');
            if (target && target instanceof HTMLAnchorElement) {
                const confirmed = window.confirm('You have unsaved changes. Leave this page?');
                if (!confirmed) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
        }

        const header = document.querySelector('header');
        if (header && header.contains(event.target as Node)) {
            const target = (event.target as HTMLElement).closest('a');
            if (target && target instanceof HTMLAnchorElement) {
                const confirmed = window.confirm('You have unsaved changes. Leave this page?');
                if (!confirmed) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('click', handleClick, true);
    };
  }, [formChanged]);


  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {emailList.map((email, emailIdx) => (
          <div key={emailIdx} className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="email"
                name="email"
                value={email}
                pattern="^[a-zA-Z0-9.!#$%&'*\+\/=?^_`\{\|\}~\-]+@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)+$"
                onChange={(event) => {
                  handleChange(emailIdx, event.target.value);
                  setFormChanged(true);
                  setStatusMessage("There has been a change. Don't forget to click \"Save Email Address\" and then the \"Save\" button at the bottom!");
                }}
                placeholder="Enter your email address"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(event) => {
                removeEmail(event, emailIdx);
                setFormChanged(true);
                setStatusMessage("There has been a change. Don't forget to click \"Save Email Address\" and then the \"Save\" button at the bottom!");
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {statusMessage === "There has been a change. Don't forget to click \"Save Email Address\" and then the \"Save\" button at the bottom!" && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{statusMessage}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addEmail}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Email
        </Button>
        
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={placeboSubmit}
          className={`flex items-center gap-2 ${
            isSubmitting 
              ? "bg-gray-500 cursor-wait text-white" 
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Emails
            </>
          )}
        </Button>
      </div>

      {statusMessage === "Saved!" && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">{statusMessage}</p>
        </div>
      )}
    </div>
  );
}

type PhoneNumFormProps = {
  phoneList: string[];
  setPhoneList: React.Dispatch<React.SetStateAction<string[]>>;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

function PhoneNumForm({phoneList, setPhoneList, submitted, setSubmitted, error, setError}: PhoneNumFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  function handleChange(index: number, value: string) {
    if (submitted) setSubmitted(false);
    if (error) setError(null);
    setPhoneList((oldNums) => oldNums.map((num, i) => (i === index ? value : num)));
  }

  function addPhoneNum(event: React.MouseEvent<HTMLButtonElement>) {
    if (submitted) setSubmitted(false);
    if (error) setError(null);
    event.preventDefault();
    setPhoneList((oldNums) => [...oldNums, ""]);
  }

  function removePhoneNum(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    if (submitted) setSubmitted(false);
    if (error) setError(null);
    event.preventDefault();
    setPhoneList((oldNums) => oldNums.filter((currNum, i) => i !== index));
  }

  function placeboSubmit() {
        try {
            setIsSubmitting(true);
            setStatusMessage("Saved!");
            setFormChanged(false);
            setTimeout(() => setStatusMessage(null), 2000);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
      //handles reload and close tab if there are unsaved changes
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
          if (formChanged) {
              event.preventDefault();
              event.returnValue = ''; //is deprecated but might be necessary to prompt on Chrome
          }
      };

      //handles (most) clicks on links within the page if there are unsaved changes
      const handleClick = (event: MouseEvent) => {
        if (!formChanged) return;

        const nav = document.querySelector('nav');
        if (nav && nav.contains(event.target as Node)) {
          const target = (event.target as HTMLElement).closest('a');
          if (target && target instanceof HTMLAnchorElement) {
            const confirmed = window.confirm('You have unsaved changes. Leave this page?');
            if (!confirmed) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
              }
          }

          const header = document.querySelector('header');
          if (header && header.contains(event.target as Node)) {
              const target = (event.target as HTMLElement).closest('a');
              if (target && target instanceof HTMLAnchorElement) {
                  const confirmed = window.confirm('You have unsaved changes. Leave this page?');
                  if (!confirmed) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                  }
              }
          }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('click', handleClick, true);

      return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          document.removeEventListener('click', handleClick, true);
      };
    }, [formChanged]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {phoneList.map((phoneNum, phoneIdx) => (
          <div key={phoneIdx} className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="tel"
                name="phone"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                value={phoneNum}
                onChange={(event) => {
                  handleChange(phoneIdx, event.target.value);
                  setFormChanged(true);
                  setStatusMessage("There has been a change. Don't forget to click \"Save Phone Number\" and then the \"Save\" button at the bottom!");
                }}
                placeholder="123-456-7890"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(event) => {
                removePhoneNum(event, phoneIdx);
                setFormChanged(true);
                setStatusMessage("There has been a change. Don't forget to click \"Save Phone Number\" and then the \"Save\" button at the bottom!");
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {statusMessage === "There has been a change. Don't forget to click \"Save Phone Number\" and then the \"Save\" button at the bottom!" && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{statusMessage}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addPhoneNum}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Phone
        </Button>
        
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={placeboSubmit}
          className={`flex items-center gap-2 ${
            isSubmitting 
              ? "bg-gray-500 cursor-wait text-white" 
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Phones
            </>
          )}
        </Button>
      </div>

      {statusMessage === "Saved!" && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">{statusMessage}</p>
        </div>
      )}
    </div>
  );
}

export default function EditContactInfoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false); // Tracks if form is being submitted
  const [submitted, setSubmitted] = useState(false); // Tracks if submission succeeded
  const [error, setError] = useState<string | null>(null); // Stores error message for display
  
  const [formChanged, setFormChanged] = useState(false); //for unsaved changes check
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      loadData();
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function loadData() {
    const documentRef = doc(db, "users", user!.uid);
    const document = await getDoc(documentRef);
    if (document.exists()) {
      const data = document.data();
      setFullName(data?.resumeFields?.fullName ?? "");
      setEmail(data?.resumeFields?.contact?.email ?? []);
      setLocation(data?.resumeFields?.contact?.location ?? "");
      setPhone(data?.resumeFields?.contact?.phone ?? []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);   // Show spinner + disable button
    setSubmitted(false);   // Reset previous success state
    setError(null);        // Clear any previous error message

    try {
      // Remove duplicates and empty/whitespace strings for the email array
      const cleanedEmails = [
        ...new Set(email) // Remove duplicates
      ].filter((email) => email.trim() !== ""); // Remove empty/whitespace emails

      // Remove duplicates and empty/whitespace strings for the phone array
      const cleanedPhoneNums = [
        ...new Set(phone) // Remove duplicates
      ].filter((phone) => phone.trim() !== ""); // Remove empty/whitespace phone numbers

      // Confirm if arrays were cleaned
      // console.log("Cleaned Emails: ", cleanedEmails);
      // console.log("Cleaned Phone Numbers: ", cleanedPhoneNums);

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        "resumeFields.fullName": fullName,
        "resumeFields.contact.email": cleanedEmails,
        "resumeFields.contact.location": location,
        "resumeFields.contact.phone": cleanedPhoneNums,
      });

      setEmail(cleanedEmails);
      setPhone(cleanedPhoneNums);

      setSubmitting(false); // Hide spinner
      setSubmitted(true);   // Trigger visual success feedback
      setFormChanged(false);  // Lets page know change has been saved
      setTimeout(() => setStatusMessage(null), 1); // Removes "unsaved change" from page and resets after 3s
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error("Error updating contact info:", err);
      setError("Something went wrong. Please try again."); // Show error feedback
      setSubmitting(false); // Stop spinner if error occurs
    }
  }

  useEffect(() => {
    //handles reload and close tab if there are unsaved changes
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (formChanged) {
        event.preventDefault();
        event.returnValue = ''; //is deprecated but might be necessary to prompt on Chrome
      }
    };

    //handles (most) clicks on links within the page if there are unsaved changes
    const handleClick = (event: MouseEvent) => {
      if (!formChanged) return;

      const nav = document.querySelector('nav');
      if (nav && nav.contains(event.target as Node)) {
        const target = (event.target as HTMLElement).closest('a');
        if (target && target instanceof HTMLAnchorElement) {
          const confirmed = window.confirm('You have unsaved changes. Leave this page?');
          if (!confirmed) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      }

      const header = document.querySelector('header');
      if (header && header.contains(event.target as Node)) {
        const target = (event.target as HTMLElement).closest('a');
        if (target && target instanceof HTMLAnchorElement) {
          const confirmed = window.confirm('You have unsaved changes. Leave this page?');
          if (!confirmed) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [formChanged]);

  // Reset success and error states when user edits any field
  function handleInputChange(
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (submitted) setSubmitted(false); // Hide success message if editing again
      if (error) setError(null);          // Clear error message on user change
      setFormChanged(true);               // Shows that form is changed
      setStatusMessage("There has been a change. Don't forget to save!"); // Visual affirmation of change
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Contact className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Contact Information
          </h1>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Full Name
              </h2>
            </div>
          </div>
          <div className="p-6">
            <input
              type="text"
              name="fullName"
              value={fullName}
              onChange={handleInputChange(setFullName)}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Email Addresses Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Addresses
              </h2>
            </div>
          </div>
          <div className="p-6">
            <EmailForm 
              emailList={email} 
              setEmailList={setEmail} 
              submitted={submitted} 
              setSubmitted={setSubmitted} 
              error={error} 
              setError={setError} 
            />
          </div>
        </div>

        {/* Phone Numbers Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Phone Numbers
              </h2>
            </div>
          </div>
          <div className="p-6">
            <PhoneNumForm 
              phoneList={phone} 
              setPhoneList={setPhone} 
              submitted={submitted} 
              setSubmitted={setSubmitted} 
              error={error} 
              setError={setError} 
            />
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Location
              </h2>
            </div>
          </div>
          <div className="p-6">
            <input
              type="text"
              name="location"
              value={location}
              onChange={handleInputChange(setLocation)}
              placeholder="Enter your location (e.g., City, State)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage === "There has been a change. Don't forget to save!" && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{statusMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            disabled={submitting}
            className={`px-8 py-3 font-medium flex items-center gap-2 ${
              submitted
                ? "bg-green-600 hover:bg-green-700 text-white"
                : submitting
                  ? "bg-gray-500 cursor-wait text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Submitting...
              </>
            ) : submitted ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Submitted!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        {/* SUCCESS MESSAGE */}
        {submitted && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
              Contact info updated successfully!
            </p>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
              {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

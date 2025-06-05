"use client";

export default function FreeFormPage() {
    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <form method="post">
                    <label>
                        <h1 className="text-2xl font-bold mb-6">Free-form Text</h1>
                        <textarea
                            name="freeFormContent"
                            placeholder="Enter your professional experience and academic credentials here. When you are done, hit 'Submit'."
                            rows={24}
                            cols={50}
                        ></textarea>
                    </label>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}
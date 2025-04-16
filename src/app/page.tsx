import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Marcus App Template</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-700 dark:text-gray-400">
            This app is a starter template for SaaS applications. To use this template, simply fork the repository and install the app dependencies.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
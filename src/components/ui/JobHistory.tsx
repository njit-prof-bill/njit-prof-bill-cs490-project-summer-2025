import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockJobHistory } from "@/lib/mockJobHistory";

export default function JobHistory() {
  return (
    <section className="my-8">
      <h2 className="text-lg font-semibold mb-2">Job History</h2>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Job Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockJobHistory.map((job, index) => (
            <Card key={index} className="border p-4">
              <CardDescription><strong>Company:</strong> {job.company}</CardDescription>
              <CardDescription><strong>Position:</strong> {job.position}</CardDescription>
              <CardDescription><strong>Years:</strong> {job.startYear} - {job.endYear}</CardDescription>
              <CardDescription><strong>Description:</strong> {job.description}</CardDescription>
            </Card>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

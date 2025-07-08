import { useState } from "react";

import Reorder from "./Reorder";
import ReorderEducation from "./ReorderEducation";
import ReorderWorkExperience from "@/components/ReorderWorkExperience";
import FetchAndDisplayKey from "./FetchAndDisplayKey";
import SummaryDisplay from "@/components/SummaryDisplay";
import SummaryEditor from "@/components/SummaryEditor";


import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

// import JobDescriptionsList from "@/components/JobDescriptionsList";
// import JobDescriptionUpload from "@/components/JobDescriptionUpload";

import GenerateCard from "@/components/GenerateCard";

// import { useRef } from "react";
import JobDescUploadAndListPrev from "@/components/JobDescUploadAndListPrev";

import JobApplicationList from "./job-history/JobApplicationList";




export default function GeneratorPageLayout() {

  const [activeTab, setActiveTab] = useState("generate");


  // The parent component ref to the List and the Upload for job Desc.:
  // allows it to refresh when the upload is a success:
  // const listRef = useRef<{ fetchJobDescriptions: () => void }>(null);


  // ------The function to refresh the List and the Upload for job Desc.:--------------
  // const handleJobAdded = () => {
  //   if (listRef.current) {
  //     listRef.current.fetchJobDescriptions();
  //   }
  // };
// -----------------------------------------


  const tabLabels: { [key: string]: string } = {
   
    generate: "Generate",
    jobs: "Job Descriptions",
    jobHistory: "Job Application History",
    template: "Template and Style Selection",
    download: "Resume Formatting & Download",


  };


  return (
    <div className="w-full max-w mx-auto px-1">
      {/* Tab Navigation */}
      <div className="relative z-10 flex space-x-4 bg-[#1B1917] rounded-t-xl px-1 pt-4 -mb-px">
        {Object.keys(tabLabels).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium transition-all duration-200 rounded-t-md ${
              activeTab === tab
                ? "bg-[#2A2A2E] text-[#F09E38]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>


      {/* Tab Panel Container */}
      <div className="relative min-h-[300px] bg-[#2A2A2E] rounded-b-xl p-2 transition-all duration-300">
       
        {activeTab === "jobs" && (
          <div className="animate-fade-in space-y-6 max-w-4xl mx-auto mt-2">


            {/*------- Job Description Components: ----------*/}
              <JobDescUploadAndListPrev />


                          {/* <JobDescriptionUpload onJobAdded={handleJobAdded} />
          
                          <JobDescriptionsList ref={listRef} /> */}
          {/* ---------------------- */}


               {/* <Card className="w-full max-w shadow-lg">       
                          <CardHeader>
                              <CardTitle> </CardTitle>
                          </CardHeader>      
                          <CardContent>
                              <CardDescription>
                      
                              </CardDescription>
                          </CardContent>        
                      </Card> */}


          </div>
        )}


        {activeTab === "generate" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">

           < GenerateCard    />

          </div>
        )}


         {activeTab === "jobHistory" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">

           {/* < GenerateCard    /> */}
           {/* Add the job application history component here: */}

          <JobApplicationList />



          </div>
        )}

{/* --------------------------------------------------------------------------- */}

           {activeTab === "template" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">

            
            {/* Add the component for the templating and styling here: */}


          </div>
        )}



           {activeTab === "download" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">


            {/* Add the component for the format and download UI here: */}


          </div>
        )}


{/* --------------------------------------------------------------------------- */}

      </div>
    </div>
  );
}

import { useState } from "react";
import Reorder from "./Reorder";
import ReorderEducation from "./ReorderEducation";
import ReorderWorkExperience from "@/components/ReorderWorkExperience";
import FetchAndDisplayKey from "./FetchAndDisplayKey";
import SummaryDisplay from "@/components/SummaryDisplay";
import SummaryEditor from "@/components/SummaryEditor";


import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";


import JobDescriptionsList from "@/components/JobDescriptionsList";

import JobDescriptionUpload from "@/components/JobDescriptionUpload";


import GenerateCard from "@/components/GenerateCard";





export default function GeneratorPageLayout() {

  const [activeTab, setActiveTab] = useState("generate");



  const tabLabels: { [key: string]: string } = {
   
    generate: "Generate",
    jobs: "Job Descriptions",
    // experience: "Experience",

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



               <Card className="w-full max-w shadow-lg">
          
                          <CardHeader>
                              <CardTitle> </CardTitle>
                          </CardHeader>
          
                          <CardContent>
          
          {/*------- Job Description Components: ----------*/}
                          <JobDescriptionUpload />
          
                          <JobDescriptionsList />
          {/* ---------------------- */}



                              <CardDescription>
                      
                              </CardDescription>
                          </CardContent>
          
                      </Card>


          </div>
        )}




        {activeTab === "generate" && (
          <div className="animate-fade-in w-full max-w mx-auto mt-2">

            {/* <h2 className="text-2xl font-bold mb-4 text-white">
              Placeholder, will change these.
            </h2> */}
          


           < GenerateCard    />



     
            {/* < GenerateCard      
            // leftContent={<JobDescriptionsList />}



            // middleContent={<div>middle Sidebar</div>}
            /> */}






          </div>
        )}
{/* 
        {activeTab === "experience" && (
          <div className="animate-fade-in mt-2">
            <ReorderWorkExperience />
          </div>
        )} */}

        {/* {activeTab === "education" && (
          <div className="animate-fade-in mt-2">
            <ReorderEducation />
          </div>
        )} */}

        {/* {activeTab === "skills" && (
          <div className="animate-fade-in w-full max-w-4xl mx-auto mt-2">
            <Reorder tag="skills" />
          </div>
        )} */}
      </div>
    </div>
  );
}

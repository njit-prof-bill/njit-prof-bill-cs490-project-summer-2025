 
 
 
 

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

import JobDescriptionsList from "@/components/JobDescriptionsList";


export default function GenerateCard() {


 
 return(


<div>
    

<h2 className="text-2xl font-bold mb-4 text-white">
              Placeholder, put generate button around here:
</h2>


 <div className="flex flex-row w-full max-w">

    <div className="flex w-full h-screen">
    <div className="flex-1 p-0.5 p-1">
        <img src="/resume-page-example-2.jpg" alt="Fetched Image" />  

    </div>
    <div className="flex-1 p-0.5 p-1">
                                  <JobDescriptionsList />
        {/* <img src="/resume-page-example-2.jpg" alt="Fetched Image" />   */}

    </div>
    </div>







        {/* <Card className="w-full max-w shadow-lg">

                <CardHeader>
                    <CardTitle>Placeholder: For resume generator:  GENERATE button </CardTitle>
                </CardHeader>

                <CardContent>
                    <CardDescription>
                    <img src="/resume-page-example.jpg" alt="Fetched Image" />   
                    <img src="/resume-page-example-2.jpg" alt="Fetched Image" />  
                        <br />
                    </CardDescription>

                </CardContent>
                <CardFooter>
                    <CardDescription></CardDescription>
                </CardFooter>

            </Card>




  <Card className="w-full max-w shadow-lg">

                <CardHeader>
                    <CardTitle>Placeholder: For resume generator:  GENERATE button </CardTitle>
                </CardHeader>

                <CardContent>
                    <CardDescription>
                    <img src="/resume-page-example.jpg" alt="Fetched Image" />   
                    <img src="/resume-page-example-2.jpg" alt="Fetched Image" />  
                        <br />
                    </CardDescription>

                </CardContent>
                <CardFooter>
                    <CardDescription></CardDescription>
                </CardFooter>

            </Card>   */}





    </div>


</div>











);



}


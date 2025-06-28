// // "use client";

// // import { useAuth } from "@/context/authContext";
// // import { useRouter } from "next/navigation";
// // import { useState, useEffect } from "react";
// // import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
// // import { UserNameAddUpdate } from '@/components/userNameAddUpdate';
// // import Spinner, { spinnerStyles } from '../../components/ui/Spinner';
// // import GroqProcessor from "../../components/GroqProcessor";
// // import ProfileCard from "../../components/ProfileCard";


// // export default function HomePage() {
// //   const { user, loading } = useAuth();
// //   const router = useRouter();

// //   useEffect(() => {
// //     if (!loading && !user) {
// //       router.push("/"); // Redirect unauthenticated users to landing page
// //     }
// //   }, [user, loading, router]);


// //   const deduplicateSkills = (skills: string[]) => {
// //     return skills.filter(
// //       (skill, index, self) =>
// //       index === self.findIndex(s => s.toLowerCase().trim() === skill.toLowerCase().trim())
// //     );
// //   };

// //     return (
// //         <div className="flex flex-col items-center">
           
// //             <br />
          
// //             <Card className="w-full max-w shadow-lg">
// //                 <CardHeader>
// //                 </CardHeader>

// //             <GroqProcessor />

// //               {/* <ProfileCard /> */}
// //               <ProfileCard deduplicateSkills={deduplicateSkills} />
// //             </Card> 
            
// //         </div>
// //     );
// //   }


// "use client";

// import { useAuth } from "@/context/authContext";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
// import { UserNameAddUpdate } from '@/components/userNameAddUpdate';
// import Spinner, { spinnerStyles } from '../../components/ui/Spinner';
// import GroqProcessor from "../../components/GroqProcessor";
// import ProfileCard from "../../components/ProfileCard";

// export default function HomePage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push("/"); // Redirect unauthenticated users to landing page
//     }
//   }, [user, loading, router]);

//   const deduplicateSkills = (skills: string[]) => {
//     return skills.filter(
//       (skill, index, self) =>
//       index === self.findIndex(s => s.toLowerCase().trim() === skill.toLowerCase().trim())
//     );
//   };

//     return (
//         <div className="flex flex-col items-center">
//             <br />
//             <Card className="w-full max-w shadow-lg">
//                 <CardHeader>
//                 </CardHeader>
//             <GroqProcessor />
//               {/* <ProfileCard /> */}
//               <ProfileCard deduplicateSkills={deduplicateSkills} />
//             </Card> 
//         </div>
//     );
//   }

"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { UserNameAddUpdate } from '@/components/userNameAddUpdate';
import Spinner, { spinnerStyles } from '../../components/ui/Spinner';
import GroqProcessor from "../../components/GroqProcessor";
import ProfileCard from "../../components/ProfileCard";


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect unauthenticated users to landing page
    }
  }, [user, loading, router]);


  const deduplicateSkills = (skills: string[]) => {
    return skills.filter(
      (skill, index, self) =>
      index === self.findIndex(s => s.toLowerCase().trim() === skill.toLowerCase().trim())
    );
  };

    return (
        <div className="flex flex-col items-center">
           
            <br />
        
            <Card className="w-full max-w-5xl mx-auto px-4 rounded-xl bg-[#1B1917] border border-gray-700">


                <CardHeader>
                </CardHeader>

                    <GroqProcessor />

              {/* <ProfileCard /> */}
              <ProfileCard deduplicateSkills={deduplicateSkills} />
            </Card> 
            
        </div>
    );
  }
 
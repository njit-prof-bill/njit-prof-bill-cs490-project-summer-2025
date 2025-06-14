import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';


import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Adjust path as needed
// import { doc, getDoc, setDoc } from 'firebase/firestore';

// import { onAuthStateChanged, User } from 'firebase/auth';


import FetchAndDisplayKey from "../components/FetchAndDisplayKey";



export default function UserProfile() {


    // console.log("ASHDAHSDIAISHDsdfsdfs");



  return (
    <div>
     




  
{/* 
    <FetchAndDisplayKey keyPath="contact.email" /> */}
{/* 
    <FetchAndDisplayKey keyPath="contact.location" />

    
    <FetchAndDisplayKey keyPath="contact.phone" /> 
     <FetchAndDisplayKey keyPath="summary" />

    <FetchAndDisplayKey keyPath="workExperience" />
    <FetchAndDisplayKey keyPath="workExperience.0.jobTitle" /> */}


    <FetchAndDisplayKey keyPath="fullName" /> 

    <FetchAndDisplayKey keyPath="contact.email" />

  
    <FetchAndDisplayKey keyPath="contact.phone" />

    <br />
    <FetchAndDisplayKey keyPath="summary" />
    <br />

   
  <FetchAndDisplayKey keyPath="workExperience" />
    <FetchAndDisplayKey keyPath="experience" />

    <FetchAndDisplayKey keyPath="education" />

    <FetchAndDisplayKey keyPath="skills.0" />
    <FetchAndDisplayKey keyPath="skills.1" />


    </div>
  );
}
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
     


    <FetchAndDisplayKey keyPath="fullName" /> 

    <FetchAndDisplayKey keyPath="contact.email" />

  
    <FetchAndDisplayKey keyPath="contact.phone" />

    <br />
    <FetchAndDisplayKey keyPath="summary" />
    <br />

   
  <FetchAndDisplayKey keyPath="workExperience" />
    {/* <FetchAndDisplayKey keyPath="experience" /> */}

    <FetchAndDisplayKey keyPath="education" />
{/* 
    <FetchAndDisplayKey keyPath="skills.0" />
    <FetchAndDisplayKey keyPath="skills.1" /> */}

    <FetchAndDisplayKey keyPath="skills" />


    </div>
  );
}
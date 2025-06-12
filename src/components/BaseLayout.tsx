// components/BaseLayout.tsx
import React from 'react';


import UserText from '../components/UserText';
import ResumeCenter from '../components/ResumeCenter';

import ResumeLeftTop from '../components/ResumeLeftTop';



const BaseLayout: React.FC<{
  leftContent: React.ReactNode;
  middleContent: React.ReactNode;
  rightContent: React.ReactNode;
}> = ({ leftContent, middleContent, rightContent }) => {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100vh', // or your preferred height
    }}>
      {/* Left Column */}
      {/*  backgroundColor: '#181818'  */}
      <div style={{ flex: 1, padding: '0.2rem' }}>
        
        <ResumeLeftTop />

      </div>
      
      {/* Middle Column */}
       {/* backgroundColor: '#181818'  */}
      <div style={{ flex: 2, padding: '0.2rem'}}>

        <ResumeCenter />
      </div>
      
      {/* Right Column */}
      <div style={{ flex: 1, padding: '0.2rem'}}>
        {/*  backgroundColor: '#181818'  */}
            <UserText /> 

      </div>
    </div>
  );
};

export default BaseLayout;
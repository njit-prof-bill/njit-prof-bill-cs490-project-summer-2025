// components/Spinner.tsx
import React from 'react';




// -----------------Notes: HOW TO USE: ------------------
// you can include this spinner where a submission or process takes some time, and the 
// 'loading' variable type is present, which it waits upon.


// Note: import this and its style, into the component or page where you need it:
//
//  import Spinner, { spinnerStyles } from '../../components/ui/Spinner';
//
// 
//
//
// {/* ----------Loading Spinner div segment: put into section where needed ------------------------------ */}
//     {/* Inject the keyframes globally when loading */}
//     <style>{spinnerStyles}</style>
//     {loading && (
//       <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
//         <Spinner />
//       </div>
//     )}
//     {/* -------------------------------------------------------- */}



const Spinner = () => {
  return (
    <div style={{
      display: 'inline-block',
      width: '40px',
      height: '40px',
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderTopColor: '#09f',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: 'auto'
    }} />
  );
};

export default Spinner;

/* Add keyframes for the spin animation */
export const spinnerStyles = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
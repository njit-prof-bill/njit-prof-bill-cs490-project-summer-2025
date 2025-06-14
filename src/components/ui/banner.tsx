import React from 'react';

type WelcomeBannerProps = {
  size: string;
  message?: string;
};

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ size, message = "Welcome!" }) => {
  return (
    <div
      style={{
        fontSize: size,
        backgroundColor: '#e0f7fa',
        padding: '1rem',
        textAlign: 'center',
        borderBottom: '2px solid #006064',
      }}
    >
      {message}
    </div>
  );
};

export default WelcomeBanner;

import React from 'react';

type NotificationBarProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

const NotificationBar: React.FC<NotificationBarProps> = ({ message, type = 'info' }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#d4edda';
      case 'error':
        return '#f8d7da';
      default:
        return '#d1ecf1';
    }
  };

  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(),
        color: '#333',
        padding: '1rem',
        borderRadius: '5px',
        margin: '1rem 0',
      }}
    >
      {message}
    </div>
  );
};

export default NotificationBar;

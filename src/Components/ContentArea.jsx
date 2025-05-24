import React from 'react';

const ContentArea = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'wandajatManagement':
        return <div className="p-8">Wandajat Management Content</div>;
      case 'printWandajat':
        return <div className="p-8">Print Wandajat Content</div>;
      case 'signOut':
        return <div className="p-8">You have been signed out</div>;
      default:
        return <div className="p-8">Please select an option</div>;
    }
  };

  return <div className="flex-1 bg-white">{renderContent()}</div>;
};

export default ContentArea;

import React, { useContext } from 'react';
import alertContext from '../../context/alert/alertContext';
import './Alert.css'; // Import CSS for styling

const Alert = () => {
  const context = useContext(alertContext);
  const { alert } = context;

  const capitalize = (word) => {
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
  };

  return (
    <div className="alert-container">
      {alert && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show`}
          role="alert"
        >
          <strong>{capitalize(alert.type)}</strong>: {alert.msg}
        </div>
      )}
    </div>
  );
};

export default Alert;

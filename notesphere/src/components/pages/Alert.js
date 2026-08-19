import React, { useContext } from 'react';
import alertContext from '../../context/alert/alertContext';
import './Alert.css'; // Import CSS for styling

const Alert = () => {
  const context = useContext(alertContext);
  // removeAlert already exists on the context (used internally for the
  // auto-dismiss timeout in alertState.js) — reused here, not new logic, to
  // back the close button `alert-dismissible` already implied but had no
  // control for.
  const { alerts, removeAlert } = context;

  const capitalize = (word) => {
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
  };

  return (
    <div className="alert-container">
      {alerts &&
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            <strong>{capitalize(alert.type)}</strong>: {alert.msg}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => removeAlert(alert.id)}
            ></button>
          </div>
        ))}
    </div>
  );
};

export default Alert;

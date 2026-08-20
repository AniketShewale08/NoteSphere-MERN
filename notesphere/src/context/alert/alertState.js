import React, { useState, useCallback, useRef } from "react";
import alertContext from "./alertContext";

// How long a single alert stays visible before auto-dismissing.
const ALERT_TIMEOUT = 4000;
// Max alerts shown at once — older ones are dropped once this is exceeded so
// a burst of alerts doesn't flood the screen.
const MAX_VISIBLE_ALERTS = 4;

const AlertState = (props) => {
  const [alerts, setAlerts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef({});

  const removeAlert = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    (message, type) => {
      const id = ++nextId.current;

      setAlerts((prevAlerts) => {
        const updated = [...prevAlerts, { id, msg: message, type }];
        // Drop the oldest alerts (and their timers) once we're over the cap.
        const overflow = updated.length - MAX_VISIBLE_ALERTS;
        if (overflow > 0) {
          updated.splice(0, overflow).forEach((dropped) => {
            clearTimeout(timers.current[dropped.id]);
            delete timers.current[dropped.id];
          });
        }
        return updated;
      });

      timers.current[id] = setTimeout(() => {
        removeAlert(id);
      }, ALERT_TIMEOUT);
    },
    [removeAlert]
  );

  // Legacy single-alert value (most recent), kept so any consumer still
  // reading `alert` directly instead of `alerts` continues to work.
  const alert = alerts.length > 0 ? alerts[alerts.length - 1] : null;

  return (
    <alertContext.Provider value={{ alert, alerts, showAlert, removeAlert }}>
      {props.children}
    </alertContext.Provider>
  );
};
export default AlertState;

// В src/components/Settings.js
import React from "react";

function Settings({
  notificationsEnabled,
  setNotificationsEnabled,
  notificationFrequency,
  setNotificationFrequency,
}) {
  return (
    <div>
      <h2>Настройки</h2>
      <div>
        <label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
          Включить оповещения
        </label>
      </div>
      {notificationsEnabled && (
        <div>
          <label htmlFor="notification-frequency">Частота оповещений:</label>
          <select
            id="notification-frequency"
            value={notificationFrequency}
            onChange={(e) => setNotificationFrequency(e.target.value)}
          >
            <option value="hourly">Каждый час</option>
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default Settings;

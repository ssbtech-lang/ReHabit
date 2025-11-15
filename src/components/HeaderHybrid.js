import React from "react";

export default function HeaderHybrid({ 
  total = 0, 
  doneToday = 0, 
  xp = 0, 
  onDateSelect,
  selectedDate
}) {

  const getLast7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push(d);
    }

    return days;
  };

  const weekDays = getLast7Days();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <header className="hybrid-header">
      <div className="week-strip">
        {weekDays.map((date, i) => {
          const isToday = i === 6;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateKey = `${year}-${month}-${day}`;
          
          const isSelected = dateKey === selectedDate;

          return (
            <div
              key={i}
              className={`week-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => onDateSelect(dateKey)}
            >
              <div className="wd-name">{dayNames[date.getDay()]}</div>
              <div className="wd-date">{date.getDate()}</div>
              <div className="wd-dot" />
            </div>
          );
        })}
      </div>
    </header>
  );
}
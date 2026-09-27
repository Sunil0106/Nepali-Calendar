import {
  getToday,
  getBsMonth,
  getBsDay,
  adToBs,
  bsToAd,
  BS_MONTHS_NP,
  formatBs,
  toDevanagari,
} from "https://esm.sh/@namlo/nepali-calendar";

let displayCalenderDate = document.querySelector(".js-calender-grid");
const todayDateDisplay = document.querySelector(".js-date-today-display");
const nextMonthButton = document.querySelector(".js-next-month-button");
const previousMonthButton = document.querySelector(".js-previous-month-button");
const todayButton = document.querySelector(".js-jump-today-date");
const displayEventsContainer = document.querySelector(
  ".js-display-events-container",
);

const WEEKDAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
let monthlyEvents = [];
const today = getToday();
let currentDate = getToday();

document.addEventListener("DOMContentLoaded", () => {
  renderDate(currentDate);
  showEvents(monthlyEvents, currentDate);
});

function renderDate(date) {
  monthlyEvents = [];
  let year = date.year;
  let month = date.month;
  let firstDay = getBsMonth(year, month).startWeekday;
  let lastDate = getBsMonth(year, month).totalDays;

  const prevMonth = month === 1 ? 12 : month - 1;
  const nextMonth = month === 12 ? 1 : month + 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextYear = month === 12 ? year + 1 : year;

  let prevLastDate = getBsMonth(prevYear, prevMonth).totalDays;
  let remainingDays = (7 - getBsMonth(nextYear, nextMonth).startWeekday) % 7;

  todayDateDisplay.innerHTML = `
${toDevanagari(date.day)} ${BS_MONTHS_NP[month - 1]} ${toDevanagari(year)}
`;

  displayCalenderDate.innerHTML = "";

  WEEKDAYS_NP.forEach((day, i) => {
    let html = `
    <div class="weekdays-name">
      <span class="weekday-np">${day}</span>
      <span class="weekday-en">${WEEKDAYS_EN[i]}</span>
    </div>`;

    displayCalenderDate.innerHTML += html;
  });

  //prev month
  for (let i = firstDay; i > 0; i--) {
    const dayNp = (prevLastDate - i + 1).toString().padStart(2, "0");
    const dayAd = bsToAd({
      year: prevYear,
      month: prevMonth,
      day: dayNp,
    }).getDate();
    const days = document.createElement("div");
    days.innerHTML = renderCalenderDates({ dayNp, dayAd });
    days.classList.add("calender-date", "muted-date");
    displayCalenderDate.appendChild(days);
  }

  //current month
  for (let i = 1; i <= lastDate; i++) {
    const dayAd = bsToAd({ year, month, day: i }).getDate();
    const dayNp = i.toString().padStart(2, "0");
    const days = document.createElement("div");
    const dayEvents = getBsDay(year, month, i);

    if (dayEvents.isHoliday || dayEvents.weekday === 6) {
      days.classList.add("holiday");
    }

    days.innerHTML = `
    ${renderCalenderDates({ dayNp, dayAd })} 
   <span class='tithi-name' >
   ${dayEvents.panchang.tithiNameNp}
   </span>
    `;

    days.classList.add("calender-date");

    if (i === today.day && month === today.month && year === today.year) {
      days.classList.add("today");
    }
    if (
      dayEvents.events.length > 0 ||
      (dayEvents.isHoliday && dayEvents.holidays.length > 0)
    ) {
      monthlyEvents.push({
        day: i,
        event: [...dayEvents.events, ...dayEvents.holidays],
      });
    }

    displayCalenderDate.appendChild(days);
  }

  //nextMonth
  for (let i = 0; i < remainingDays; i++) {
    const dayAd = bsToAd({
      year: nextYear,
      month: nextMonth,
      day: i + 1,
    }).getDate();
    const dayNp = (i + 1).toString().padStart(2, "0");
    const days = document.createElement("div");

    days.innerHTML = renderCalenderDates({ dayNp, dayAd });
    days.classList.add("calender-date", "muted-date");

    displayCalenderDate.appendChild(days);
  }
}

nextMonthButton.addEventListener("click", goToNextMonth);
previousMonthButton.addEventListener("click", goToPreviousMonth);
todayButton.addEventListener("click", jumpToToday);
function renderCalenderDates({ dayNp, dayAd }) {
  return `
     <span class="date-np">${toDevanagari(dayNp)}</span>
      <span class="date-en">${dayAd}</span>
    `;
}

function goToNextMonth() {
  currentDate =
    currentDate.month === 12
      ? {
          year: currentDate.year + 1,
          month: 1,
          day: 1,
        }
      : {
          ...currentDate,
          month: currentDate.month + 1,
          day: 1,
        };
  currentDate.year === today.year && currentDate.month === today.month
    ? (currentDate.day = today.day)
    : currentDate.day;
  renderDate(currentDate);
  showEvents(monthlyEvents, currentDate);
}

function goToPreviousMonth() {
  currentDate =
    currentDate.month === 1
      ? {
          year: currentDate.year - 1,
          month: 12,
          day: 1,
        }
      : {
          ...currentDate,
          month: currentDate.month - 1,
          day: 1,
        };
  currentDate.year === today.year && currentDate.month === today.month
    ? (currentDate.day = today.day)
    : currentDate.day;
  renderDate(currentDate);
  showEvents(monthlyEvents, currentDate);
}

function jumpToToday() {
  currentDate = today;
  renderDate(currentDate);
  showEvents(monthlyEvents, currentDate);
}

function showEvents(events, currentDate) {
  displayEventsContainer.innerHTML = "";
  if (events.length <= 0) return;

  const eventLists = events
    .map((event) => {
      return `
  <li>
  <span>${event.event.join(", ")}</span>
  <span>${toDevanagari(event.day.toString().padStart(2, "0"))} ${BS_MONTHS_NP[currentDate.month - 1]}</span>
  </li>
  `;
    })
    .join("");

  displayEventsContainer.innerHTML = `
  <h2>चाडपर्व तथा विदाहरू</h2>
  ${eventLists}
  `;
}
console.log(window.innerWidth);

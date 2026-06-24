const d = new Date();
// const M_months = ["miladi", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const J_months = ["jalali", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",];
const J_bDays = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه"];
const THEME_KEY = "datepicker-theme";

const nowToday = jalaliToday();
var today_index = 0;
window.currentDate = {
    year: 0,
    month: 0,
    day: 0
};
const today = {
    year: nowToday.year,
    month: nowToday.month,
    day: nowToday.day
};
// const jlyear = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
//     year: 'numeric',
//     //   month: '2-digit',
//     //   day: '2-digit'
// }).format(d);

function jalaliToday() {
    const date = new Date();
    let gy = parseInt(date.getFullYear());
    const gm = parseInt(date.getMonth()) + 1;
    const gd = parseInt(date.getDate());

    let jy, days;
    const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    if (gy > 1600) {
        jy = 979;
        gy -= 1600;
    } else {
        jy = 0;
        gy -= 621;
    }
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    days = (365 * gy) +
        parseInt((gy2 + 3) / 4) -
        parseInt((gy2 + 99) / 100) +
        parseInt((gy2 + 399) / 400) -
        80 +
        gd +
        gdm[gm - 1];
    jy += 33 * parseInt(days / 12053);
    days %= 12053;
    jy += 4 * parseInt(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += parseInt((days - 1) / 365);
        days = (days - 1) % 365;
    }
    const jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
    const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));

    return {
        year: jy,
        month: jm,
        day: jd
    };
}

function buildCalendar(fullyear) {
    let mapped2 = {};
    let temp_m = [];
    jyear = fullyear.year;
    const F_JtoG = jalali_to_gregorian(jyear, 1, 1);

    let F_GtoH = [];
    let m1 = 1;
    let d1 = 1;
    let m2 = parseInt(F_JtoG[1]);
    let d2 = parseInt(F_JtoG[2]);
    const jalalidays = isLeapYear(jyear)
        ? [1, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30]
        : [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    let index = 0; // nth day of week

    let dis_days = {};
    while (true) {
        /////////////////////////start new codes////////////////////////
        let activeDay = "false";
        if (d1 == 1) {
            wday = getWeekDay(jyear, m1, 1);
            dis_days[m1] = wday;
            if (wday > 0) {
                activeDay = "true";
                let mm1 = m1, dd1 = d1;
                for (let i = 0; i <= wday - 1; i++) {
                    
                    dd1--;
                    if (dd1 < 1) {
                        mm1--;
                        if (mm1 < 1) {
                            mm1 = 12;
                            (isLeapYear(jyear - 1) == 1) ? dd1 = 30 : dd1 = 29;
                        } else {
                            dd1 = jalalidays[mm1];
                        }
                    }
                    holiday = "false";
                    // if (index == 6) holiday = "true";
                    temp_m[i] = "[\"" + trNum(dd1, 'fa') + "\"," + holiday + "," + activeDay + "]";
                    index = (index + 1) % 7;
                }
            }
        }

        if (temp_m.length > 0) {
            for (let i = (wday - 1); i >= 0; i--) {
                if (!mapped2[m1]) mapped2[m1] = [];
                mapped2[m1].push(temp_m[i]);
            }
            temp_m = [];
        }
        /////////////////////////end new codes/////////////////////////

        // اگر از انتهای سال شمسی رد شدیم، تموم
        if (m1 > 12) {
            break;
        }
        holiday = "false";
        if (index == 6) holiday = "true";

        if (!mapped2[m1]) mapped2[m1] = [];
        mapped2[m1].push("[\"" + trNum(d1, 'fa') + "\"," + holiday + ",false]");

        d1++;

        if (d1 > jalalidays[m1]) {
            /******************** start new codes *******************/
            wday2 = getWeekDay(jyear, m1, jalalidays[m1]);
            index = wday2;
            if (wday2 < 6) {
                activeDay = "true";
                let mm1 = m1, dd1 = d1;
                for (let i = wday2 + 1; i <= 6; i++) {
                    if (dd1 > jalalidays[mm1]) {
                        mm1++;
                        if (mm1 > 12) { mm1 = 1; }
                        dd1 = 1;
                    }
                    holiday = "false";
                    if (index + 1 == 6) holiday = "true";
                    temp_m[i] = "[\"" + trNum(dd1, "fa") + "\"," + holiday + "," + activeDay + "]";
                    dd1++;
                    index = (index + 1) % 7;
                }
            }
            if (temp_m.length > 0) {
                if (!mapped2[m1]) mapped2[m1] = [];
                for (let i = wday2 + 1; i <= 6; i++) {
                    mapped2[m1].push(temp_m[i]);
                }
                temp_m = [];
            }

            /////////////////////////end new codes/////////////////////////
            if (mapped2[m1].length < 42) {
                let i = wday2 + 1
                for (i; i <= wday2 + 6; i++) {
                    mapped2[m1].push("[\"" + trNum(i, 'fa') + "\",false,true]");
                }
                mapped2[m1].push("[\"" + trNum(i + 1, 'fa') + "\",true,true]");
            }
            m1++; // main
            d1 = 1;

        }
        index = (index + 1) % 7; // روز چندم هفته
    } // while
    let calendarObject = [];
    for (let j = 0; j <= 11; j++) {
        calendarObject[j] = [];
        if (mapped2[j + 1]) {
            for (let m1 of mapped2[j + 1]) {
                calendarObject[j].push(JSON.parse(m1));
            }
        }
    }
    window.calendarObject = calendarObject;
    window.grayDays = dis_days;
    // return {
    //     calendarObject, dis_days,
    // };
}
// function trNum(num, lang) {
//     const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
//     return num.toString().replace(/\d/g, x => farsiDigits[x]);
// }
function trNum(s, l) {
    return s.toString().replace(l === 'fa' ? /\d/g : /[۰-۹]/g, m =>
        '۰۱۲۳۴۵۶۷۸۹'['0123456789'.indexOf(m)] || '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(m)]
    );
}
function isJalaliLeap(year) {
    kab = ((((year + 12) % 33) % 4) == 1) ? 1 : 0;
    return kab;
}
function isMiladiLeap(year) {
    return ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 1 : 0;
}
function mod(a, b) {
    return window.Math.abs(a - (b * window.Math.floor(a / b)));
}
const div = (a, b) => Math.floor(a / b);
function isLeapYear(jy) {
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    const bl = breaks.length;
    let jump = 0,
        leapJ = -14,
        jp = breaks[0],
        leap;
    for (let i = 1; i < bl; i += 1) {
        const jm = breaks[i];
        jump = jm - jp;
        if (jy < jm)
            break;
        leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
        jp = jm;
    }
    let n = jy - jp;
    if (jump - n < 6)
        n = n - jump + div(jump + 4, 33) * 33;
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return leap === 0;
}
function getWeekDay(year, month, day) {
    const getDays = (month, day) => {
        if (month < 8) return (month - 1) * 31 + day;
        return 6 * 31 + (month - 7) * 30 + day;
    };
    const getDiffDays = (year1, month1, day1, year2, month2, day2) => {
        let diffDays = getDays(month2, day2) - getDays(month1, day1);
        const y1 = (year1 < year2) ? year1 : year2;
        const y2 = (year1 < year2) ? year2 : year1;
        for (let y = y1; y < y2; y++) {
            if (isLeapYear(y)) diffDays += (year1 < year2) ? 366 : -366;
            else diffDays += (year1 < year2) ? 365 : -365;
        }
        return diffDays;
    };
    return mod(getDiffDays(1392, 3, 25, year, month, day), 7);
}
/**********************************************************************/
function openCalendar() {
    document.getElementById('dprBackdrop').classList.toggle('d-none');;
    datepickerWrapper.classList.toggle('d-none');
    renderCalendar();
}
function startWatch(input) {
    if (input.value == '') {
        window.currentDate = {
            year: nowToday.year,
            month: nowToday.month,
            day: nowToday.day
        };
    } else {
        window.oldDate = input.value.split('/');
        window.currentDate.year = Number(oldDate[0]);
        window.currentDate.month = Number(oldDate[1]);
        window.currentDate.day = Number(oldDate[2]);
    }
    if (document.getElementById('dprBackdrop')) {
        openCalendar();
        window._input = input;
        return;
    }
    wrapper = `
    <div class="datepicker-wrapper d-none" id="datepickerWrapper">
        <div class="p_right">
            <div class="datepicker gradient ${getSavedTheme()}" id="datepicker">
                <div class="datepicker-months d-none" id="monthPicker"></div>
                <div class="datepicker-years d-none" id="yearPicker"></div>
                <div id="calendarWrapper">
                    <div class="datepicker-header">
                        <button id="prevYearBtn" class="btns">‹</button>
                        <span id="yearLabel"></span>
                        <button id="nextYearBtn" class="btns">›</button>
                        <button id="prevMonthBtn" class="btns">‹</button>
                        <span id="monthLabel"></span>
                        <button id="nextMonthBtn" class="btns">›</button>
                    </div>
                    <div class="datepicker-grid" id="calendarDays"></div>
                </div>
                <div class="datepicker-toolbar">
                    <a id="themeBtn" class="">قالب</a>
                    <a id="todayBtn" class="">امروز</a>
                    <a id="resetBtn" class="">حذف</a>
                    <a id="closebtn" class="closebtn">بستن</a>
                </div>
            </div>
        
        </div>
        <div class="p_left">
            <div id="weekLg" class="weekLg">نام روز</div>
            <div class="ndLg">
                <div id="dayLg" class="dayLg">روز</div>
                <div id="monthLg" class="monthLg">ماه</div>
            <div id="yearLg" class="yearLg">سال</div>
           </div>
        </div>
    </div>
    <div id="dprBackdrop" class="_backdrop d-none"></div>`;
    document.body.insertAdjacentHTML('beforeend', wrapper);

    window._input = input;//دسترسی به اینپوت در داخل توابع

    const datepickerWrapper = document.getElementById("datepickerWrapper");
    const datepicker = document.getElementById("datepicker");
    const yearPicker = document.getElementById("yearPicker");
    const monthPicker = document.getElementById("monthPicker");
    const yearPickerGrid = document.getElementById("calendarYears");
    const calendarDays = document.getElementById("calendarDays");
    const calendarWrapper = document.getElementById("calendarWrapper");
    const monthLabel = document.getElementById("monthLabel");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const prevYearBtn = document.getElementById("prevYearBtn");
    const nextYearBtn = document.getElementById("nextYearBtn");
    const todayBtn = document.getElementById("todayBtn");
    const resetBtn = document.getElementById("resetBtn");
    const themeBtn = document.getElementById("themeBtn");
    const yearLabel = document.getElementById("yearLabel");
    const closebtn = document.getElementById("closebtn");
    const dprBackdrop = document.getElementById("dprBackdrop");
    const weekLg = document.getElementById("weekLg");

    buildCalendar(window.currentDate);

    renderCalendar();
    document.getElementById("weekLg").innerText = J_bDays[today_index % 7];
    document.getElementById("dayLg").innerText = trNum(window.currentDate.day, 'fa');
    document.getElementById("monthLg").innerText = J_months[window.currentDate.month];
    document.getElementById("yearLg").innerText = trNum(window.currentDate.year, 'fa');

    prevMonthBtn.addEventListener("click", () => {
        prev_month();
    });

    nextMonthBtn.addEventListener("click", () => {
        next_month();
    });

    prevYearBtn.addEventListener("click", () => {
        prev_year();
    });

    nextYearBtn.addEventListener("click", () => {
        next_year();
    });

    yearLabel.addEventListener("click", () => {
        showYearList();
    });

    monthLabel.addEventListener("click", () => {
        showMonthList();

    });

    todayBtn.addEventListener("click", () => {
        resetView();
        show_today();

    });
    resetBtn.addEventListener("click", () => {
        resetView();
        window._input.value = '';
        calendarWrapper.classList.remove('d-none')

    });

    themeBtn.addEventListener("click", () => {
        resetView();
        themePicker = document.getElementById('themePicker');
        if ((!themePicker)) {
            settings();
        } else {
            themePicker.classList.toggle('d-none');
        }
    });

    closebtn.addEventListener("click", (e) => {
        closeCalendar();
    });

    dprBackdrop.addEventListener("click", (e) => {
        closeCalendar();
    });

    yearPicker.addEventListener("click", (e) => {
        const dayElement = e.target.closest("div");
        if (!dayElement || !yearPicker.contains(dayElement)) return;

        if (dayElement.classList.contains("disable")) return;

        y = Number(trNum(dayElement.innerText, 'en'));
        if (y) window.currentDate.year = Number(trNum(dayElement.innerText, 'en'));

        calendarWrapper.classList.toggle("d-none");
        // yearPicker.innerHTML = "";
        yearPicker.classList.toggle("d-none");

        buildCalendar(window.currentDate);
        renderCalendar();
    });

    monthPicker.addEventListener("click", (e) => {
        const dayElement = e.target.closest("div");
        if (!dayElement || !monthPicker.contains(dayElement)) return;

        if (dayElement.classList.contains("disable")) return;

        m = dayElement.getAttribute('data');
        if (m) window.currentDate.month = Number(m);

        monthLabel.innerText = J_months[window.currentDate.month];

        calendarWrapper.classList.toggle("d-none");
        monthPicker.classList.toggle("d-none");
        renderCalendar();

    });
}

function next_month() {
    if (window.currentDate.month < 12) {
        currentDate.month++;
    } else {
        window.currentDate.month = 1;
        window.currentDate.year++;
    }
    buildCalendar(window.currentDate);
    renderCalendar();

}

function prev_month() {
    if (window.currentDate.month <= 1) {
        window.currentDate.month = 12;
        window.currentDate.year--;
    } else {
        window.currentDate.month--;
    }
    buildCalendar(window.currentDate);
    renderCalendar();
}

function next_year() {
    window.currentDate.year++;
    buildCalendar(window.currentDate);
    renderCalendar();

}
function prev_year() {
    window.currentDate.year--;
    buildCalendar(window.currentDate);
    renderCalendar();

}

function show_today() {
    window.currentDate = jalaliToday();
    buildCalendar(window.currentDate);
    renderCalendar();
    calendarWrapper.classList.toggle("d-none");
}

function resetView() {
    for (i = 0; i < datepicker.children.length - 1; i++)
        datepicker.children[i].classList.add("d-none");
}
function showYearList() {
    tmp = `<div class="datepicker-grid"id="calendarYears">
            `;

    for (i = 1300; i < window.currentDate.year; i++)
        tmp += `<div>${i}</div>`;

    tmp += `<div class="selected">${window.currentDate.year}</div>`;

    for (i = window.currentDate.year + 1; i <= window.currentDate.year + 50; i++)
        tmp += `<div>${i}</div>`;

    tmp += `</div>`;
    tmp = trNum(tmp, 'fa');
    yearPicker.innerHTML = tmp;
    resetView();
    yearPicker.classList.toggle("d-none");
    scrollToCenter();
}

function showMonthList() {
    tmp = `<div class="datepicker-grid" id="calendarMonths">`;

    for (i = 1; i <= 12; i++)
        tmp += `<div ${(i == window.currentDate.month) ? ` class="selected"` : ''} data="${i}">${J_months[i]}</div>`;

    tmp += `</div>`;
    monthPicker.innerHTML = tmp;
    resetView();
    monthPicker.classList.toggle("d-none");

}

function scrollToCenter() {
    element = document.querySelector('#yearPicker .selected');
    element.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'center'
    });
}

function settings() {
    setting = document.createElement("div");
    setting.setAttribute("id", "themePicker");
    setting.classList.add('theme');
    t = '<div class="datepicker-grid">';
    for (i = 0; i <= 20; i++)
        t += `<div class="gradient gradient--${i}" onclick="setTheme('gradient--${i}');"></div>`;
    t += `</div>`;
    setting.innerHTML = t;
    toolbar = document.getElementById('datepicker-toolbar');
    // setting.style.display = "block";
    //calendarWrapper.style.display = "none";
    datepicker.insertBefore(setting, calendarWrapper);
    // datepicker.appendChild(setting);
}

function setTheme(color) {
    document.querySelector(".datepicker").className = `datepicker gradient ${color}`;
    saveTheme(color);
}

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || "gradient--0";
}

function setLgNames() {

};

function closeCalendar() {
    datepickerWrapper.remove();
    dprBackdrop.remove();
    // datepickerWrapper.classList.add('d-none');
    // dprBackdrop.classList.add('d-none');
}
function renderCalendar() {
    calendarDays.innerHTML = `<span>ش</span><span>ی</span><span>د</span><span>س</span><span>چ</span><span>پ</span><span >ج</span>`;
    year = window.currentDate.year;
    month = window.currentDate.month;
    tday = window.currentDate.day;
    let s_tmp = null;
    monthLabel.innerText = J_months[month];
    yearLabel.innerText = trNum(year, 'fa');
    today_index = 0;
    for (let day = 0; day < window.calendarObject[month - 1].length; day++) {
        const dayElement = document.createElement("div");
        dayElement.innerText = window.calendarObject[month - 1][day][0];

        // const miladiElement = document.createElement("span");
        // miladiElement.classList.add('miladi_el');
        // miladiElement.innerText = window.calendarObject[month - 1][day][1];

        if (window.calendarObject[month - 1][day][1])
            dayElement.classList.add('holiday');

        activ_ = window.calendarObject[month - 1][day][2];

        const dayValue = Number(trNum(dayElement.childNodes[0].textContent.trim(), 'en'));

        if (window._input.value) {
            if (window._input.value === `${year}/${month}/${dayValue}` && activ_ === false) {
                dayElement.classList.add('selected');
                s_tmp = dayElement;
                today_index = day;
            }
        }
        if (year === today.year && month === today.month && dayValue === today.day && activ_ === false) {
            dayElement.classList.add('today');
            today_index = day;
        }
        if (window.calendarObject[month - 1][day][2]) {
            dayElement.classList.add('disable');
        }
        dayElement.addEventListener("click", (e) => {
            document.getElementById("weekLg").innerText = J_bDays[day % 7];
            a_d = trNum(dayElement.childNodes[0].textContent.trim(), 'en');
            window.currentDate.day = a_d;
            document.getElementById("dayLg").innerText = trNum(window.currentDate.day, 'fa');
            _input.value = `${year}/${month}/${a_d}`;
            if (s_tmp)
                s_tmp.classList.toggle('selected');
            s_tmp = e.target;
            e.target.classList.toggle('selected');
            document.getElementById("monthLg").innerText = J_months[window.currentDate.month];
            document.getElementById("yearLg").innerText = trNum(window.currentDate.year, 'fa');

            // closeCalendar();
        });
        // dayElement.appendChild(miladiElement);
        dayElement.setAttribute('index', day);
        calendarDays.appendChild(dayElement);
        datepickerWrapper.classList.remove("d-none");
        dprBackdrop.classList.remove('d-none');
    }
}



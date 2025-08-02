
// لینک Google Apps Script web app (توکن را حتما جایگزین کن)
const API_URL = "https://script.google.com/macros/s/AKfycbw2a0wM8fdCuec-Jgz4LUjWJdcKqqD3yk4foqjsHXpP5RQDPpqeo_GgftE3-hGyrKoC/exec";
const SECRET_TOKEN = "1404";

let currentPage = 1;
let totalItems = 0;
let pageSize = 20;

const searchForm = document.getElementById("searchForm");
const resultsTableHead = document.getElementById("tableHead");
const resultsTableBody = document.getElementById("tableBody");
const resultsInfo = document.getElementById("resultsInfo");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageIndicator = document.getElementById("pageIndicator");

// ساخت پارامترهای GET با توکن و فرم
function buildQueryParams(page = 1) {
  const formData = new FormData(searchForm);
  let params = new URLSearchParams();
  params.append("token", SECRET_TOKEN);
  params.append("page", page);

  for (const [key, value] of formData.entries()) {
    if (value.trim() !== "") {
      if (key === "ارسال_جواب") {
        // چک باکس فقط وقتی فعال است ارسال شود
        params.append(key, "true");
      } else {
        params.append(key, value.trim());
      }
    }
  }

  // اگر چک‌باکس ارسال جواب غیرفعال بود، حتما false بفرست
  if (!formData.get("ارسال_جواب")) {
    params.append("ارسال_جواب", "false");
  }

  return params.toString();
}

// نمایش نتایج در جدول
function renderTable(headers, data) {
  // ساخت هدر جدول
  resultsTableHead.innerHTML = "";
  const trHead = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  });
  resultsTableHead.appendChild(trHead);

  // ساخت ردیف‌ها
  resultsTableBody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    resultsTableBody.appendChild(tr);
  });
}

// گرفتن داده‌ها از API و رندر کردن
async function loadData(page = 1) {
  const query = buildQueryParams(page);
  const url = `${API_URL}?${query}`;

  resultsInfo.textContent = "در حال بارگذاری داده‌ها...";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("خطا در دریافت داده‌ها");
    const json = await res.json();

    if (json.error) {
      resultsInfo.textContent = `خطا: ${json.error}`;
      resultsTableBody.innerHTML = "";
      resultsTableHead.innerHTML = "";
      return;
    }

    totalItems = json.total;
    currentPage = json.page;
    pageSize = json.pageSize;

    resultsInfo.textContent = `نمایش ${json.data.length} از ${totalItems} مورد، صفحه ${currentPage}`;

    renderTable(json.headers, json.data);
    updatePaginationButtons();
  } catch (error) {
    resultsInfo.textContent = `خطا: ${error.message}`;
    resultsTableBody.innerHTML = "";
    resultsTableHead.innerHTML = "";
  }
}

// مدیریت دکمه‌های صفحه‌بندی
function updatePaginationButtons() {
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= Math.ceil(totalItems / pageSize);
  pageIndicator.textContent = `صفحه ${currentPage}`;
}

// رویداد ارسال فرم جستجو
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  currentPage = 1;
  loadData(currentPage);
});

// رویداد دکمه‌های صفحه‌بندی
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadData(currentPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < Math.ceil(totalItems / pageSize)) {
    currentPage++;
    loadData(currentPage);
  }
});

// بارگذاری اولیه داده‌ها (صفحه اول بدون فیلتر)
loadData(1);

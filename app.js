"use strict";

/* =========================================================
   AHR HOME RENT SYSTEM
   Firebase FREE
   LocalStorage Database
   ========================================================= */


/* ================= CONFIG ================= */

const DEFAULT_ADMIN = {
  email: "admin@demo.com",
  password: "123456"
};

const DB_KEY = "AHR_HOME_RENT_DATABASE_V5";
const AUTH_KEY = "AHR_HOME_RENT_AUTH_V5";
const ADMIN_KEY = "AHR_HOME_RENT_ADMIN_V5";


/* ================= HELPERS ================= */

function $(id){
  return document.getElementById(id);
}

function money(value){
  return "৳" + Number(value || 0).toLocaleString("en-BD");
}

function today(){

  const d = new Date();

  return d.toISOString().slice(0,10);

}

function currentMonth(){

  const d = new Date();

  return d.toISOString().slice(0,7);

}

function uid(prefix){

  return (
    prefix +
    Date.now() +
    Math.random()
      .toString(36)
      .slice(2,8)
  );

}

function escapeHTML(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* ================= DATABASE ================= */

function defaultDatabase(){

  return {
    tenants: [],
    payments: [],
    createdAt: new Date().toISOString()
  };

}


function getDB(){

  try{

    const raw =
      localStorage.getItem(DB_KEY);

    if(!raw){

      const db =
        defaultDatabase();

      saveDB(db);

      return db;

    }

    return JSON.parse(raw);

  }catch(error){

    console.error(error);

    const db =
      defaultDatabase();

    saveDB(db);

    return db;

  }

}


function saveDB(db){

  localStorage.setItem(
    DB_KEY,
    JSON.stringify(db)
  );

}


/* ================= ADMIN ================= */

function getAdmin(){

  try{

    const raw =
      localStorage.getItem(ADMIN_KEY);

    if(!raw){

      localStorage.setItem(
        ADMIN_KEY,
        JSON.stringify(DEFAULT_ADMIN)
      );

      return {
        ...DEFAULT_ADMIN
      };

    }

    return JSON.parse(raw);

  }catch{

    return {
      ...DEFAULT_ADMIN
    };

  }

}


/* ================= AUTH ================= */

function showLogin(){

  $("loginPage").classList.remove("hidden");

  $("appPage").classList.add("hidden");

}


function showApp(){

  $("loginPage").classList.add("hidden");

  $("appPage").classList.remove("hidden");

  refreshAll();

}


function login(){

  const email =
    $("email").value.trim();

  const password =
    $("password").value;

  const admin =
    getAdmin();

  const error =
    $("loginError");


  if(
    email.toLowerCase() ===
      admin.email.toLowerCase()
    &&
    password === admin.password
  ){

    localStorage.setItem(
      AUTH_KEY,
      "1"
    );

    error.style.display = "none";

    showApp();

    toast("Login successful");

  }else{

    error.textContent =
      "Wrong email or password.";

    error.style.display =
      "block";

  }

}


function demoLogin(){

  $("email").value =
    "admin@demo.com";

  $("password").value =
    "123456";

  login();

}


function logout(){

  localStorage.removeItem(
    AUTH_KEY
  );

  showLogin();

  $("password").value = "";

}


/* ================= NAVIGATION ================= */

function openPage(page){

  document
    .querySelectorAll(".page-section")
    .forEach(section => {

      section.classList.remove(
        "active-page"
      );

    });


  const target =
    $(page);

  if(target){

    target.classList.add(
      "active-page"
    );

  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

    });


  if(page === "tenants"){
    renderTenants();
  }

  if(page === "payments"){
    renderPayments();
  }

  if(page === "reports"){
    createReport(1);
  }

}


/* ================= TENANT ================= */

function openTenantModal(id = null){

  $("tenantForm").reset();

  $("tenantId").value = "";

  $("tenantMembers").value = 1;

  $("tenantRent").value = 0;

  $("tenantService").value = 0;

  $("tenantOther").value = 0;

  $("tenantAdvance").value = 0;

  $("tenantJoin").value = today();

  $("tenantStatusForm").value =
    "active";


  if(id){

    const db = getDB();

    const tenant =
      db.tenants.find(
        x => x.id === id
      );

    if(!tenant) return;


    $("tenantModalTitle").textContent =
      "Edit Tenant";

    $("tenantId").value =
      tenant.id;

    $("tenantName").value =
      tenant.name || "";

    $("tenantPhone").value =
      tenant.phone || "";

    $("tenantRoom").value =
      tenant.room || "";

    $("tenantMembers").value =
      tenant.members || 1;

    $("tenantRent").value =
      tenant.rent || 0;

    $("tenantService").value =
      tenant.service || 0;

    $("tenantOther").value =
      tenant.other || 0;

    $("tenantAdvance").value =
      tenant.advance || 0;

    $("tenantJoin").value =
      tenant.joinDate || "";

    $("tenantStatusForm").value =
      tenant.status || "active";

    $("tenantOut").value =
      tenant.outDate || "";

    $("tenantAddress").value =
      tenant.address || "";

    $("tenantNote").value =
      tenant.note || "";

  }else{

    $("tenantModalTitle").textContent =
      "Add Tenant";

  }


  $("tenantModal")
    .classList.remove("hidden");

}


function closeTenantModal(){

  $("tenantModal")
    .classList.add("hidden");

}


function saveTenant(event){

  event.preventDefault();


  const db =
    getDB();

  const id =
    $("tenantId").value;


  const tenant = {

    id:
      id || uid("tenant_"),

    name:
      $("tenantName").value.trim(),

    phone:
      $("tenantPhone").value.trim(),

    room:
      $("tenantRoom").value.trim(),

    members:
      Number(
        $("tenantMembers").value || 1
      ),

    rent:
      Number(
        $("tenantRent").value || 0
      ),

    service:
      Number(
        $("tenantService").value || 0
      ),

    other:
      Number(
        $("tenantOther").value || 0
      ),

    advance:
      Number(
        $("tenantAdvance").value || 0
      ),

    joinDate:
      $("tenantJoin").value,

    status:
      $("tenantStatusForm").value,

    outDate:
      $("tenantOut").value,

    address:
      $("tenantAddress").value.trim(),

    note:
      $("tenantNote").value.trim(),

    updatedAt:
      new Date().toISOString()

  };


  if(!tenant.name){

    alert("Tenant name required.");

    return;

  }


  if(id){

    const index =
      db.tenants.findIndex(
        x => x.id === id
      );

    if(index !== -1){

      db.tenants[index] =
        {
          ...db.tenants[index],
          ...tenant
        };

    }

    toast("Tenant updated");

  }else{

    db.tenants.unshift(
      tenant
    );

    toast("Tenant added");

  }


  saveDB(db);

  closeTenantModal();

  refreshAll();

}


function editTenant(id){

  openTenantModal(id);

}


function outTenant(id){

  const db =
    getDB();

  const tenant =
    db.tenants.find(
      x => x.id === id
    );

  if(!tenant) return;


  if(
    !confirm(
      "Mark this tenant as OUT?"
    )
  ){

    return;

  }


  tenant.status = "out";

  tenant.outDate = today();

  saveDB(db);

  refreshAll();

  toast("Tenant marked as out");

}


function restoreTenant(id){

  const db =
    getDB();

  const tenant =
    db.tenants.find(
      x => x.id === id
    );

  if(!tenant) return;


  tenant.status =
    "active";

  tenant.outDate = "";

  saveDB(db);

  refreshAll();

  toast("Tenant restored");

}


function deleteTenant(id){

  const db =
    getDB();

  const tenant =
    db.tenants.find(
      x => x.id === id
    );

  if(!tenant) return;


  if(
    !confirm(
      "Delete this tenant permanently?"
    )
  ){

    return;

  }


  db.tenants =
    db.tenants.filter(
      x => x.id !== id
    );


  saveDB(db);

  refreshAll();

  toast("Tenant deleted");

}


/* ================= TENANT ACTIVE ================= */

function tenantActiveInMonth(
  tenant,
  month
){

  const first =
    month + "-01";

  if(
    tenant.joinDate &&
    tenant.joinDate > first
  ){

    return false;

  }


  if(
    tenant.outDate &&
    tenant.outDate < first
  ){

    return false;

  }


  return true;

}


/* ================= TENANT TABLE ================= */

function renderTenants(){

  const db =
    getDB();

  const search =
    $("tenantSearch")
      .value
      .toLowerCase()
      .trim();

  const status =
    $("tenantStatus").value;


  let tenants =
    [...db.tenants];


  if(search){

    tenants =
      tenants.filter(t =>

        [
          t.name,
          t.phone,
          t.room
        ]
        .join(" ")
        .toLowerCase()
        .includes(search)

      );

  }


  if(status !== "all"){

    tenants =
      tenants.filter(
        t => t.status === status
      );

  }


  const table =
    $("tenantTable");


  if(!tenants.length){

    table.innerHTML =
      `
      <tr>
        <td colspan="8">
          <div class="empty">
            No tenant found.
          </div>
        </td>
      </tr>
      `;

    return;

  }


  table.innerHTML =
    tenants.map(t => {

      const statusHTML =
        t.status === "active"

          ?

        `<span class="status active">ACTIVE</span>`

          :

        `<span class="status out">OUT</span>`;


      const actionHTML =
        t.status === "active"

          ?

        `
        <button
          class="action-btn out-btn"
          onclick="outTenant('${t.id}')"
        >
          Out
        </button>
        `

          :

        `
        <button
          class="action-btn restore-btn"
          onclick="restoreTenant('${t.id}')"
        >
          Restore
        </button>
        `;


      return `

        <tr>

          <td>
            <strong>
              ${escapeHTML(t.name)}
            </strong>

            <br>

            <small>
              ${escapeHTML(t.room || "-")}
            </small>
          </td>

          <td>
            ${escapeHTML(t.phone || "-")}
          </td>

          <td>
            ${t.members || 1}
          </td>

          <td>
            ${money(t.rent)}
          </td>

          <td>
            ${money(t.service)}
          </td>

          <td>
            ${money(t.other)}
          </td>

          <td>
            ${statusHTML}
          </td>

          <td>

            <div class="action-row">

              <button
                class="action-btn edit-btn"
                onclick="editTenant('${t.id}')"
              >
                Edit
              </button>

              ${actionHTML}

              <button
                class="action-btn delete-btn"
                onclick="deleteTenant('${t.id}')"
              >
                Delete
              </button>

            </div>

          </td>

        </tr>

      `;

    }).join("");

}


/* ================= PAYMENT ================= */

function openPaymentModal(){

  const db =
    getDB();


  const select =
    $("paymentTenant");


  select.innerHTML =
    `
      <option value="">
        Select Tenant
      </option>
    `;


  db.tenants
    .filter(
      t => t.status === "active"
    )
    .forEach(t => {

      select.innerHTML +=
        `
        <option value="${t.id}">
          ${escapeHTML(t.name)}
          ${t.room ? " • " + escapeHTML(t.room) : ""}
        </option>
        `;

    });


  $("paymentForm").reset();

  $("paymentDate").value =
    today();

  $("paymentPeriod").value =
    currentMonth();


  $("paymentModal")
    .classList.remove("hidden");

}


function closePaymentModal(){

  $("paymentModal")
    .classList.add("hidden");

}


function savePayment(event){

  event.preventDefault();


  const db =
    getDB();


  const tenantId =
    $("paymentTenant").value;


  if(!tenantId){

    alert(
      "Please select a tenant."
    );

    return;

  }


  const payment = {

    id:
      uid("payment_"),

    tenantId,

    amount:
      Number(
        $("paymentAmount").value || 0
      ),

    date:
      $("paymentDate").value ||
      today(),

    period:
      $("paymentPeriod").value ||
      currentMonth(),

    method:
      $("paymentMethod").value,

    note:
      $("paymentNote").value.trim(),

    createdAt:
      new Date().toISOString()

  };


  if(payment.amount <= 0){

    alert(
      "Payment amount must be greater than 0."
    );

    return;

  }


  db.payments.unshift(
    payment
  );

  saveDB(db);

  closePaymentModal();

  refreshAll();

  toast("Payment saved");

}


/* ================= PAYMENT TABLE ================= */

function renderPayments(){

  const db =
    getDB();

  const search =
    $("paymentSearch")
      .value
      .toLowerCase()
      .trim();

  const month =
    $("paymentMonth").value;


  let payments =
    [...db.payments];


  if(month){

    payments =
      payments.filter(
        p => p.period === month
      );

  }


  if(search){

    payments =
      payments.filter(p => {

        const tenant =
          db.tenants.find(
            t => t.id === p.tenantId
          );

        const text =
          [
            tenant?.name,
            tenant?.phone,
            p.method,
            p.note,
            p.period
          ]
          .join(" ")
          .toLowerCase();

        return text.includes(search);

      });

  }


  const table =
    $("paymentTable");


  if(!payments.length){

    table.innerHTML =
      `
      <tr>
        <td colspan="7">
          <div class="empty">
            No payments found.
          </div>
        </td>
      </tr>
      `;

    return;

  }


  table.innerHTML =
    payments.map(p => {

      const tenant =
        db.tenants.find(
          t => t.id === p.tenantId
        );


      return `

        <tr>

          <td>
            ${escapeHTML(p.date)}
          </td>

          <td>
            <strong>
              ${escapeHTML(
                tenant?.name || "Deleted Tenant"
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(p.period)}
          </td>

          <td>
            <strong>
              ${money(p.amount)}
            </strong>
          </td>

          <td>
            ${escapeHTML(p.method)}
          </td>

          <td>
            ${escapeHTML(p.note || "-")}
          </td>

          <td>

            <button
              class="action-btn delete-btn"
              onclick="deletePayment('${p.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


function deletePayment(id){

  if(
    !confirm(
      "Delete this payment?"
    )
  ){

    return;

  }


  const db =
    getDB();

  db.payments =
    db.payments.filter(
      p => p.id !== id
    );

  saveDB(db);

  refreshAll();

  toast("Payment deleted");

}


/* ================= DASHBOARD ================= */

function renderDashboard(){

  const db =
    getDB();


  const active =
    db.tenants.filter(
      t => t.status === "active"
    );


  const members =
    active.reduce(
      (sum,t) =>
        sum + Number(t.members || 0),
      0
    );


  const rent =
    active.reduce(
      (sum,t) =>
        sum + Number(t.rent || 0),
      0
    );


  const service =
    active.reduce(
      (sum,t) =>
        sum + Number(t.service || 0),
      0
    );


  const other =
    active.reduce(
      (sum,t) =>
        sum + Number(t.other || 0),
      0
    );


  const month =
    currentMonth();


  const paid =
    db.payments
      .filter(
        p => p.period === month
      )
      .reduce(
        (sum,p) =>
          sum + Number(p.amount || 0),
        0
      );


  const expected =
    active.reduce(
      (sum,t) =>
        sum +
        Number(t.rent || 0) +
        Number(t.service || 0) +
        Number(t.other || 0),
      0
    );


  const due =
    Math.max(
      0,
      expected - paid
    );


  $("statTenants").textContent =
    db.tenants.length;

  $("statActive").textContent =
    active.length;

  $("statMembers").textContent =
    members;

  $("statRent").textContent =
    money(rent);

  $("statService").textContent =
    money(service);

  $("statOther").textContent =
    money(other);

  $("statPaid").textContent =
    money(paid);

  $("statDue").textContent =
    money(due);


  /* RECENT PAYMENTS */

  const recent =
    db.payments
      .slice(0,5);


  if(!recent.length){

    $("recentPayments").innerHTML =
      `
      <div class="empty">
        No payment yet.
      </div>
      `;

  }else{

    $("recentPayments").innerHTML =
      recent.map(p => {

        const t =
          db.tenants.find(
            x => x.id === p.tenantId
          );


        return `
          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
              padding:10px 0;
              border-bottom:1px solid #eef2f7;
            "
          >

            <div>
              <strong>
                ${escapeHTML(
                  t?.name || "Unknown"
                )}
              </strong>

              <br>

              <small>
                ${escapeHTML(p.period)}
              </small>
            </div>

            <strong>
              ${money(p.amount)}
            </strong>

          </div>
        `;

      }).join("");

  }


  /* RECENT TENANTS */

  if(!active.length){

    $("recentTenants").innerHTML =
      `
      <div class="empty">
        No active tenant.
      </div>
      `;

  }else{

    $("recentTenants").innerHTML =
      active
        .slice(0,5)
        .map(t => {

          return `
            <div
              style="
                display:flex;
                justify-content:space-between;
                padding:10px 0;
                border-bottom:1px solid #eef2f7;
              "
            >

              <div>

                <strong>
                  ${escapeHTML(t.name)}
                </strong>

                <br>

                <small>
                  ${escapeHTML(
                    t.room || "No room"
                  )}
                </small>

              </div>

              <strong>
                ${money(
                  Number(t.rent || 0) +
                  Number(t.service || 0) +
                  Number(t.other || 0)
                )}
              </strong>

            </div>
          `;

        }).join("");

  }

}


/* ================= REPORT ================= */

let currentReportMonths = 1;


function createReport(months){

  currentReportMonths =
    Number(months);


  const db =
    getDB();


  const now =
    new Date();


  const monthsList = [];


  for(
    let i = months - 1;
    i >= 0;
    i--
  ){

    const d =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );


    monthsList.push(
      d.toISOString().slice(0,7)
    );

  }


  let expected = 0;


  db.tenants.forEach(t => {

    monthsList.forEach(month => {

      if(
        tenantActiveInMonth(
          t,
          month
        )
      ){

        expected +=
          Number(t.rent || 0) +
          Number(t.service || 0) +
          Number(t.other || 0);

      }

    });

  });


  const paid =
    db.payments
      .filter(
        p =>
          monthsList.includes(
            p.period
          )
      )
      .reduce(
        (sum,p) =>
          sum + Number(p.amount || 0),
        0
      );


  const due =
    Math.max(
      0,
      expected - paid
    );


  $("reportResult").innerHTML =
    `

      <div class="report-cards">

        <div class="report-number">

          <span>
            Period
          </span>

          <strong>
            ${months} Month${months > 1 ? "s" : ""}
          </strong>

        </div>


        <div class="report-number">

          <span>
            Expected
          </span>

          <strong>
            ${money(expected)}
          </strong>

        </div>


        <div class="report-number">

          <span>
            Paid
          </span>

          <strong>
            ${money(paid)}
          </strong>

        </div>


        <div class="report-number">

          <span>
            Due
          </span>

          <strong>
            ${money(due)}
          </strong>

        </div>


        <div class="report-number">

          <span>
            Tenants
          </span>

          <strong>
            ${db.tenants.length}
          </strong>

        </div>


        <div class="report-number">

          <span>
            Generated
          </span>

          <strong>
            ${today()}
          </strong>

        </div>

      </div>

    `;

}


function downloadPDF(){

  const db =
    getDB();


  const now =
    new Date();


  const months =
    currentReportMonths;


  const monthNames = [];


  for(
    let i = months - 1;
    i >= 0;
    i--
  ){

    const d =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );


    monthNames.push(
      d.toISOString().slice(0,7)
    );

  }


  let expected = 0;


  db.tenants.forEach(t => {

    monthNames.forEach(month => {

      if(
        tenantActiveInMonth(
          t,
          month
        )
      ){

        expected +=
          Number(t.rent || 0) +
          Number(t.service || 0) +
          Number(t.other || 0);

      }

    });

  });


  const paid =
    db.payments
      .filter(
        p =>
          monthNames.includes(
            p.period
          )
      )
      .reduce(
        (sum,p) =>
          sum + Number(p.amount || 0),
        0
      );


  const due =
    Math.max(
      0,
      expected - paid
    );


  const rows =
    db.tenants
      .map(t => {

        let tenantExpected = 0;

        monthNames.forEach(month => {

          if(
            tenantActiveInMonth(
              t,
              month
            )
          ){

            tenantExpected +=
              Number(t.rent || 0) +
              Number(t.service || 0) +
              Number(t.other || 0);

          }

        });


        const tenantPaid =
          db.payments
            .filter(
              p =>
                p.tenantId === t.id &&
                monthNames.includes(
                  p.period
                )
            )
            .reduce(
              (sum,p) =>
                sum + Number(p.amount || 0),
              0
            );


        const tenantDue =
          Math.max(
            0,
            tenantExpected - tenantPaid
          );


        return `

          <tr>

            <td>
              ${escapeHTML(t.name)}
            </td>

            <td>
              ${escapeHTML(t.room || "-")}
            </td>

            <td>
              ${money(tenantExpected)}
            </td>

            <td>
              ${money(tenantPaid)}
            </td>

            <td>
              ${money(tenantDue)}
            </td>

          </tr>

        `;

      }).join("");


  const reportHTML = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
AHR Home Rent System - Report
</title>

<style>

body{
  font-family:Arial,sans-serif;
  margin:40px;
  color:#111827;
}

.header{
  text-align:center;
  border-bottom:3px solid #2563eb;
  padding-bottom:20px;
  margin-bottom:25px;
}

.header h1{
  margin:0;
  color:#2563eb;
}

.header p{
  color:#64748b;
}

.cards{
  display:flex;
  gap:15px;
  margin-bottom:25px;
}

.card{
  border:1px solid #ddd;
  padding:15px;
  flex:1;
  border-radius:10px;
}

.card small{
  display:block;
  color:#64748b;
  margin-bottom:6px;
}

.card strong{
  font-size:20px;
}

table{
  width:100%;
  border-collapse:collapse;
}

th,td{
  border:1px solid #ddd;
  padding:10px;
  text-align:left;
}

th{
  background:#eff6ff;
}

.footer{
  position:fixed;
  bottom:15px;
  left:0;
  right:0;
  text-align:center;
  color:#94a3b8;
  font-size:11px;
  letter-spacing:2px;
}

@media print{
  body{
    margin:20px;
  }
}

</style>

</head>


<body>

<div class="header">

  <h1>
    AHR Home Rent System
  </h1>

  <p>
    Premium Home Rent Management
  </p>

  <p>
    Report Period:
    ${months} Month${months > 1 ? "s" : ""}
  </p>

</div>


<div class="cards">

  <div class="card">

    <small>
      Expected
    </small>

    <strong>
      ${money(expected)}
    </strong>

  </div>


  <div class="card">

    <small>
      Paid
    </small>

    <strong>
      ${money(paid)}
    </strong>

  </div>


  <div class="card">

    <small>
      Due
    </small>

    <strong>
      ${money(due)}
    </strong>

  </div>

</div>


<table>

<thead>

<tr>

<th>
Tenant
</th>

<th>
Room
</th>

<th>
Expected
</th>

<th>
Paid
</th>

<th>
Due
</th>

</tr>

</thead>


<tbody>

${rows}

</tbody>

</table>


<div class="footer">

AHR HOME RENT SYSTEM • PREMIUM

</div>


<script>

window.onload = function(){

  window.print();

};

</script>

</body>

</html>

`;


  const win =
    window.open(
      "",
      "_blank"
    );


  if(!win){

    alert(
      "Popup blocked. Please allow popups for this site."
    );

    return;

  }


  win.document.open();

  win.document.write(
    reportHTML
  );

  win.document.close();

}


/* ================= BACKUP ================= */

function backupDatabase(){

  const db =
    getDB();


  const admin =
    getAdmin();


  const backup = {

    system:
      "AHR Home Rent System",

    version:
      "5.0",

    exportedAt:
      new Date().toISOString(),

    database:
      db,

    admin:
      admin

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "AHR-Home-Rent-Backup.json";

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

  toast("Backup downloaded");

}


function restoreDatabase(file){

  if(!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function(){

      try{

        const data =
          JSON.parse(
            reader.result
          );


        if(
          !data.database ||
          !Array.isArray(
            data.database.tenants
          ) ||
          !Array.isArray(
            data.database.payments
          )
        ){

          alert(
            "Invalid AHR backup file."
          );

          return;

        }


        if(
          !confirm(
            "Restore backup? Current data will be replaced."
          )
        ){

          return;

        }


        saveDB(
          data.database
        );


        if(data.admin){

          localStorage.setItem(
            ADMIN_KEY,
            JSON.stringify(
              data.admin
            )
          );

        }


        refreshAll();

        toast(
          "Backup restored"
        );


      }catch(error){

        console.error(error);

        alert(
          "Could not read backup."
        );

      }

    };


  reader.readAsText(file);

}


/* ================= ADMIN SETTINGS ================= */

function loadAdminSettings(){

  const admin =
    getAdmin();

  $("adminEmail").value =
    admin.email;

}


function saveAdminSettings(){

  const admin =
    getAdmin();


  const email =
    $("adminEmail")
      .value
      .trim();


  const newPassword =
    $("newPassword")
      .value;


  if(!email){

    alert(
      "Admin email required."
    );

    return;

  }


  admin.email =
    email;


  if(newPassword){

    if(
      newPassword.length < 4
    ){

      alert(
        "Password must be at least 4 characters."
      );

      return;

    }

    admin.password =
      newPassword;

  }


  localStorage.setItem(
    ADMIN_KEY,
    JSON.stringify(admin)
  );


  $("newPassword").value = "";

  toast(
    "Admin settings saved"
  );

}


/* ================= CLEAR DATABASE ================= */

function clearDatabase(){

  const answer =
    prompt(
      "Type DELETE to clear all tenant and payment data."
    );


  if(answer !== "DELETE"){

    return;

  }


  localStorage.removeItem(
    DB_KEY
  );


  saveDB(
    defaultDatabase()
  );


  refreshAll();

  toast(
    "All data cleared"
  );

}


/* ================= PAYMENT MONTH FILTER ================= */

function populatePaymentMonths(){

  const select =
    $("paymentMonth");


  const oldValue =
    select.value;


  select.innerHTML =
    `
      <option value="">
        All Months
      </option>
    `;


  const db =
    getDB();


  const months =
    [
      ...new Set(
        db.payments
          .map(
            p => p.period
          )
          .filter(Boolean)
      )
    ]
    .sort()
    .reverse();


  if(
    !months.includes(
      currentMonth()
    )
  ){

    months.unshift(
      currentMonth()
    );

  }


  months.forEach(month => {

    select.innerHTML +=
      `
      <option value="${month}">
        ${month}
      </option>
      `;

  });


  if(
    months.includes(oldValue)
  ){

    select.value =
      oldValue;

  }

}


/* ================= REFRESH ================= */

function refreshAll(){

  renderDashboard();

  renderTenants();

  populatePaymentMonths();

  renderPayments();

  loadAdminSettings();

}


/* ================= TOAST ================= */

let toastTimer;


function toast(message){

  const el =
    $("toast");


  el.textContent =
    message;


  el.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        el.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* ================= EVENT LISTENERS ================= */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    /* LOGIN */

    $("loginBtn")
      .addEventListener(
        "click",
        login
      );


    $("demoBtn")
      .addEventListener(
        "click",
        demoLogin
      );


    $("logoutBtn")
      .addEventListener(
        "click",
        logout
      );


    $("password")
      .addEventListener(
        "keydown",
        function(event){

          if(
            event.key === "Enter"
          ){

            login();

          }

        }
      );


    /* NAV */

    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          function(){

            openPage(
              this.dataset.page
            );

          }
        );

      });


    /* TENANT */

    $("addTenantBtn")
      .addEventListener(
        "click",
        () => openTenantModal()
      );


    $("quickAddBtn")
      .addEventListener(
        "click",
        () => {

          openPage(
            "tenants"
          );

          openTenantModal();

        }
      );


    $("closeTenantModal")
      .addEventListener(
        "click",
        closeTenantModal
      );


    $("cancelTenant")
      .addEventListener(
        "click",
        closeTenantModal
      );


    $("tenantForm")
      .addEventListener(
        "submit",
        saveTenant
      );


    $("tenantSearch")
      .addEventListener(
        "input",
        renderTenants
      );


    $("tenantStatus")
      .addEventListener(
        "change",
        renderTenants
      );


    /* PAYMENT */

    $("addPaymentBtn")
      .addEventListener(
        "click",
        openPaymentModal
      );


    $("closePaymentModal")
      .addEventListener(
        "click",
        closePaymentModal
      );


    $("cancelPayment")
      .addEventListener(
        "click",
        closePaymentModal
      );


    $("paymentForm")
      .addEventListener(
        "submit",
        savePayment
      );


    $("paymentSearch")
      .addEventListener(
        "input",
        renderPayments
      );


    $("paymentMonth")
      .addEventListener(
        "change",
        renderPayments
      );


    /* REPORT */

    document
      .querySelectorAll(
        ".period-btn"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          function(){

            createReport(
              Number(
                this.dataset.months
              )
            );

          }
        );

      });


    $("pdfBtn")
      .addEventListener(
        "click",
        downloadPDF
      );


    /* ADMIN */

    $("saveAdminBtn")
      .addEventListener(
        "click",
        saveAdminSettings
      );


    $("backupBtn")
      .addEventListener(
        "click",
        backupDatabase
      );


    $("restoreFile")
      .addEventListener(
        "change",
        function(){

          restoreDatabase(
            this.files[0]
          );

        }
      );


    $("clearBtn")
      .addEventListener(
        "click",
        clearDatabase
      );


    /* REPORT DEFAULT */

    createReport(1);


    /* AUTH */

    const loggedIn =
      localStorage.getItem(
        AUTH_KEY
      ) === "1";


    if(loggedIn){

      showApp();

    }else{

      showLogin();

    }

  }
);


/* ================= GLOBAL FUNCTIONS ================= */

window.login =
  login;

window.demoLogin =
  demoLogin;

window.logout =
  logout;

window.editTenant =
  editTenant;

window.outTenant =
  outTenant;

window.restoreTenant =
  restoreTenant;

window.deleteTenant =
  deleteTenant;

window.deletePayment =
  deletePayment;

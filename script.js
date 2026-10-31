// ROADWATCH - BEGINNER JAVASCRIPT
// JavaScript makes the website interactive.

// 1. Get the HTML elements that we need.
const form = document.getElementById("reportForm");
const reportList = document.getElementById("reportList");
const message = document.getElementById("message");

const locationInput = document.getElementById("location");
const typeInput = document.getElementById("damageType");
const severityInput = document.getElementById("severity");
const descriptionInput = document.getElementById("description");
const photoInput = document.getElementById("photo");

const searchBox = document.getElementById("searchBox");
const statusFilter = document.getElementById("statusFilter");

// 2. Load reports saved in this browser.
// If there are no saved reports, use an empty array.
const STORAGE_KEY = "roadwatchReports";
let reports = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let photoData = "";

// 3. Read an optional photo selected by the user.
photoInput.addEventListener("change", function () {
    const file = photoInput.files[0];
    photoData = "";

    if (!file) return;

    if (file.size > 500 * 1024) {
        alert("Please choose an image smaller than 500 KB.");
        photoInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        photoData = reader.result;
    };

    reader.readAsDataURL(file);
});

// 4. When the form is submitted, create a report.
form.addEventListener("submit", function (event) {
    event.preventDefault(); // Stop the page from refreshing.

    const newReport = {
        id: "RW-" + Date.now(),
        location: locationInput.value.trim(),
        type: typeInput.value,
        severity: severityInput.value,
        description: descriptionInput.value.trim(),
        status: "Pending",
        date: new Date().toLocaleDateString(),
        photo: photoData
    };

    reports.unshift(newReport); // Add the new report at the top.
    saveReports();              // Save reports in this browser.
    showReports();              // Refresh the report list.

    form.reset();
    photoData = "";

    message.textContent = "Report submitted! Your ID is " + newReport.id;
    message.className = "success";
});

// 5. Save the reports in browser storage.
function saveReports() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

// 6. Display reports on the page.
function showReports() {
    reportList.innerHTML = "";

    const searchText = searchBox.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    // Keep only reports that match the search and status filter.
    const matchingReports = reports.filter(function (report) {
        const matchesSearch =
            report.location.toLowerCase().includes(searchText) ||
            report.type.toLowerCase().includes(searchText) ||
            report.id.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" || report.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    document.getElementById("noReports").style.display =
        matchingReports.length === 0 ? "block" : "none";

    matchingReports.forEach(function (report) {
        // Create a report card.
        const card = document.createElement("div");
        card.className = "report-card";

        const title = document.createElement("h3");
        title.textContent = report.location;

        const details = document.createElement("p");
        details.textContent = report.type + " | " + report.severity + " severity";

        const description = document.createElement("p");
        description.textContent = report.description;

        const info = document.createElement("div");
        info.className = "report-meta";
        info.textContent = "ID: " + report.id + " | Date: " + report.date;

        const status = document.createElement("span");
        status.className = "status";
        status.textContent = report.status;

        if (report.status === "In Progress") {
            status.classList.add("progress");
        } else if (report.status === "Resolved") {
            status.classList.add("resolved");
        }

        // Create a menu to update report status.
        const actions = document.createElement("div");
        actions.className = "actions";

        const statusMenu = document.createElement("select");
        statusMenu.innerHTML =
            '<option>Pending</option>' +
            '<option>In Progress</option>' +
            '<option>Resolved</option>';
        statusMenu.value = report.status;

        statusMenu.addEventListener("change", function () {
            report.status = statusMenu.value;
            saveReports();
            showReports();
        });

        // Create a delete button.
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";

        deleteButton.addEventListener("click", function () {
            if (confirm("Delete this report?")) {
                reports = reports.filter(function (item) {
                    return item.id !== report.id;
                });
                saveReports();
                showReports();
            }
        });

        actions.appendChild(statusMenu);
        actions.appendChild(deleteButton);

        card.appendChild(title);
        card.appendChild(details);
        card.appendChild(description);
        card.appendChild(info);
        card.appendChild(document.createElement("br"));
        card.appendChild(status);

        // Show the photo if the user selected one.
        if (report.photo) {
            const image = document.createElement("img");
            image.src = report.photo;
            image.alt = "Road damage photo";
            card.appendChild(image);
        }

        card.appendChild(actions);
        reportList.appendChild(card);
    });

    updateCounters();
}

// 7. Update the dashboard numbers.
function updateCounters() {
    document.getElementById("totalReports").textContent = reports.length;

    const pending = reports.filter(function (report) {
        return report.status === "Pending";
    }).length;

    const resolved = reports.filter(function (report) {
        return report.status === "Resolved";
    }).length;

    document.getElementById("pendingReports").textContent = pending;
    document.getElementById("resolvedReports").textContent = resolved;
}

// 8. Refresh reports when user searches or changes the filter.
searchBox.addEventListener("input", showReports);
statusFilter.addEventListener("change", showReports);

// 9. Show previously saved reports when the page opens.
showReports();

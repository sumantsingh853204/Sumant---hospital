// --- Initial Hospital Beds & Wards Data ---
const wardsData = [
    {
        id: "icu",
        name: "Intensive Care Unit (ICU)",
        type: "icu",
        icon: "fa-heart-pulse",
        beds: [
            { id: "ICU-01", status: "occupied", patient: { name: "Suresh Mehta", age: 58, gender: "Male", phone: "9812345678", severity: "Critical", doctor: "Dr. V. K. Gupta", admitTime: "2026-09-20 14:30" } },
            { id: "ICU-02", status: "occupied", patient: { name: "Anita Devi", age: 62, gender: "Female", phone: "9876512345", severity: "Critical", doctor: "Dr. V. K. Gupta", admitTime: "2026-09-21 08:15" } },
            { id: "ICU-03", status: "available" },
            { id: "ICU-04", status: "available" }
        ]
    },
    {
        id: "emergency",
        name: "Emergency Casualty Ward",
        type: "emergency",
        icon: "fa-truck-medical",
        beds: [
            { id: "EMG-01", status: "occupied", patient: { name: "Rajesh Kumar", age: 34, gender: "Male", phone: "9988776655", severity: "Moderate", doctor: "Dr. S. Sharma", admitTime: "2026-09-21 11:00" } },
            { id: "EMG-02", status: "available" },
            { id: "EMG-03", status: "available" },
            { id: "EMG-04", status: "reserved" } // Cleaning
        ]
    },
    {
        id: "general_m",
        name: "General Male Ward",
        type: "general",
        icon: "fa-mars",
        beds: [
            { id: "GEN-M1", status: "occupied", patient: { name: "Mohan Lal", age: 45, gender: "Male", phone: "9123456780", severity: "Normal", doctor: "Dr. P. Verma", admitTime: "2026-09-19 10:00" } },
            { id: "GEN-M2", status: "occupied", patient: { name: "Amit Singh", age: 29, gender: "Male", phone: "9234567890", severity: "Normal", doctor: "Dr. P. Verma", admitTime: "2026-09-20 16:20" } },
            { id: "GEN-M3", status: "available" },
            { id: "GEN-M4", status: "available" },
            { id: "GEN-M5", status: "available" },
            { id: "GEN-M6", status: "available" }
        ]
    },
    {
        id: "general_f",
        name: "General Female Ward",
        type: "general",
        icon: "fa-venus",
        beds: [
            { id: "GEN-F1", status: "occupied", patient: { name: "Sunita Sharma", age: 38, gender: "Female", phone: "9345678901", severity: "Normal", doctor: "Dr. R. Kapoor", admitTime: "2026-09-20 11:45" } },
            { id: "GEN-F2", status: "available" },
            { id: "GEN-F3", status: "available" },
            { id: "GEN-F4", status: "available" },
            { id: "GEN-F5", status: "available" },
            { id: "GEN-F6", status: "available" }
        ]
    },
    {
        id: "pediatric",
        name: "Pediatric Ward (Children)",
        type: "general",
        icon: "fa-child",
        beds: [
            { id: "PED-01", status: "occupied", patient: { name: "Master Aarav", age: 7, gender: "Male", phone: "9456789012", severity: "Moderate", doctor: "Dr. M. Roy", admitTime: "2026-09-21 09:10" } },
            { id: "PED-02", status: "available" },
            { id: "PED-03", status: "available" },
            { id: "PED-04", status: "available" }
        ]
    },
    {
        id: "opd_seats",
        name: "OPD Observation Recliner Seats",
        type: "opd",
        icon: "fa-chair",
        beds: [
            { id: "OPD-S1", status: "occupied", patient: { name: "Pooja Verma", age: 26, gender: "Female", phone: "9567890123", severity: "Normal", doctor: "Dr. S. Sharma", admitTime: "2026-09-21 11:30" } },
            { id: "OPD-S2", status: "available" },
            { id: "OPD-S3", status: "available" },
            { id: "OPD-S4", status: "available" }
        ]
    }
];

// --- Global Variables ---
let currentSelectedBed = null;
let activeFilter = "all";
let searchQuery = "";

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 60000);

    setupWardSelectDropdown();
    updateBedDropdown();
    renderWards();
    updateStats();
    setupEventListeners();
});

// Update Header Time
function updateTimeDisplay() {
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + 
                    " | " + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    document.getElementById("current-time-display").innerText = timeStr;
}

// Populate Wards Dropdown in Allotment Form
function setupWardSelectDropdown() {
    const wardSelect = document.getElementById("ward-select");
    wardSelect.innerHTML = "";
    wardsData.forEach(ward => {
        const option = document.createElement("option");
        option.value = ward.id;
        option.textContent = ward.name;
        wardSelect.appendChild(option);
    });
}

// Update Beds Available Dropdown based on Ward Selection
function updateBedDropdown() {
    const wardId = document.getElementById("ward-select").value;
    const bedSelect = document.getElementById("bed-select");
    bedSelect.innerHTML = "";

    const selectedWard = wardsData.find(w => w.id === wardId);
    if (!selectedWard) return;

    const availableBeds = selectedWard.beds.filter(b => b.status === "available");

    if (availableBeds.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "❌ No beds available";
        bedSelect.appendChild(option);
        bedSelect.disabled = true;
    } else {
        bedSelect.disabled = false;
        availableBeds.forEach(bed => {
            const option = document.createElement("option");
            option.value = bed.id;
            option.textContent = bed.id;
            bedSelect.appendChild(option);
        });
    }
}

// Render Wards & Beds Grid
function renderWards() {
    const container = document.getElementById("wards-container");
    container.innerHTML = "";

    wardsData.forEach(ward => {
        // Filter Check
        if (activeFilter !== "all" && ward.type !== activeFilter) return;

        // Search Query Filter
        let visibleBeds = ward.beds.filter(bed => {
            if (!searchQuery) return true;
            if (bed.id.toLowerCase().includes(searchQuery.toLowerCase())) return true;
            if (bed.patient && bed.patient.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
            return false;
        });

        if (searchQuery && visibleBeds.length === 0) return;

        const wardCard = document.createElement("div");
        wardCard.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden";

        const availableCount = ward.beds.filter(b => b.status === "available").length;
        const totalCount = ward.beds.length;

        wardCard.innerHTML = `
            <div class="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                    <i class="fa-solid ${ward.icon} text-teal-400 text-lg"></i>
                    <h3 class="font-bold text-sm sm:text-base">${ward.name}</h3>
                </div>
                <div class="text-xs font-semibold px-2.5 py-1 rounded-full ${availableCount > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}">
                    ${availableCount} / ${totalCount} Available
                </div>
            </div>
            <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                ${visibleBeds.map(bed => createBedCardHTML(bed, ward.id)).join('')}
            </div>
        `;

        container.appendChild(wardCard);
    });

    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
                <i class="fa-solid fa-bed-pulse text-4xl mb-2 text-slate-300"></i>
                <p>No beds or wards match your active filter / search query.</p>
            </div>
        `;
    }
}

// Generate Individual Bed Card HTML
function createBedCardHTML(bed, wardId) {
    let bgColor = "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100";
    let iconColor = "text-emerald-600";
    let statusBadge = `<span class="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">AVAILABLE</span>`;
    let patientDetails = `<p class="text-[11px] text-slate-500 mt-1 italic">Ready for allotment</p>`;
    let criticalClass = "";

    if (bed.status === "occupied") {
        bgColor = "bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100 cursor-pointer";
        iconColor = "text-rose-600";
        statusBadge = `<span class="bg-rose-200 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">OCCUPIED</span>`;
        if (bed.patient && bed.patient.severity === "Critical") {
            criticalClass = "pulse-critical";
        }
        patientDetails = `
            <p class="text-xs font-semibold text-slate-800 truncate mt-1">${bed.patient ? bed.patient.name : 'Occupied'}</p>
            <p class="text-[10px] text-slate-500">${bed.patient ? bed.patient.gender + ', ' + bed.patient.age + 'y' : ''}</p>
        `;
    } else if (bed.status === "reserved") {
        bgColor = "bg-amber-50 border-amber-300 text-amber-900 opacity-80 cursor-pointer";
        iconColor = "text-amber-600";
        statusBadge = `<span class="bg-amber-200 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">CLEANING</span>`;
        patientDetails = `<p class="text-[10px] text-slate-500 mt-1">Under Sanitization</p>`;
    }

    return `
        <div onclick="openBedDetailsModal('${wardId}', '${bed.id}')" class="border-2 rounded-xl p-3 flex flex-col justify-between transition-all duration-200 shadow-sm ${bgColor} ${criticalClass}">
            <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-xs tracking-wide">${bed.id}</span>
                <i class="fa-solid fa-bed ${iconColor}"></i>
            </div>
            ${patientDetails}
            <div class="mt-2 flex justify-between items-center">
                ${statusBadge}
                <i class="fa-solid fa-ellipsis-vertical text-slate-400 text-xs"></i>
            </div>
        </div>
    `;
}

// Update Top Statistics Summary
function updateStats() {
    let total = 0, available = 0, occupied = 0, reserved = 0;

    wardsData.forEach(w => {
        w.beds.forEach(b => {
            total++;
            if (b.status === "available") available++;
            else if (b.status === "occupied") occupied++;
            else if (b.status === "reserved") reserved++;
        });
    });

    document.getElementById("stat-total").innerText = total;
    document.getElementById("stat-available").innerText = available;
    document.getElementById("stat-occupied").innerText = occupied;
    document.getElementById("stat-reserved").innerText = reserved;
}

// Handle Form Submission (New Patient Allotment)
document.getElementById("allotment-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("patient-name").value.trim();
    const age = document.getElementById("patient-age").value;
    const gender = document.getElementById("patient-gender").value;
    const phone = document.getElementById("patient-phone").value.trim() || "N/A";
    const severity = document.getElementById("patient-severity").value;
    const wardId = document.getElementById("ward-select").value;
    const bedId = document.getElementById("bed-select").value;
    const doctor = document.getElementById("attending-doctor").value.trim() || "Dr. On Duty";

    if (!bedId) {
        alert("Please select an available bed.");
        return;
    }

    const ward = wardsData.find(w => w.id === wardId);
    const bed = ward ? ward.beds.find(b => b.id === bedId) : null;

    if (bed) {
        const now = new Date();
        const admitTimeStr = now.toISOString().split('T')[0] + " " + now.toTimeString().substring(0, 5);

        bed.status = "occupied";
        bed.patient = {
            name,
            age,
            gender,
            phone,
            severity,
            doctor,
            admitTime: admitTimeStr
        };

        // Reset Form
        document.getElementById("allotment-form").reset();
        
        // Refresh UI & Stats
        renderWards();
        updateStats();
        updateBedDropdown();

        // Show Printable Slip
        showAllotmentSlip(name, age, gender, ward.name, bed.id, doctor, admitTimeStr);
    }
});

// Setup Form Listeners & Filters
function setupEventListeners() {
    document.getElementById("ward-select").addEventListener("change", updateBedDropdown);

    // Search Box Listener
    document.getElementById("search-input").addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        renderWards();
    });

    // Filter Buttons Listener
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => {
                b.classList.remove("active", "bg-teal-600", "text-white", "border-teal-600");
                b.classList.add("bg-slate-50", "text-slate-600", "border-slate-200");
            });

            btn.classList.add("active", "bg-teal-600", "text-white", "border-teal-600");
            btn.classList.remove("bg-slate-50", "text-slate-600", "border-slate-200");

            activeFilter = btn.dataset.filter;
            renderWards();
        });
    });

    // Modal Close
    document.getElementById("close-modal").addEventListener("click", closeModal);
    document.getElementById("close-slip-modal").addEventListener("click", () => {
        document.getElementById("slip-modal").classList.add("hidden");
    });
}

// Open Bed Modal for View / Transfer / Discharge
function openBedDetailsModal(wardId, bedId) {
    const ward = wardsData.find(w => w.id === wardId);
    const bed = ward ? ward.beds.find(b => b.id === bedId) : null;

    if (!bed) return;

    currentSelectedBed = { wardId, bed };

    const modal = document.getElementById("bed-modal");
    const title = document.getElementById("modal-bed-title");
    const body = document.getElementById("modal-body");
    const actions = document.getElementById("modal-actions");

    title.innerText = `${bed.id} - (${ward.name})`;

    if (bed.status === "available") {
        body.innerHTML = `
            <div class="text-center py-6">
                <i class="fa-solid fa-circle-check text-emerald-500 text-5xl mb-3"></i>
                <h4 class="font-bold text-slate-800 text-lg">Bed Available</h4>
                <p class="text-xs text-slate-500 max-w-xs mx-auto mt-1">This bed is clean and ready for new patient assignment from the left control form.</p>
            </div>
        `;
        actions.innerHTML = `
            <button onclick="closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded-lg font-medium">Close</button>
        `;
    } else if (bed.status === "occupied") {
        const p = bed.patient;
        body.innerHTML = `
            <div class="space-y-3 text-xs">
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase font-semibold">PATIENT NAME</span>
                            <h4 class="text-base font-bold text-slate-800">${p.name}</h4>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}">${p.severity} Severity</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-slate-600">
                        <div><strong>Age / Gender:</strong> ${p.age} Yrs / ${p.gender}</div>
                        <div><strong>Contact:</strong> ${p.phone}</div>
                        <div><strong>Doctor:</strong> ${p.doctor}</div>
                        <div><strong>Admitted On:</strong> ${p.admitTime}</div>
                    </div>
                </div>
            </div>
        `;

        actions.innerHTML = `
            <button onclick="showTransferOptions('${wardId}', '${bed.id}')" class="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-2 rounded-lg font-medium flex items-center space-x-1">
                <i class="fa-solid fa-right-left"></i>
                <span>Transfer Bed</span>
            </button>
            <button onclick="dischargePatient('${wardId}', '${bed.id}')" class="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-2 rounded-lg font-medium flex items-center space-x-1">
                <i class="fa-solid fa-user-check"></i>
                <span>Discharge Patient</span>
            </button>
        `;
    } else if (bed.status === "reserved") {
        body.innerHTML = `
            <div class="text-center py-6">
                <i class="fa-solid fa-broom text-amber-500 text-5xl mb-3"></i>
                <h4 class="font-bold text-slate-800 text-lg">Under Sanitization</h4>
                <p class="text-xs text-slate-500 max-w-xs mx-auto mt-1">This bed was recently discharged and is undergoing housekeeping.</p>
            </div>
        `;
        actions.innerHTML = `
            <button onclick="markBedAvailable('${wardId}', '${bed.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 rounded-lg font-medium">Mark Clean & Available</button>
            <button onclick="closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded-lg font-medium">Close</button>
        `;
    }

    modal.classList.remove("hidden");
}

function closeModal() {
    document.getElementById("bed-modal").classList.add("hidden");
}

// Mark Reserved Bed Back To Available
function markBedAvailable(wardId, bedId) {
    const ward = wardsData.find(w => w.id === wardId);
    const bed = ward ? ward.beds.find(b => b.id === bedId) : null;

    if (bed) {
        bed.status = "available";
        renderWards();
        updateStats();
        updateBedDropdown();
        closeModal();
    }
}

// Discharge Patient Function
function dischargePatient(wardId, bedId) {
    if (!confirm("Are you sure you want to discharge this patient? Bed will be marked for cleaning.")) return;

    const ward = wardsData.find(w => w.id === wardId);
    const bed = ward ? ward.beds.find(b => b.id === bedId) : null;

    if (bed) {
        bed.status = "reserved"; // Mark for cleaning
        delete bed.patient;

        renderWards();
        updateStats();
        updateBedDropdown();
        closeModal();
    }
}

// Transfer Bed Function
function showTransferOptions(wardId, bedId) {
    const body = document.getElementById("modal-body");
    const actions = document.getElementById("modal-actions");

    let availableOptionsHTML = "";
    wardsData.forEach(w => {
        w.beds.forEach(b => {
            if (b.status === "available") {
                availableOptionsHTML += `<option value="${w.id}:${b.id}">${w.name} - ${b.id}</option>`;
            }
        });
    });

    if (!availableOptionsHTML) {
        alert("No available beds in any ward for transfer.");
        return;
    }

    body.innerHTML = `
        <div class="space-y-3">
            <p class="text-xs text-slate-600 font-medium">Select a target bed to transfer this patient:</p>
            <select id="transfer-target-select" class="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                ${availableOptionsHTML}
            </select>
        </div>
    `;

    actions.innerHTML = `
        <button onclick="executeTransfer('${wardId}', '${bedId}')" class="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-2 rounded-lg font-medium">Confirm Transfer</button>
        <button onclick="closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded-lg font-medium">Cancel</button>
    `;
}

function executeTransfer(oldWardId, oldBedId) {
    const targetValue = document.getElementById("transfer-target-select").value;
    const [newWardId, newBedId] = targetValue.split(":");

    const oldWard = wardsData.find(w => w.id === oldWardId);
    const oldBed = oldWard ? oldWard.beds.find(b => b.id === oldBedId) : null;

    const newWard = wardsData.find(w => w.id === newWardId);
    const newBed = newWard ? newWard.beds.find(b => b.id === newBedId) : null;

    if (oldBed && newBed && oldBed.patient) {
        newBed.status = "occupied";
        newBed.patient = { ...oldBed.patient };

        oldBed.status = "reserved"; // Mark old bed for sanitization
        delete oldBed.patient;

        renderWards();
        updateStats();
        updateBedDropdown();
        closeModal();
    }
}

// Display Printable Allotment Slip Modal
function showAllotmentSlip(name, age, gender, wardName, bedId, doctor, admitDate) {
    document.getElementById("slip-id").innerText = `#SH-` + Math.floor(1000 + Math.random() * 9000);
    document.getElementById("slip-name").innerText = name;
    document.getElementById("slip-age-gender").innerText = `${age} Yrs / ${gender}`;
    document.getElementById("slip-ward").innerText = wardName;
    document.getElementById("slip-bed").innerText = bedId;
    document.getElementById("slip-doctor").innerText = doctor;
    document.getElementById("slip-date").innerText = admitDate;

    document.getElementById("slip-modal").classList.remove("hidden");
}

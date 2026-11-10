// ======================================
// AUTOLEAD BENGALURU - DEALER DASHBOARD
// Developed by Mohammed Zuhaib
// ======================================

const SUPABASE_URL = "https://upskbpteegbiiyhdurdl.supabase.co";

// Paste your existing public Supabase key here
const SUPABASE_KEY = "sb_publishable_4jwztvCOVnTFUrmqjdyhdQ_LI8MpL87";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let currentUser = null;
let currentDealer = null;

const loginForm = document.getElementById("loginForm");
const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const loginMessage = document.getElementById("loginMessage");
const pageMessage = document.getElementById("pageMessage");
const leadsList = document.getElementById("leadsList");
const leadCount = document.getElementById("leadCount");
const logoutBtn = document.getElementById("logoutBtn");

const statuses = [
    "New",
    "Contacted",
    "Interested",
    "Visit Scheduled",
    "Sold",
    "Not Interested"
];

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = "message " + type;
}

function clearMessage(element) {
    element.textContent = "";
    element.className = "message";
}

function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ======================================
// DEALER LOGIN
// ======================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    clearMessage(loginMessage);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const loginBtn = document.getElementById("loginBtn");

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        const { data, error } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        currentUser = data.user;

        await loadDealerProfile();

    } catch (error) {

        showMessage(loginMessage, error.message, "error");

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";

    }

});

// ======================================
// LOAD DEALER PROFILE
// ======================================

async function loadDealerProfile() {

    showMessage(loginMessage, "Loading your account...", "success");

    const { data, error } = await db
        .from("dealer_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    if (error) {
        showMessage(loginMessage, error.message, "error");
        return;
    }

    if (!data) {
        showMessage(
            loginMessage,
            "Dealer profile not found. Contact administrator.",
            "error"
        );
        return;
    }

    currentDealer = data;

    loginBox.style.display = "none";
    dashboard.style.display = "block";
    logoutBtn.style.display = "block";

    document.getElementById("dealerName").textContent =
        "Welcome, " + (currentDealer.dealer_name || "Dealer");

    clearMessage(loginMessage);

    await loadAssignedLeads();
}

// ======================================
// LOAD ASSIGNED ENQUIRIES
// ======================================

async function loadAssignedLeads() {

    clearMessage(pageMessage);

    leadsList.innerHTML =
        '<div class="empty">Loading enquiries...</div>';

    leadCount.textContent = "Loading...";

    const { data, error } = await db
        .from("customer_leads")
        .select("*")
        .eq("assigned_dealer_id", currentDealer.id)
        .order("created_at", { ascending: false });

    if (error) {

        leadsList.innerHTML = "";

        showMessage(pageMessage, error.message, "error");

        return;
    }

    leadCount.textContent =
        (data.length || 0) + " assigned enquiries";

    if (!data || data.length === 0) {

        leadsList.innerHTML = `
            <div class="box empty">
                <h3>No enquiries yet</h3>
                <p>New enquiries assigned to you will appear here.</p>
            </div>
        `;

        return;
    }

    leadsList.innerHTML = data.map(lead => {

        const status = statuses.includes(lead.lead_status)
            ? lead.lead_status
            : "New";

        const phone = String(lead.phone || "").replace(/\D/g, "");

        const whatsappNumber = phone.startsWith("91")
            ? phone
            : "91" + phone;

        const whatsappLink = phone
            ? "https://wa.me/" + whatsappNumber +
              "?text=" + encodeURIComponent(
                  "Hello " + (lead.name || "Customer") +
                  ", I am contacting you regarding your car enquiry on AutoLead Bengaluru."
              )
            : "";

        return `

        <div class="lead-card">

            <h3>${safeText(lead.name || "Customer")}</h3>

            <div class="lead-info">

                <strong>Phone:</strong>
                ${safeText(lead.phone || "Not provided")}<br>

                <strong>Car:</strong>
                ${safeText(lead.car || "Not specified")}<br>

                <strong>Budget:</strong>
                ${safeText(lead.budget || "Not specified")}<br>

                <strong>Location:</strong>
                ${safeText(lead.location || "Not specified")}<br>

                <strong>Timeline:</strong>
                ${safeText(lead.timeline || "Not specified")}<br>

                <strong>Message:</strong>
                ${safeText(lead.message || "No message")}<br>

                <strong>Status:</strong>
                ${safeText(status)}

            </div>

            <label><strong>Update Status</strong></label>

            <div class="status-row">

                <select id="status-${safeText(lead.id)}">

                    ${statuses.map(item => `
                        <option value="${safeText(item)}"
                        ${item === status ? "selected" : ""}>
                        ${safeText(item)}
                        </option>
                    `).join("")}

                </select>

                <button class="save"
                onclick="updateLeadStatus('${safeText(lead.id)}', this)">
                    Save Status
                </button>

            </div>

            ${
                whatsappLink
                ? `<a class="whatsapp"
                    href="${whatsappLink}"
                    target="_blank"
                    rel="noopener">
                    Contact Customer on WhatsApp
                   </a>`
                : ""
            }

        </div>

        `;

    }).join("");

}

// ======================================
// UPDATE ENQUIRY STATUS
// ======================================

async function updateLeadStatus(leadId, button) {

    const select = document.getElementById("status-" + leadId);

    if (!select) return;

    const newStatus = select.value;

    if (!statuses.includes(newStatus)) {
        showMessage(pageMessage, "Invalid status.", "error");
        return;
    }

    button.disabled = true;
    button.textContent = "Saving...";

    const { error } = await db
        .from("customer_leads")
        .update({
            lead_status: newStatus
        })
        .eq("id", leadId)
        .eq("assigned_dealer_id", currentDealer.id);

    button.disabled = false;
    button.textContent = "Save Status";

    if (error) {

        showMessage(
            pageMessage,
            "Status update failed: " + error.message,
            "error"
        );

        return;
    }

    showMessage(
        pageMessage,
        "Enquiry status updated successfully!",
        "success"
    );

}

// ======================================
// REFRESH ENQUIRIES
// ======================================

document.getElementById("refreshBtn")
.addEventListener("click", loadAssignedLeads);

// ======================================
// LOGOUT
// ======================================

logoutBtn.addEventListener("click", async function() {

    await db.auth.signOut();

    currentUser = null;
    currentDealer = null;

    dashboard.style.display = "none";
    loginBox.style.display = "block";
    logoutBtn.style.display = "none";

    loginForm.reset();
    leadsList.innerHTML = "";
    leadCount.textContent = "";

    clearMessage(loginMessage);
    clearMessage(pageMessage);

});

// ======================================
// CHECK EXISTING LOGIN
// ======================================

async function checkSession() {

    const { data, error } = await db.auth.getSession();

    if (error) {
        console.error(error.message);
        return;
    }

    if (data.session) {

        currentUser = data.session.user;

        await loadDealerProfile();

    }

}

checkSession();
const storageKey = "autolead_leads";

function getLeads() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveLeads(leads) {
  localStorage.setItem(storageKey, JSON.stringify(leads));
}

function updateDashboard() {
  const leads = getLeads();
  
  document.getElementById("totalLeads").textContent = leads.length;
  
  document.getElementById("newLeads").textContent =
    leads.filter(l => l.status === "New").length;
  
  document.getElementById("contactedLeads").textContent =
    leads.filter(l => l.status === "Contacted").length;
  
  document.getElementById("convertedLeads").textContent =
    leads.filter(l => l.status === "Converted").length;
  
  displayLeads();
}

function displayLeads() {
  const leads = getLeads();
  const filter = document.getElementById("filterStatus").value;
  const container = document.getElementById("leadList");
  
  container.innerHTML = "";
  
  const filtered = leads.filter(lead =>
    filter === "All" || lead.status === filter
  );
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty">No enquiries found.</div>';
    return;
  }
  
  filtered.slice().reverse().forEach(lead => {
    const card = document.createElement("div");
    card.className = "lead-card";
    
    const heading = document.createElement("h3");
    heading.textContent = lead.name;
    
    const details = document.createElement("p");
    details.textContent =
      "Phone: " + lead.phone +
      "\nCar: " + lead.car +
      "\nBudget: " + lead.budget +
      "\nLocation: " + lead.location +
      "\nBuying: " + lead.timeline +
      "\nDate: " + lead.date;
    
    details.style.whiteSpace = "pre-line";
    
    const status = document.createElement("select");
    
    ["New", "Contacted", "Converted"].forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      status.appendChild(option);
    });
    
    status.value = lead.status || "New";
    
    status.addEventListener("change", () => {
      const allLeads = getLeads();
      const index = allLeads.findIndex(l => l.id === lead.id);
      
      if (index !== -1) {
        allLeads[index].status = status.value;
        saveLeads(allLeads);
        updateDashboard();
      }
    });
    
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete Enquiry";
    
    deleteButton.addEventListener("click", () => {
      if (!confirm("Are you sure you want to delete this enquiry?")) {
        return;
      }
      
      saveLeads(getLeads().filter(l => l.id !== lead.id));
      updateDashboard();
    });
    
    card.append(heading, details, status, deleteButton);
    container.appendChild(card);
  });
}

document.getElementById("filterStatus").addEventListener("change", displayLeads);

updateDashboard();
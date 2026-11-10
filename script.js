const SUPABASE_URL = "https://upskbpteegbiiyhdurdl.supabase.co";

// Use your existing public publishable/anon key.
const SUPABASE_KEY = "sb_publishable_4jwztvCOVnTFUrmqjdyhdQ_LI8MpL87";

const form = document.getElementById("leadForm");
const messageBox = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Category buttons
document.querySelectorAll(".car-card").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("car").value = button.dataset.car;
        
        document.getElementById("enquiry").scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Show message
function showMessage(text, success) {
    messageBox.textContent = text;
    messageBox.style.display = "block";
    messageBox.style.padding = "14px";
    messageBox.style.marginTop = "15px";
    messageBox.style.borderRadius = "10px";
    messageBox.style.background = success ? "#dcfce7" : "#fee2e2";
    messageBox.style.color = success ? "#166534" : "#991b1b";
}

// Submit enquiry
form.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    messageBox.style.display = "none";
    
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const car = document.getElementById("car").value;
    const budget = document.getElementById("budget").value;
    const location = document.getElementById("location").value.trim();
    const timeline = document.getElementById("timeline").value;
    const consent = document.getElementById("consent").checked;
    
    if (!name || !phone || !car || !budget || !location || !timeline) {
        showMessage("Please complete all fields.", false);
        return;
    }
    
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
        showMessage("Please enter a valid 10-digit Indian mobile number.", false);
        return;
    }
    
    if (!consent) {
        showMessage("Please agree to the contact consent.", false);
        return;
    }
    
    if (!window.supabase) {
        showMessage("Connection library could not load. Check your internet and reload the website.", false);
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting enquiry...";
    
    try {
        const {error } = await db
            .from("customer_leads")
            .insert([{
                name: name,
                phone: phone,
                car: car,
                budget: budget,
                location: location,
                timeline: timeline,
                message: ""
            }])
            .select();
        
        if (error) {
            console.error("Supabase enquiry error:", error);
            showMessage("Could not save enquiry: " + error.message, false);
            return;
        }
        
        form.reset();
        
        showMessage(
            "Success! Your car enquiry has been submitted. Our team will contact you soon.",
            true
        );
        
    } catch (error) {
        console.error("Submission error:", error);
        showMessage("Connection problem: " + error.message, false);
        
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit My Enquiry →";
    }
});
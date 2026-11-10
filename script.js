// =====================================
// AUTOLEAD BENGALURU
// Designed & Developed by Mohammed Zuhaib
// =====================================

// SUPABASE CONNECTION
const SUPABASE_URL = "https://upskbpteegbiiyhdurdl.supabase.co";

const SUPABASE_KEY = "sb_publishable_4jwztvCOVnTFUrmqjdyhdQ_LI8MpL87";

// CREATE DATABASE CONNECTION
const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// FORM ELEMENTS
const form = document.getElementById("leadForm");
const messageBox = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

// =====================================
// CAR SELECTION BUTTONS
// =====================================

document.querySelectorAll(".car-card").forEach(button => {

    button.addEventListener("click", () => {

        const carInput = document.getElementById("car");

        carInput.value = button.dataset.car;

        const enquirySection = document.getElementById("enquiry");

        if (enquirySection) {
            enquirySection.scrollIntoView({
                behavior: "smooth"
            });
        }

    });

});

// =====================================
// DISPLAY MESSAGE
// =====================================

function showMessage(text, success) {

    messageBox.textContent = text;

    messageBox.style.display = "block";
    messageBox.style.padding = "14px";
    messageBox.style.marginTop = "15px";
    messageBox.style.borderRadius = "10px";

    messageBox.style.background = success
        ? "#dcfce7"
        : "#fee2e2";

    messageBox.style.color = success
        ? "#166534"
        : "#991b1b";

}

// =====================================
// CUSTOMER ENQUIRY SUBMISSION
// =====================================

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    messageBox.style.display = "none";

    // GET FORM VALUES

    const name = document.getElementById("name").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const car = document.getElementById("car").value;

    const budget = document.getElementById("budget").value;

    const location = document.getElementById("location").value.trim();

    const timeline = document.getElementById("timeline").value;

    const consent = document.getElementById("consent").checked;

    // VALIDATION

    if (!name || !phone || !car || !budget || !location || !timeline) {

        showMessage("Please complete all fields.", false);

        return;
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {

        showMessage(
            "Please enter a valid 10-digit Indian mobile number.",
            false
        );

        return;
    }

    if (!consent) {

        showMessage(
            "Please agree to the contact consent.",
            false
        );

        return;
    }

    // CHECK CONNECTION

    if (!window.supabase) {

        showMessage(
            "Connection error. Please refresh the website.",
            false
        );

        return;
    }

    // DISABLE BUTTON

    submitBtn.disabled = true;

    submitBtn.textContent = "Submitting enquiry...";

    // SAVE TO SUPABASE

    try {

        const { error } = await db
            .from("customer_leads")
            .insert([

                {
                    name: name,
                    phone: phone,
                    car: car,
                    budget: budget,
                    location: location,
                    timeline: timeline,
                    message: ""
                }

            ]);

        if (error) {

            console.error("SUPABASE ERROR:", error);

            showMessage(
                "Could not save enquiry: " + error.message,
                false
            );

            return;
        }

        // SUCCESS

        form.reset();

        showMessage(
            "Success! Your car enquiry has been submitted. Our team will contact you soon.",
            true
        );

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Connection problem: " + error.message,
            false
        );

    }

    finally {

        submitBtn.disabled = false;

        submitBtn.textContent = "Submit My Enquiry →";

    }

});

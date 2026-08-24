"use strict";

const interestPrograms = {
    adoption: {
        label: "Adoption",
        heading: "Start with an adoption conversation",
        description: "If you are ready to add a pet to your household, the adoption process is the best place to start. A rescue team member can help you review available pets and talk through what will work well in your home.",
        actionText: "Ask About Adoption"
    },
    foster: {
        label: "Fostering",
        heading: "Give a pet a temporary place to land",
        description: "Fostering is a good fit if you can provide a safe temporary home while a pet waits for adoption. The rescue provides guidance and stays in contact so foster families have support along the way.",
        actionText: "Ask About Fostering"
    },
    volunteer: {
        label: "Volunteering",
        heading: "Use your time to support the rescue",
        description: "Volunteers can help with events, transportation, outreach, and other rescue needs. This option works well if you want to help animals but cannot adopt or foster right now.",
        actionText: "Ask About Volunteering"
    }
};

const programOrder = ["adoption", "foster", "volunteer"];
const availabilityIds = ["weekday", "evening", "weekend"];
const validationFields = ["full-name", "email", "interest", "message"];

function saveInterest(value) {
    if (interestPrograms[value]) {
        localStorage.setItem("rescueInterest", value);
    }
}

function loadInterest() {
    const saved = localStorage.getItem("rescueInterest");
    return interestPrograms[saved] ? saved : "";
}

function populateInterestTool(select) {
    programOrder.forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = interestPrograms[key].label;
        select.appendChild(option);
    });
}

function showInterestResult(value, restored = false) {
    const result = document.querySelector("#interest-result");
    const heading = document.querySelector("#interest-result-heading");
    const description = document.querySelector("#interest-result-text");
    const action = document.querySelector("#interest-result-link");
    const status = document.querySelector("#interest-save-status");

    if (!result || !interestPrograms[value]) {
        return;
    }

    const program = interestPrograms[value];
    heading.textContent = program.heading;
    description.textContent = program.description;
    action.textContent = program.actionText;
    action.href = `contact.html?interest=${encodeURIComponent(value)}`;
    result.hidden = false;

    if (status) {
        status.hidden = false;
        status.textContent = restored
            ? `Your saved ${program.label.toLowerCase()} choice was restored.`
            : `${program.label} was saved for your next visit.`;
    }
}

function initInterestTool() {
    const select = document.querySelector("#help-interest");
    const button = document.querySelector("#show-interest");

    if (!select || !button) {
        return;
    }

    populateInterestTool(select);
    const saved = loadInterest();
    if (saved) {
        select.value = saved;
        showInterestResult(saved, true);
    }

    button.addEventListener("click", () => {
        const value = select.value;
        const selectError = document.querySelector("#help-interest-error");

        if (!interestPrograms[value]) {
            if (selectError) {
                selectError.textContent = "Choose adoption, fostering, or volunteering first.";
            }
            select.focus();
            return;
        }

        if (selectError) {
            selectError.textContent = "";
        }
        saveInterest(value);
        showInterestResult(value);
    });
}

function getInterestFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("interest");
    return interestPrograms[value] ? value : "";
}

function saveAvailability() {
    const selected = availabilityIds.filter((id) => {
        const checkbox = document.getElementById(id);
        return checkbox && checkbox.checked;
    });
    localStorage.setItem("rescueAvailability", JSON.stringify(selected));
}

function loadAvailability() {
    try {
        const saved = JSON.parse(localStorage.getItem("rescueAvailability") || "[]");
        return Array.isArray(saved) ? saved.filter((id) => availabilityIds.includes(id)) : [];
    } catch (error) {
        return [];
    }
}

function restoreContactChoices() {
    const interestSelect = document.querySelector("#interest");
    const storageStatus = document.querySelector("#storage-status");
    if (!interestSelect) {
        return;
    }

    const urlInterest = getInterestFromUrl();
    const savedInterest = loadInterest();
    const interestToUse = urlInterest || savedInterest;
    const savedAvailability = loadAvailability();
    let restoredSomething = false;

    if (interestToUse) {
        interestSelect.value = interestToUse;
        saveInterest(interestToUse);
        restoredSomething = true;
    }

    savedAvailability.forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = true;
            restoredSomething = true;
        }
    });

    if (restoredSomething && storageStatus) {
        const programLabel = interestPrograms[interestToUse]?.label;
        const parts = [];
        if (programLabel) {
            parts.push(`${programLabel} interest`);
        }
        if (savedAvailability.length) {
            parts.push("availability choices");
        }
        storageStatus.textContent = `Saved ${parts.join(" and ")} restored from your last visit.`;
        storageStatus.hidden = false;
    }
}

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-error`);
    if (!field || !error) {
        return;
    }

    error.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateName() {
    const field = document.querySelector("#full-name");
    const value = field ? field.value.trim() : "";
    if (value.length < 2 || !/^[A-Za-z .'-]+$/.test(value)) {
        setFieldError("full-name", "Enter your full name using at least two letters.");
        return false;
    }
    setFieldError("full-name", "");
    return true;
}

function validateEmail() {
    const field = document.querySelector("#email");
    const value = field ? field.value.trim() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
        setFieldError("email", "Enter a complete email address, such as name@example.com.");
        return false;
    }
    setFieldError("email", "");
    return true;
}

function validateInterest() {
    const field = document.querySelector("#interest");
    const value = field ? field.value : "";
    if (!interestPrograms[value]) {
        setFieldError("interest", "Choose whether you are interested in volunteering, fostering, or adoption information.");
        return false;
    }
    setFieldError("interest", "");
    return true;
}

function validateMessage() {
    const field = document.querySelector("#message");
    const value = field ? field.value.trim() : "";
    if (value.length < 10) {
        setFieldError("message", "Add a short message of at least 10 characters so we know how to help.");
        return false;
    }
    setFieldError("message", "");
    return true;
}

function initContactForm() {
    const form = document.querySelector("#interest-form");
    if (!form) {
        return;
    }

    restoreContactChoices();

    availabilityIds.forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener("change", saveAvailability);
        }
    });

    const interest = document.querySelector("#interest");
    if (interest) {
        interest.addEventListener("change", () => {
            if (interestPrograms[interest.value]) {
                saveInterest(interest.value);
            }
            validateInterest();
        });
    }

    const validators = {
        "full-name": validateName,
        email: validateEmail,
        interest: validateInterest,
        message: validateMessage
    };

    validationFields.forEach((id) => {
        const field = document.getElementById(id);
        if (field && validators[id]) {
            field.addEventListener("blur", validators[id]);
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const results = [validateName(), validateEmail(), validateInterest(), validateMessage()];
        const firstInvalidIndex = results.findIndex((result) => !result);
        const success = document.querySelector("#form-success");

        if (firstInvalidIndex !== -1) {
            if (success) {
                success.hidden = true;
            }
            const invalidField = document.getElementById(validationFields[firstInvalidIndex]);
            if (invalidField) {
                invalidField.focus();
            }
            return;
        }

        saveAvailability();
        if (interest) {
            saveInterest(interest.value);
        }
        if (success) {
            success.textContent = "Your information looks good. This sample site does not send the form to a live rescue database, but the validation is complete.";
            success.hidden = false;
            success.focus();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initInterestTool();
    initContactForm();
});

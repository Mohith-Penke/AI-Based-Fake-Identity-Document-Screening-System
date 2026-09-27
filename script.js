/* =========================================================
   IDENTIS — AI IDENTITY & DOCUMENT SCREENING SYSTEM
   FRONTEND SCREENING ENGINE
========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const documentInput = document.getElementById("documentInput");
const uploadBox = document.querySelector(".upload-box");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const removeFile = document.getElementById("removeFile");

const analyzeBtn = document.getElementById("analyzeBtn");

const scanPercentage = document.getElementById("scanPercentage");
const documentStatus = document.getElementById("documentStatus");
const ocrStatus = document.getElementById("ocrStatus");
const riskStatus = document.getElementById("riskStatus");
const finalStatus = document.getElementById("finalStatus");

const resultPanel = document.getElementById("resultPanel");
const riskBadge = document.getElementById("riskBadge");
const riskScore = document.getElementById("riskScore");

const resultFile = document.getElementById("resultFile");
const recommendation = document.getElementById("recommendation");
const findingsList = document.getElementById("findingsList");

let selectedFile = null;
let scanTimer = null;


/* =========================================================
   INITIAL STATE
========================================================= */

function resetAnalysis() {

    scanPercentage.textContent = "0%";

    documentStatus.textContent = "WAITING";
    ocrStatus.textContent = "PENDING";
    riskStatus.textContent = "PENDING";
    finalStatus.textContent = "PENDING";

    resultPanel.classList.add("hidden");

    riskBadge.textContent = "LOW RISK";
    riskBadge.style.color = "";
    riskBadge.style.borderColor = "";
    riskBadge.style.background = "";

    riskScore.textContent = "0";
    riskScore.style.color = "";

    resultFile.textContent = "—";
    recommendation.textContent = "—";

    findingsList.innerHTML = `
        <li>Waiting for analysis...</li>
    `;
}


/* =========================================================
   FILE SIZE FORMAT
========================================================= */

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}


/* =========================================================
   FILE VALIDATION
========================================================= */

function isValidFile(file) {

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    const allowedExtensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    ];

    const extension = "." + file.name.split(".").pop().toLowerCase();

    return (
        allowedTypes.includes(file.type) ||
        allowedExtensions.includes(extension)
    );
}


/* =========================================================
   DISPLAY SELECTED FILE
========================================================= */

function handleFile(file) {

    if (!file) {
        return;
    }

    if (!isValidFile(file)) {

        alert(
            "Invalid document format.\n\nPlease upload PDF, JPG, JPEG or PNG."
        );

        return;
    }

    selectedFile = file;

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    fileInfo.classList.remove("hidden");

    analyzeBtn.disabled = false;

    documentStatus.textContent = "READY";

    resetAnalysis();

    documentStatus.textContent = "READY";
}


/* =========================================================
   FILE INPUT
========================================================= */

documentInput.addEventListener("change", function () {

    const file = this.files[0];

    handleFile(file);
});


/* =========================================================
   REMOVE FILE
========================================================= */

removeFile.addEventListener("click", function () {

    selectedFile = null;

    documentInput.value = "";

    fileInfo.classList.add("hidden");

    analyzeBtn.disabled = true;

    resetAnalysis();
});


/* =========================================================
   DRAG & DROP
========================================================= */

uploadBox.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadBox.classList.add("drag-over");
});


uploadBox.addEventListener("dragleave", function () {

    uploadBox.classList.remove("drag-over");
});


uploadBox.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadBox.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (!file) {
        return;
    }

    handleFile(file);

    /*
       Synchronize the file input so the selected
       document can also be accessed normally.
    */

    try {

        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);

        documentInput.files = dataTransfer.files;

    } catch (error) {

        console.log(
            "Browser does not allow direct file input synchronization."
        );
    }
});


/* =========================================================
   ANALYSIS ENGINE
========================================================= */

function startAnalysis() {

    if (!selectedFile) {
        alert("Please upload a document first.");
        return;
    }

    analyzeBtn.disabled = true;

    resultPanel.classList.add("hidden");

    let progress = 0;

    scanPercentage.textContent = "0%";

    documentStatus.textContent = "PROCESSING";
    ocrStatus.textContent = "SCANNING";
    riskStatus.textContent = "ANALYZING";
    finalStatus.textContent = "PROCESSING";

    clearInterval(scanTimer);

    scanTimer = setInterval(function () {

        progress += Math.floor(Math.random() * 7) + 2;

        if (progress > 100) {
            progress = 100;
        }

        scanPercentage.textContent = `${progress}%`;

        updateAnalysisStages(progress);

        if (progress >= 100) {

            clearInterval(scanTimer);

            finishAnalysis();
        }

    }, 120);
}


/* =========================================================
   ANALYSIS STAGES
========================================================= */

function updateAnalysisStages(progress) {

    if (progress < 25) {

        documentStatus.textContent = "READING";
        ocrStatus.textContent = "SCANNING";
        riskStatus.textContent = "WAITING";
        finalStatus.textContent = "WAITING";

    } else if (progress < 50) {

        documentStatus.textContent = "DETECTED";
        ocrStatus.textContent = "EXTRACTING";
        riskStatus.textContent = "WAITING";
        finalStatus.textContent = "WAITING";

    } else if (progress < 75) {

        documentStatus.textContent = "DETECTED";
        ocrStatus.textContent = "EXTRACTED";
        riskStatus.textContent = "ANALYZING";
        finalStatus.textContent = "WAITING";

    } else if (progress < 100) {

        documentStatus.textContent = "VALIDATED";
        ocrStatus.textContent = "VERIFIED";
        riskStatus.textContent = "CALCULATING";
        finalStatus.textContent = "PROCESSING";

    } else {

        documentStatus.textContent = "VALIDATED";
        ocrStatus.textContent = "VERIFIED";
        riskStatus.textContent = "COMPLETED";
        finalStatus.textContent = "READY";

    }
}


/* =========================================================
   GENERATE SCREENING RESULT
========================================================= */

function generateResult() {

    /*
       Frontend demo simulation only.

       This does NOT claim to actually detect
       forged documents. A real verification system
       would require a backend, OCR engine,
       computer vision and trained validation models.
    */

    const score = Math.floor(Math.random() * 36) + 8;

    let level;
    let recommendationText;
    let findings;

    if (score <= 25) {

        level = "LOW RISK";

        recommendationText =
            "Proceed to standard verification.";

        findings = [
            "No major suspicious pattern detected in preliminary screening.",
            "Document structure appears readable.",
            "Required information appears extractable.",
            "No immediate high-risk indicator detected."
        ];

    } else if (score <= 60) {

        level = "REVIEW REQUIRED";

        recommendationText =
            "Perform additional verification.";

        findings = [
            "Some document attributes require further review.",
            "Additional identity validation is recommended.",
            "Preliminary screening detected moderate risk indicators.",
            "Human verification should be considered before approval."
        ];

    } else {

        level = "HIGH RISK";

        recommendationText =
            "Manual verification strongly recommended.";

        findings = [
            "Potential suspicious pattern detected.",
            "Document requires additional validation.",
            "Identity information should be cross-checked.",
            "Manual verification is recommended before approval."
        ];
    }

    return {
        score,
        level,
        recommendationText,
        findings
    };
}


/* =========================================================
   FINISH ANALYSIS
========================================================= */

function finishAnalysis() {

    const result = generateResult();

    setTimeout(function () {

        resultPanel.classList.remove("hidden");

        resultFile.textContent = selectedFile
            ? selectedFile.name
            : "Uploaded document";

        riskScore.textContent = result.score;

        recommendation.textContent =
            result.recommendationText;

        findingsList.innerHTML = "";

        result.findings.forEach(function (finding) {

            const li = document.createElement("li");

            li.textContent = finding;

            findingsList.appendChild(li);

        });


        /* -----------------------------------------
           RESULT COLORS
        ----------------------------------------- */

        if (result.score <= 25) {

            riskBadge.textContent = result.level;

            riskBadge.style.color = "var(--success)";
            riskBadge.style.borderColor =
                "rgba(37, 230, 154, 0.3)";
            riskBadge.style.background =
                "rgba(37, 230, 154, 0.08)";

            riskScore.style.color =
                "var(--success)";

        } else if (result.score <= 60) {

            riskBadge.textContent = result.level;

            riskBadge.style.color = "var(--warning)";
            riskBadge.style.borderColor =
                "rgba(255, 200, 87, 0.3)";
            riskBadge.style.background =
                "rgba(255, 200, 87, 0.08)";

            riskScore.style.color =
                "var(--warning)";

        } else {

            riskBadge.textContent = result.level;

            riskBadge.style.color = "var(--danger)";
            riskBadge.style.borderColor =
                "rgba(255, 85, 119, 0.3)";
            riskBadge.style.background =
                "rgba(255, 85, 119, 0.08)";

            riskScore.style.color =
                "var(--danger)";
        }


        finalStatus.textContent = "COMPLETED";

        analyzeBtn.disabled = false;


        /*
           Smoothly bring the result into view.
        */

        resultPanel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 500);
}


/* =========================================================
   ANALYZE BUTTON
========================================================= */

analyzeBtn.addEventListener("click", function () {

    if (analyzeBtn.disabled) {
        return;
    }

    startAnalysis();
});


/* =========================================================
   NAVIGATION ACTIVE STATE
========================================================= */

const navigationLinks =
    document.querySelectorAll(".navbar nav a");

const sections =
    document.querySelectorAll("main section[id]");

window.addEventListener("scroll", function () {

    let currentSection = "";

    sections.forEach(function (section) {

        const sectionTop =
            section.offsetTop - 160;

        const sectionHeight =
            section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {

            currentSection = section.getAttribute("id");
        }
    });


    navigationLinks.forEach(function (link) {

        link.classList.remove("active");

        const target =
            link.getAttribute("href");

        if (target === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

});


/* =========================================================
   NAVIGATION CLICK
========================================================= */

navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navigationLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });

});


/* =========================================================
   INTERSECTION ANIMATION
========================================================= */

const animatedElements = document.querySelectorAll(
    ".tech-card, .impact-card, .workflow-step, .feasibility-card"
);

const observer = new IntersectionObserver(
    function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";

                observer.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.12
    }
);


animatedElements.forEach(function (element) {

    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition =
        "opacity 0.6s ease, transform 0.6s ease";

    observer.observe(element);
});


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener("keydown", function (event) {

    /*
       Ctrl + U focuses document upload.
    */

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "u"
    ) {

        event.preventDefault();

        documentInput.click();
    }

});


/* =========================================================
   INITIALIZE
========================================================= */

resetAnalysis();

console.log(
    "%c IDENTIS SYSTEM ONLINE ",
    "color:#00d9ff;font-size:18px;font-weight:bold;"
);

console.log(
    "AI Identity & Document Screening System"
);

console.log(
    "Frontend screening demo initialized."
);

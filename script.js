/* =========================================================
   IDENTIS — COMPLETE APPLICATION JAVASCRIPT
   Existing analysis flow preserved
   Added:
   1. Download Verification Report
   2. Screening History
   3. Document Security / Privacy Indicator
   4. Document Information / Details
   5. Reset / Scan Another Document
========================================================= */

"use strict";

/* =========================================================
   DOM REFERENCES — EXISTING
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

/* =========================================================
   STATE
========================================================= */

let selectedFile = null;
let scanTimer = null;

let latestResult = null;
let latestScanTime = null;

/* =========================================================
   FEATURE ELEMENT REFERENCES
========================================================= */

let documentDetailsCard = null;
let securityCard = null;
let featureActions = null;
let historySection = null;

/* =========================================================
   STORAGE
========================================================= */

const HISTORY_STORAGE_KEY = "identisScreeningHistory";

/* =========================================================
   FEATURE STYLES
   Dynamically added so style.css does not need modification.
========================================================= */

function injectFeatureStyles() {
    if (document.getElementById("identis-feature-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "identis-feature-styles";

    style.textContent = `
        /* =====================================================
           IDENTIS FEATURE EXTENSIONS
        ===================================================== */

        .identis-feature-card {
            margin-top: 22px;
            padding: 22px;
            border: 1px solid rgba(70, 170, 255, 0.18);
            border-radius: 18px;
            background:
                linear-gradient(
                    145deg,
                    rgba(10, 24, 48, 0.94),
                    rgba(5, 15, 32, 0.94)
                );
            box-shadow:
                0 12px 35px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255,255,255,0.035);
        }

        .identis-feature-card.hidden {
            display: none !important;
        }

        .identis-feature-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
            color: #eaf6ff;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.8px;
        }

        .identis-feature-title-icon {
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: rgba(0, 174, 255, 0.10);
            border: 1px solid rgba(0, 174, 255, 0.20);
            font-size: 17px;
        }

        .identis-detail-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
        }

        .identis-detail-item {
            padding: 13px 14px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.06);
            background: rgba(255,255,255,0.025);
        }

        .identis-detail-label {
            display: block;
            margin-bottom: 5px;
            color: rgba(210,225,240,0.55);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .identis-detail-value {
            display: block;
            color: #eaf6ff;
            font-size: 13px;
            font-weight: 600;
            word-break: break-word;
        }

        .identis-security-content {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .identis-security-icon {
            flex-shrink: 0;
            width: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            background: rgba(0, 220, 150, 0.09);
            border: 1px solid rgba(0, 220, 150, 0.20);
            font-size: 21px;
        }

        .identis-security-main {
            flex: 1;
        }

        .identis-security-status {
            color: #65f2b5;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }

        .identis-security-description {
            margin-top: 4px;
            color: rgba(215,230,245,0.62);
            font-size: 12px;
            line-height: 1.55;
        }

        .identis-security-badge {
            padding: 6px 9px;
            border-radius: 8px;
            color: #65f2b5;
            background: rgba(0, 220, 150, 0.07);
            border: 1px solid rgba(0, 220, 150, 0.15);
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.8px;
            white-space: nowrap;
        }

        .identis-feature-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 20px;
        }

        .identis-feature-btn {
            min-height: 46px;
            padding: 12px 16px;
            border: 1px solid rgba(75, 175, 255, 0.20);
            border-radius: 12px;
            background:
                linear-gradient(
                    135deg,
                    rgba(20, 120, 220, 0.16),
                    rgba(20, 70, 140, 0.11)
                );
            color: #eaf6ff;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.7px;
            cursor: pointer;
            transition:
                transform 0.2s ease,
                border-color 0.2s ease,
                background 0.2s ease,
                box-shadow 0.2s ease;
        }

        .identis-feature-btn:hover {
            transform: translateY(-2px);
            border-color: rgba(75, 190, 255, 0.45);
            background:
                linear-gradient(
                    135deg,
                    rgba(20, 135, 235, 0.24),
                    rgba(20, 80, 150, 0.18)
                );
            box-shadow: 0 8px 25px rgba(0, 120, 255, 0.12);
        }

        .identis-feature-btn.primary {
            border-color: rgba(0, 205, 255, 0.30);
        }

        .identis-feature-btn.secondary {
            border-color: rgba(255,255,255,0.10);
        }

        .identis-history {
            margin-top: 25px;
        }

        .identis-history-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .identis-history-item {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 14px;
            align-items: center;
            padding: 15px;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 13px;
            background: rgba(255,255,255,0.025);
        }

        .identis-history-name {
            color: #eaf6ff;
            font-size: 13px;
            font-weight: 700;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .identis-history-meta {
            margin-top: 5px;
            color: rgba(215,230,245,0.48);
            font-size: 10px;
            line-height: 1.5;
        }

        .identis-history-right {
            text-align: right;
        }

        .identis-history-score {
            color: #eaf6ff;
            font-size: 16px;
            font-weight: 800;
        }

        .identis-history-risk {
            display: inline-block;
            margin-top: 4px;
            padding: 4px 7px;
            border-radius: 6px;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.6px;
        }

        .identis-risk-low {
            color: #63f2b1;
            background: rgba(0,220,150,0.08);
            border: 1px solid rgba(0,220,150,0.14);
        }

        .identis-risk-review {
            color: #ffd66b;
            background: rgba(255,190,0,0.08);
            border: 1px solid rgba(255,190,0,0.14);
        }

        .identis-risk-high {
            color: #ff7373;
            background: rgba(255,50,50,0.08);
            border: 1px solid rgba(255,50,50,0.14);
        }

        .identis-history-empty {
            padding: 22px;
            border: 1px dashed rgba(255,255,255,0.08);
            border-radius: 13px;
            color: rgba(215,230,245,0.45);
            text-align: center;
            font-size: 12px;
        }

        @media (max-width: 650px) {
            .identis-detail-grid,
            .identis-feature-actions {
                grid-template-columns: 1fr;
            }

            .identis-security-content {
                align-items: flex-start;
            }

            .identis-security-badge {
                display: none;
            }

            .identis-history-item {
                grid-template-columns: 1fr;
            }

            .identis-history-right {
                text-align: left;
            }
        }
    `;

    document.head.appendChild(style);
}

/* =========================================================
   HELPER — CREATE FEATURE CARD
========================================================= */

function createFeatureCard(className, title, icon) {
    const card = document.createElement("div");
    card.className = `identis-feature-card ${className}`;

    const titleElement = document.createElement("div");
    titleElement.className = "identis-feature-title";

    const iconElement = document.createElement("span");
    iconElement.className = "identis-feature-title-icon";
    iconElement.textContent = icon;

    const textElement = document.createElement("span");
    textElement.textContent = title;

    titleElement.appendChild(iconElement);
    titleElement.appendChild(textElement);

    card.appendChild(titleElement);

    return card;
}

/* =========================================================
   FEATURE UI INITIALIZATION
========================================================= */

function initializeFeatureUI() {
    injectFeatureStyles();

    if (!resultPanel) {
        return;
    }

    /* -----------------------------------------------------
       DOCUMENT DETAILS CARD
    ----------------------------------------------------- */

    documentDetailsCard = createFeatureCard(
        "identis-document-details hidden",
        "DOCUMENT INFORMATION",
        "📄"
    );

    const detailGrid = document.createElement("div");
    detailGrid.className = "identis-detail-grid";

    const details = [
        ["File Name", "detailFileName"],
        ["File Type", "detailFileType"],
        ["File Size", "detailFileSize"],
        ["Last Modified", "detailLastModified"],
        ["Selected At", "detailSelectedAt"],
        ["Screening Status", "detailScreeningStatus"]
    ];

    details.forEach(([label, id]) => {
        const item = document.createElement("div");
        item.className = "identis-detail-item";

        const labelElement = document.createElement("span");
        labelElement.className = "identis-detail-label";
        labelElement.textContent = label;

        const valueElement = document.createElement("span");
        valueElement.className = "identis-detail-value";
        valueElement.id = id;
        valueElement.textContent = "—";

        item.appendChild(labelElement);
        item.appendChild(valueElement);

        detailGrid.appendChild(item);
    });

    documentDetailsCard.appendChild(detailGrid);

    /* -----------------------------------------------------
       SECURITY / PRIVACY CARD
    ----------------------------------------------------- */

    securityCard = createFeatureCard(
        "identis-security-card hidden",
        "DOCUMENT SECURITY / PRIVACY",
        "🛡️"
    );

    const securityContent = document.createElement("div");
    securityContent.className = "identis-security-content";

    const securityIcon = document.createElement("div");
    securityIcon.className = "identis-security-icon";
    securityIcon.textContent = "🔒";

    const securityMain = document.createElement("div");
    securityMain.className = "identis-security-main";

    const securityStatus = document.createElement("div");
    securityStatus.className = "identis-security-status";
    securityStatus.textContent = "LOCAL DEMO / NO SERVER UPLOAD";

    const securityDescription = document.createElement("div");
    securityDescription.className = "identis-security-description";
    securityDescription.textContent =
        "This frontend demonstration does not upload your document to a backend server. The screening result is simulated locally in the browser.";

    securityMain.appendChild(securityStatus);
    securityMain.appendChild(securityDescription);

    const securityBadge = document.createElement("div");
    securityBadge.className = "identis-security-badge";
    securityBadge.textContent = "PRIVACY MODE";

    securityContent.appendChild(securityIcon);
    securityContent.appendChild(securityMain);
    securityContent.appendChild(securityBadge);

    securityCard.appendChild(securityContent);

    /* -----------------------------------------------------
       ACTION BUTTONS
    ----------------------------------------------------- */

    featureActions = document.createElement("div");
    featureActions.className = "identis-feature-actions hidden";

    const downloadBtn = document.createElement("button");
    downloadBtn.type = "button";
    downloadBtn.className = "identis-feature-btn primary";
    downloadBtn.id = "downloadReportBtn";
    downloadBtn.innerHTML = "📥 DOWNLOAD VERIFICATION REPORT";

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "identis-feature-btn secondary";
    resetBtn.id = "scanAnotherBtn";
    resetBtn.innerHTML = "🔄 SCAN ANOTHER DOCUMENT";

    featureActions.appendChild(downloadBtn);
    featureActions.appendChild(resetBtn);

    downloadBtn.addEventListener("click", downloadVerificationReport);
    resetBtn.addEventListener("click", resetForNewDocument);

    /* -----------------------------------------------------
       INSERT FEATURES
    ----------------------------------------------------- */

    resultPanel.parentNode.insertBefore(
        documentDetailsCard,
        resultPanel
    );

    resultPanel.parentNode.insertBefore(
        securityCard,
        resultPanel
    );

    resultPanel.appendChild(featureActions);

    /* -----------------------------------------------------
       SCREENING HISTORY
    ----------------------------------------------------- */

    historySection = createFeatureCard(
        "identis-history hidden",
        "SCREENING HISTORY",
        "🕘"
    );

    const historyList = document.createElement("div");
    historyList.className = "identis-history-list";
    historyList.id = "identisHistoryList";

    historySection.appendChild(historyList);

    resultPanel.parentNode.insertBefore(
        historySection,
        resultPanel.nextSibling
    );

    renderHistory();
}

/* =========================================================
   RESET ANALYSIS — EXISTING LOGIC + FEATURE RESET
========================================================= */

function resetAnalysis() {
    clearInterval(scanTimer);
    scanTimer = null;

    if (scanPercentage) {
        scanPercentage.textContent = "0%";
    }

    if (documentStatus) {
        documentStatus.textContent = "WAITING";
    }

    if (ocrStatus) {
        ocrStatus.textContent = "PENDING";
    }

    if (riskStatus) {
        riskStatus.textContent = "PENDING";
    }

    if (finalStatus) {
        finalStatus.textContent = "READY";
    }

    if (resultPanel) {
        resultPanel.classList.add("hidden");
    }

    if (riskBadge) {
        riskBadge.textContent = "—";
        riskBadge.className = "risk-badge";
    }

    if (riskScore) {
        riskScore.textContent = "—";
    }

    if (resultFile) {
        resultFile.textContent = "—";
    }

    if (recommendation) {
        recommendation.textContent = "—";
    }

    if (findingsList) {
        findingsList.innerHTML = "";
    }

    latestResult = null;
    latestScanTime = null;

    if (documentDetailsCard) {
        documentDetailsCard.classList.add("hidden");
    }

    if (securityCard) {
        securityCard.classList.add("hidden");
    }

    if (featureActions) {
        featureActions.classList.add("hidden");
    }
}

/* =========================================================
   FILE SIZE FORMATTER — EXISTING
========================================================= */

function formatFileSize(bytes) {
    if (bytes === 0) {
        return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    return (
        parseFloat(
            (bytes / Math.pow(1024, index)).toFixed(2)
        ) +
        " " +
        units[index]
    );
}

/* =========================================================
   FILE VALIDATION — EXISTING
========================================================= */

function isValidFile(file) {
    if (!file) {
        return false;
    }

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

    const fileNameLower = file.name.toLowerCase();

    return (
        allowedTypes.includes(file.type) ||
        allowedExtensions.some(ext =>
            fileNameLower.endsWith(ext)
        )
    );
}

/* =========================================================
   FILE TYPE
========================================================= */

function getReadableFileType(file) {
    if (!file) {
        return "Unknown";
    }

    if (file.type) {
        switch (file.type) {
            case "application/pdf":
                return "PDF Document";

            case "image/jpeg":
            case "image/jpg":
                return "JPEG Image";

            case "image/png":
                return "PNG Image";

            default:
                return file.type;
        }
    }

    const extension = file.name
        .split(".")
        .pop()
        .toUpperCase();

    return `${extension} File`;
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatDateTime(date) {
    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}

/* =========================================================
   DOCUMENT DETAILS
========================================================= */

function updateDocumentDetails(statusText = "READY FOR SCREENING") {
    if (!selectedFile || !documentDetailsCard) {
        return;
    }

    const detailFileName =
        document.getElementById("detailFileName");

    const detailFileType =
        document.getElementById("detailFileType");

    const detailFileSize =
        document.getElementById("detailFileSize");

    const detailLastModified =
        document.getElementById("detailLastModified");

    const detailSelectedAt =
        document.getElementById("detailSelectedAt");

    const detailScreeningStatus =
        document.getElementById("detailScreeningStatus");

    if (detailFileName) {
        detailFileName.textContent = selectedFile.name;
    }

    if (detailFileType) {
        detailFileType.textContent =
            getReadableFileType(selectedFile);
    }

    if (detailFileSize) {
        detailFileSize.textContent =
            formatFileSize(selectedFile.size);
    }

    if (detailLastModified) {
        detailLastModified.textContent =
            selectedFile.lastModified
                ? formatDateTime(
                    new Date(selectedFile.lastModified)
                )
                : "Not available";
    }

    if (detailSelectedAt) {
        detailSelectedAt.textContent =
            latestScanTime
                ? formatDateTime(latestScanTime)
                : formatDateTime(new Date());
    }

    if (detailScreeningStatus) {
        detailScreeningStatus.textContent =
            statusText;
    }

    documentDetailsCard.classList.remove("hidden");
}

/* =========================================================
   SECURITY INDICATOR
========================================================= */

function showSecurityIndicator() {
    if (!securityCard) {
        return;
    }

    securityCard.classList.remove("hidden");
}

/* =========================================================
   HANDLE FILE — EXISTING FLOW PRESERVED
========================================================= */

function handleFile(file) {
    if (!file) {
        return;
    }

    if (!isValidFile(file)) {
        alert(
            "Invalid file format. Please upload a PDF, JPG, JPEG, or PNG document."
        );
        return;
    }

    selectedFile = file;

    resetAnalysis();

    if (fileName) {
        fileName.textContent = file.name;
    }

    if (fileSize) {
        fileSize.textContent =
            formatFileSize(file.size);
    }

    if (fileInfo) {
        fileInfo.classList.remove("hidden");
    }

    if (analyzeBtn) {
        analyzeBtn.disabled = false;
    }

    if (documentStatus) {
        documentStatus.textContent = "READY";
    }

    updateDocumentDetails("READY FOR SCREENING");
    showSecurityIndicator();
}

/* =========================================================
   FILE INPUT — EXISTING
========================================================= */

if (documentInput) {
    documentInput.addEventListener(
        "change",
        event => {
            const file =
                event.target.files &&
                event.target.files[0];

            handleFile(file);
        }
    );
}

/* =========================================================
   REMOVE FILE — EXISTING
========================================================= */

if (removeFile) {
    removeFile.addEventListener(
        "click",
        () => {
            selectedFile = null;

            if (documentInput) {
                documentInput.value = "";
            }

            if (fileInfo) {
                fileInfo.classList.add("hidden");
            }

            if (analyzeBtn) {
                analyzeBtn.disabled = true;
            }

            resetAnalysis();
        }
    );
}

/* =========================================================
   DRAG & DROP — EXISTING
========================================================= */

if (uploadBox) {
    uploadBox.addEventListener(
        "dragover",
        event => {
            event.preventDefault();
            uploadBox.classList.add("dragging");
        }
    );

    uploadBox.addEventListener(
        "dragleave",
        () => {
            uploadBox.classList.remove("dragging");
        }
    );

    uploadBox.addEventListener(
        "drop",
        event => {
            event.preventDefault();

            uploadBox.classList.remove("dragging");

            const file =
                event.dataTransfer.files &&
                event.dataTransfer.files[0];

            if (!file) {
                return;
            }

            /*
             * Synchronize dropped file with the input.
             */
            try {
                const dataTransfer =
                    new DataTransfer();

                dataTransfer.items.add(file);

                documentInput.files =
                    dataTransfer.files;
            } catch (error) {
                console.warn(
                    "Could not synchronize dropped file with input.",
                    error
                );
            }

            handleFile(file);
        }
    );
}

/* =========================================================
   START ANALYSIS — EXISTING FLOW
========================================================= */

function startAnalysis() {
    if (!selectedFile) {
        return;
    }

    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }

    if (resultPanel) {
        resultPanel.classList.add("hidden");
    }

    if (featureActions) {
        featureActions.classList.add("hidden");
    }

    let progress = 0;

    clearInterval(scanTimer);

    if (scanPercentage) {
        scanPercentage.textContent = "0%";
    }

    if (documentStatus) {
        documentStatus.textContent =
            "PROCESSING";
    }

    if (ocrStatus) {
        ocrStatus.textContent =
            "SCANNING";
    }

    if (riskStatus) {
        riskStatus.textContent =
            "ANALYZING";
    }

    if (finalStatus) {
        finalStatus.textContent =
            "IN PROGRESS";
    }

    updateDocumentDetails(
        "SCREENING IN PROGRESS"
    );

    scanTimer = setInterval(
        () => {
            progress += Math.floor(
                Math.random() * 9
            ) + 4;

            if (progress >= 100) {
                progress = 100;
            }

            if (scanPercentage) {
                scanPercentage.textContent =
                    `${progress}%`;
            }

            updateAnalysisStages(progress);

            if (progress >= 100) {
                clearInterval(scanTimer);
                scanTimer = null;

                finishAnalysis();
            }
        },
        180
    );
}

/* =========================================================
   ANALYSIS STAGES — EXISTING
========================================================= */

function updateAnalysisStages(progress) {
    if (progress >= 15 && documentStatus) {
        documentStatus.textContent =
            "DOCUMENT READ";
    }

    if (progress >= 35 && ocrStatus) {
        ocrStatus.textContent =
            "OCR COMPLETE";
    }

    if (progress >= 55 && riskStatus) {
        riskStatus.textContent =
            "RISK ANALYSIS";
    }

    if (progress >= 80 && finalStatus) {
        finalStatus.textContent =
            "FINALIZING";
    }
}

/* =========================================================
   GENERATE RESULT — EXISTING RISK LOGIC PRESERVED
========================================================= */

function generateResult() {
    /*
     * Frontend demo simulation.
     * Existing score range intentionally preserved.
     */
    const score =
        Math.floor(Math.random() * 36) + 8;

    let level;
    let recommendationText;
    let findings;

    if (score <= 25) {
        level = "LOW RISK";

        recommendationText =
            "Proceed to standard verification.";

        findings = [
            "Document structure appears consistent.",
            "No major visual anomalies detected.",
            "Required document elements appear present.",
            "No significant risk indicators identified."
        ];
    } else if (score <= 60) {
        level = "REVIEW REQUIRED";

        recommendationText =
            "Perform additional verification.";

        findings = [
            "Some document elements require review.",
            "Minor inconsistencies detected.",
            "Additional validation is recommended.",
            "Human verification should be considered."
        ];
    } else {
        level = "HIGH RISK";

        recommendationText =
            "Manual verification strongly recommended.";

        findings = [
            "Multiple suspicious indicators detected.",
            "Document structure requires detailed review.",
            "Potential authenticity concerns identified.",
            "Manual verification is strongly recommended."
        ];
    }

    return {
        score,
        level,
        recommendation: recommendationText,
        findings
    };
}

/* =========================================================
   FINISH ANALYSIS — EXISTING FLOW + NEW FEATURES
========================================================= */

function finishAnalysis() {
    const result = generateResult();

    latestResult = result;
    latestScanTime = new Date();

    setTimeout(
        () => {
            if (resultPanel) {
                resultPanel.classList.remove("hidden");
            }

            if (riskBadge) {
                riskBadge.textContent =
                    result.level;

                riskBadge.className =
                    "risk-badge";

                if (result.level === "LOW RISK") {
                    riskBadge.classList.add(
                        "low"
                    );
                } else if (
                    result.level === "REVIEW REQUIRED"
                ) {
                    riskBadge.classList.add(
                        "medium"
                    );
                } else {
                    riskBadge.classList.add(
                        "high"
                    );
                }
            }

            if (riskScore) {
                riskScore.textContent =
                    result.score;
            }

            if (resultFile) {
                resultFile.textContent =
                    selectedFile
                        ? selectedFile.name
                        : "—";
            }

            if (recommendation) {
                recommendation.textContent =
                    result.recommendation;
            }

            if (findingsList) {
                findingsList.innerHTML = "";

                result.findings.forEach(
                    finding => {
                        const li =
                            document.createElement("li");

                        li.textContent = finding;

                        findingsList.appendChild(li);
                    }
                );
            }

            if (documentStatus) {
                documentStatus.textContent =
                    "VERIFIED";
            }

            if (ocrStatus) {
                ocrStatus.textContent =
                    "COMPLETE";
            }

            if (riskStatus) {
                riskStatus.textContent =
                    "ANALYZED";
            }

            if (finalStatus) {
                finalStatus.textContent =
                    "COMPLETED";
            }

            if (analyzeBtn) {
                analyzeBtn.disabled = false;
            }

            updateDocumentDetails(
                "SCREENING COMPLETED"
            );

            showSecurityIndicator();

            if (featureActions) {
                featureActions.classList.remove(
                    "hidden"
                );
            }

            saveToHistory(result);

            if (resultPanel) {
                resultPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        },
        500
    );
}

/* =========================================================
   ANALYZE BUTTON — EXISTING
========================================================= */

if (analyzeBtn) {
    analyzeBtn.addEventListener(
        "click",
        startAnalysis
    );
}

/* =========================================================
   DOWNLOAD VERIFICATION REPORT
========================================================= */

function downloadVerificationReport() {
    if (!selectedFile || !latestResult) {
        return;
    }

    const scanDate =
        latestScanTime || new Date();

    const findingsText =
        latestResult.findings
            .map(
                (finding, index) =>
                    `${index + 1}. ${finding}`
            )
            .join("\n");

    const report = `
============================================================
                    IDENTIS
             VERIFICATION REPORT
============================================================

REPORT GENERATED
${formatDateTime(scanDate)}

------------------------------------------------------------
DOCUMENT INFORMATION
------------------------------------------------------------

File Name:
${selectedFile.name}

File Type:
${getReadableFileType(selectedFile)}

File Size:
${formatFileSize(selectedFile.size)}

Last Modified:
${
    selectedFile.lastModified
        ? formatDateTime(
            new Date(selectedFile.lastModified)
        )
        : "Not available"
}

------------------------------------------------------------
SCREENING RESULT
------------------------------------------------------------

Risk Score:
${latestResult.score}/100

Risk Level:
${latestResult.level}

Recommendation:
${latestResult.recommendation}

OCR Status:
COMPLETE

AI Screening:
COMPLETED

------------------------------------------------------------
SCREENING FINDINGS
------------------------------------------------------------

${findingsText}

------------------------------------------------------------
DOCUMENT SECURITY / PRIVACY
------------------------------------------------------------

Mode:
LOCAL FRONTEND DEMO

Server Upload:
NOT CONFIGURED

The current IDENTIS demonstration performs the
screening simulation locally in the browser.

------------------------------------------------------------
IMPORTANT NOTICE
------------------------------------------------------------

This report represents a preliminary simulated
screening result from the IDENTIS frontend demo.

It does not establish the legal authenticity,
validity, ownership, or genuineness of the uploaded
document.

High-risk or suspicious documents should be subjected
to appropriate human/manual verification.

============================================================
                    END OF REPORT
============================================================
`.trim();

    const blob = new Blob(
        [report],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    const safeBaseName =
        selectedFile.name
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .replace(
                /[^a-z0-9_-]/gi,
                "_"
            );

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );

    link.href = url;

    link.download =
        `IDENTIS_Verification_Report_${safeBaseName}_${timestamp}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(
        () => {
            URL.revokeObjectURL(url);
        },
        1000
    );
}

/* =========================================================
   SCREENING HISTORY — LOCAL STORAGE
========================================================= */

function getHistory() {
    try {
        const saved =
            localStorage.getItem(
                HISTORY_STORAGE_KEY
            );

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];
    } catch (error) {
        console.warn(
            "Unable to read IDENTIS screening history.",
            error
        );

        return [];
    }
}

/* =========================================================
   SAVE HISTORY
========================================================= */

function saveToHistory(result) {
    if (!selectedFile || !result) {
        return;
    }

    const history =
        getHistory();

    const record = {
        fileName: selectedFile.name,
        fileType:
            getReadableFileType(
                selectedFile
            ),
        fileSize:
            formatFileSize(
                selectedFile.size
            ),
        score: result.score,
        level: result.level,
        recommendation:
            result.recommendation,
        timestamp:
            new Date().toISOString()
    };

    history.unshift(record);

    /*
     * Keep latest 10 screening records.
     */
    const limitedHistory =
        history.slice(0, 10);

    try {
        localStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(
                limitedHistory
            )
        );
    } catch (error) {
        console.warn(
            "Unable to save IDENTIS screening history.",
            error
        );
    }

    renderHistory();
}

/* =========================================================
   HISTORY RENDER
========================================================= */

function renderHistory() {
    if (!historySection) {
        return;
    }

    const historyList =
        document.getElementById(
            "identisHistoryList"
        );

    if (!historyList) {
        return;
    }

    const history =
        getHistory();

    historyList.innerHTML = "";

    if (history.length === 0) {
        historySection.classList.add(
            "hidden"
        );

        return;
    }

    historySection.classList.remove(
        "hidden"
    );

    history.forEach(record => {
        const item =
            document.createElement("div");

        item.className =
            "identis-history-item";

        const left =
            document.createElement("div");

        const name =
            document.createElement("div");

        name.className =
            "identis-history-name";

        name.textContent =
            record.fileName || "Unknown document";

        const meta =
            document.createElement("div");

        meta.className =
            "identis-history-meta";

        const recordDate =
            record.timestamp
                ? formatDateTime(
                    new Date(
                        record.timestamp
                    )
                )
                : "Unknown time";

        meta.textContent =
            `${record.fileType || "File"} • ${
                record.fileSize || "Unknown size"
            } • ${recordDate}`;

        left.appendChild(name);
        left.appendChild(meta);

        const right =
            document.createElement("div");

        right.className =
            "identis-history-right";

        const score =
            document.createElement("div");

        score.className =
            "identis-history-score";

        score.textContent =
            `${record.score}/100`;

        const risk =
            document.createElement("span");

        risk.className =
            "identis-history-risk";

        if (record.level === "LOW RISK") {
            risk.classList.add(
                "identis-risk-low"
            );
        } else if (
            record.level === "REVIEW REQUIRED"
        ) {
            risk.classList.add(
                "identis-risk-review"
            );
        } else {
            risk.classList.add(
                "identis-risk-high"
            );
        }

        risk.textContent =
            record.level || "UNKNOWN";

        right.appendChild(score);
        right.appendChild(risk);

        item.appendChild(left);
        item.appendChild(right);

        historyList.appendChild(item);
    });
}

/* =========================================================
   RESET / SCAN ANOTHER DOCUMENT
========================================================= */

function resetForNewDocument() {
    clearInterval(scanTimer);
    scanTimer = null;

    selectedFile = null;
    latestResult = null;
    latestScanTime = null;

    if (documentInput) {
        documentInput.value = "";
    }

    if (fileInfo) {
        fileInfo.classList.add("hidden");
    }

    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }

    resetAnalysis();

    if (documentStatus) {
        documentStatus.textContent =
            "WAITING";
    }

    if (ocrStatus) {
        ocrStatus.textContent =
            "PENDING";
    }

    if (riskStatus) {
        riskStatus.textContent =
            "PENDING";
    }

    if (finalStatus) {
        finalStatus.textContent =
            "READY";
    }

    /*
     * History is intentionally preserved.
     */
    renderHistory();

    const screeningSection =
        document.getElementById(
            "screening"
        );

    if (screeningSection) {
        screeningSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } else if (uploadBox) {
        uploadBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}

/* =========================================================
   NAVIGATION ACTIVE STATE — EXISTING
========================================================= */

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );

const sections =
    document.querySelectorAll(
        "section[id]"
    );

window.addEventListener(
    "scroll",
    () => {
        let current = "";

        sections.forEach(section => {
            const sectionTop =
                section.offsetTop - 160;

            if (
                window.scrollY >=
                sectionTop
            ) {
                current =
                    section.getAttribute(
                        "id"
                    );
            }
        });

        navLinks.forEach(link => {
            link.classList.remove(
                "active"
            );

            const href =
                link.getAttribute("href");

            if (
                href === `#${current}`
            ) {
                link.classList.add(
                    "active"
                );
            }
        });
    }
);

/* =========================================================
   NAVIGATION CLICK — EXISTING
========================================================= */

navLinks.forEach(link => {
    link.addEventListener(
        "click",
        () => {
            navLinks.forEach(item => {
                item.classList.remove(
                    "active"
                );
            });

            link.classList.add(
                "active"
            );
        }
    );
});

/* =========================================================
   INTERSECTION OBSERVER — EXISTING
========================================================= */

const observer =
    new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(
                        "visible"
                    );
                }
            });
        },
        {
            threshold: 0.15
        }
    );

document
    .querySelectorAll(
        ".tech-card, .impact-card, .workflow-step, .feasibility-card"
    )
    .forEach(element => {
        observer.observe(element);
    });

/* =========================================================
   CTRL + U — EXISTING
========================================================= */

document.addEventListener(
    "keydown",
    event => {
        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "u"
        ) {
            event.preventDefault();

            if (uploadBox) {
                uploadBox.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }
    }
);

/* =========================================================
   INITIALIZATION
========================================================= */

initializeFeatureUI();

resetAnalysis();

console.log(
    "%cIDENTIS SYSTEM ONLINE",
    "color:#00d9ff;font-weight:bold;font-size:16px;"
);

console.log(
    "%cAI-Based Fake Identity & Document Screening System",
    "color:#7aa7ff;font-size:12px;"
);

console.log(
    "%cFrontend demonstration mode active.",
    "color:#63f2b1;font-size:11px;"
);

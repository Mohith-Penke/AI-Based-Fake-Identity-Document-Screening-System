/* =========================================================
   IDENTIS — COMPLETE APPLICATION JAVASCRIPT
   Existing UI / Features Preserved

   ANALYSIS UPGRADE:
   1. Actual JPG / JPEG / PNG pixel analysis
   2. Resolution / brightness / contrast analysis
   3. Document-like image detection
   4. Visual anomaly indicators
   5. Normal documents receive lower risk
   6. Human/person photos are rejected as invalid input
   7. Image-specific screening findings
   8. Actual result saved to History
   9. Actual result included in Verification Report
   10. PDF handling preserved as preliminary frontend analysis

   IMPORTANT:
   This is a frontend screening demonstration.
   It does NOT prove legal authenticity or detect forgery
   with a production-grade ML model.
========================================================= */

"use strict";

/* =========================================================
   DOM REFERENCES
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
========================================================= */

function injectFeatureStyles() {
    if (document.getElementById("identis-feature-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "identis-feature-styles";

    style.textContent = `
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

        .identis-history-invalid {
            color: #ffb36b;
            background: rgba(255,150,50,0.08);
            border: 1px solid rgba(255,150,50,0.14);
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

    /* DOCUMENT DETAILS */

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

    /* SECURITY */

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
        "This frontend demonstration does not upload your document to a backend server. Image analysis is performed locally in the browser.";

    securityMain.appendChild(securityStatus);
    securityMain.appendChild(securityDescription);

    const securityBadge = document.createElement("div");
    securityBadge.className = "identis-security-badge";
    securityBadge.textContent = "PRIVACY MODE";

    securityContent.appendChild(securityIcon);
    securityContent.appendChild(securityMain);
    securityContent.appendChild(securityBadge);

    securityCard.appendChild(securityContent);

    /* ACTIONS */

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

    downloadBtn.addEventListener(
        "click",
        downloadVerificationReport
    );

    resetBtn.addEventListener(
        "click",
        resetForNewDocument
    );

    /* INSERT */

    resultPanel.parentNode.insertBefore(
        documentDetailsCard,
        resultPanel
    );

    resultPanel.parentNode.insertBefore(
        securityCard,
        resultPanel
    );

    resultPanel.appendChild(featureActions);

    /* HISTORY */

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
   RESET ANALYSIS
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
   FILE SIZE FORMATTER
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
   FILE VALIDATION
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

function updateDocumentDetails(
    statusText = "READY FOR SCREENING"
) {
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
        detailFileName.textContent =
            selectedFile.name;
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
   HANDLE FILE
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

    updateDocumentDetails(
        "READY FOR SCREENING"
    );

    showSecurityIndicator();
}

/* =========================================================
   FILE INPUT
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
   REMOVE FILE
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
   DRAG & DROP
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

            try {
                const dataTransfer =
                    new DataTransfer();

                dataTransfer.items.add(file);

                if (documentInput) {
                    documentInput.files =
                        dataTransfer.files;
                }
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
   START ANALYSIS
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
            progress +=
                Math.floor(
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
   ANALYSIS STAGES
========================================================= */

function updateAnalysisStages(progress) {
    if (progress >= 15 && documentStatus) {
        documentStatus.textContent =
            "DOCUMENT READ";
    }

    if (progress >= 35 && ocrStatus) {
        ocrStatus.textContent =
            "IMAGE ANALYSIS";
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
   IMAGE HELPERS
========================================================= */

function clamp(value, min, max) {
    return Math.max(
        min,
        Math.min(max, value)
    );
}

function isImageFile(file) {
    if (!file) {
        return false;
    }

    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    return (
        type === "image/jpeg" ||
        type === "image/jpg" ||
        type === "image/png" ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png")
    );
}

function isPdfFile(file) {
    if (!file) {
        return false;
    }

    return (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );
}

/* =========================================================
   LOAD IMAGE
========================================================= */

function loadImageFromFile(file) {
    return new Promise(
        (resolve, reject) => {
            const objectUrl =
                URL.createObjectURL(file);

            const image =
                new Image();

            image.onload = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(image);
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(
                    new Error(
                        "Unable to decode image."
                    )
                );
            };

            image.src = objectUrl;
        }
    );
}

/* =========================================================
   IMAGE PIXEL ANALYSIS

   Reads actual RGBA pixels from the uploaded image.
========================================================= */

async function analyzeImagePixels(file) {
    const image =
        await loadImageFromFile(file);

    const originalWidth =
        image.naturalWidth || image.width;

    const originalHeight =
        image.naturalHeight || image.height;

    if (
        !originalWidth ||
        !originalHeight
    ) {
        throw new Error(
            "Image dimensions could not be determined."
        );
    }

    /*
     * Limit canvas processing size for browser performance.
     * We still preserve original resolution in the result.
     */
    const maxDimension = 1200;

    const scale =
        Math.min(
            1,
            maxDimension /
                Math.max(
                    originalWidth,
                    originalHeight
                )
        );

    const width =
        Math.max(
            1,
            Math.round(
                originalWidth * scale
            )
        );

    const height =
        Math.max(
            1,
            Math.round(
                originalHeight * scale
            )
        );

    const canvas =
        document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );

    if (!ctx) {
        throw new Error(
            "Canvas processing is unavailable."
        );
    }

    ctx.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );

    const pixels =
        imageData.data;

    /*
     * Sample pixels instead of processing every
     * pixel on very large images.
     */
    const totalPixels =
        width * height;

    const sampleStep =
        Math.max(
            1,
            Math.floor(
                Math.sqrt(
                    totalPixels /
                    120000
                )
            )
        );

    let sampleCount = 0;

    let brightnessSum = 0;
    let brightnessSquaredSum = 0;

    let saturationSum = 0;

    let darkPixels = 0;
    let brightPixels = 0;

    let colorfulPixels = 0;
    let skinTonePixels = 0;

    let edgeCount = 0;
    let strongEdgeCount = 0;

    let borderBrightnessSum = 0;
    let centerBrightnessSum = 0;

    let borderCount = 0;
    let centerCount = 0;

    /*
     * First pass:
     * brightness, saturation, skin-tone approximation,
     * dark/bright ratios and regional brightness.
     */
    for (
        let y = 0;
        y < height;
        y += sampleStep
    ) {
        for (
            let x = 0;
            x < width;
            x += sampleStep
        ) {
            const index =
                (y * width + x) * 4;

            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];

            const max =
                Math.max(r, g, b);

            const min =
                Math.min(r, g, b);

            const brightness =
                (
                    0.299 * r +
                    0.587 * g +
                    0.114 * b
                );

            const saturation =
                max === 0
                    ? 0
                    : (max - min) / max;

            brightnessSum +=
                brightness;

            brightnessSquaredSum +=
                brightness * brightness;

            saturationSum +=
                saturation;

            sampleCount++;

            if (brightness < 45) {
                darkPixels++;
            }

            if (brightness > 225) {
                brightPixels++;
            }

            if (saturation > 0.28) {
                colorfulPixels++;
            }

            /*
             * Approximate skin-tone region.
             * This is deliberately used only as a heuristic,
             * not as face recognition.
             */
            const skinTone =
                r > 70 &&
                g > 35 &&
                b > 20 &&
                r > g * 1.08 &&
                g > b * 1.08 &&
                r - b > 25 &&
                (r - g) > 5;

            if (skinTone) {
                skinTonePixels++;
            }

            const isBorder =
                x < width * 0.12 ||
                x > width * 0.88 ||
                y < height * 0.12 ||
                y > height * 0.88;

            const isCenter =
                x > width * 0.30 &&
                x < width * 0.70 &&
                y > height * 0.30 &&
                y < height * 0.70;

            if (isBorder) {
                borderBrightnessSum +=
                    brightness;

                borderCount++;
            }

            if (isCenter) {
                centerBrightnessSum +=
                    brightness;

                centerCount++;
            }
        }
    }

    /*
     * Second pass:
     * simple luminance edge analysis.
     */
    for (
        let y = 0;
        y < height - sampleStep;
        y += sampleStep
    ) {
        for (
            let x = 0;
            x < width - sampleStep;
            x += sampleStep
        ) {
            const index1 =
                (y * width + x) * 4;

            const index2 =
                (
                    y * width +
                    (x + sampleStep)
                ) * 4;

            const index3 =
                (
                    (y + sampleStep) *
                    width +
                    x
                ) * 4;

            const p1 =
                (
                    0.299 * pixels[index1] +
                    0.587 * pixels[index1 + 1] +
                    0.114 * pixels[index1 + 2]
                );

            const p2 =
                (
                    0.299 * pixels[index2] +
                    0.587 * pixels[index2 + 1] +
                    0.114 * pixels[index2 + 2]
                );

            const p3 =
                (
                    0.299 * pixels[index3] +
                    0.587 * pixels[index3 + 1] +
                    0.114 * pixels[index3 + 2]
                );

            const horizontalDifference =
                Math.abs(p1 - p2);

            const verticalDifference =
                Math.abs(p1 - p3);

            const edgeStrength =
                Math.max(
                    horizontalDifference,
                    verticalDifference
                );

            if (edgeStrength > 12) {
                edgeCount++;
            }

            if (edgeStrength > 45) {
                strongEdgeCount++;
            }
        }
    }

    const safeSampleCount =
        Math.max(
            sampleCount,
            1
        );

    const brightness =
        brightnessSum /
        safeSampleCount;

    const variance =
        (
            brightnessSquaredSum /
            safeSampleCount
        ) -
        brightness * brightness;

    const contrast =
        Math.sqrt(
            Math.max(
                0,
                variance
            )
        );

    const saturation =
        saturationSum /
        safeSampleCount;

    const darkRatio =
        darkPixels /
        safeSampleCount;

    const brightRatio =
        brightPixels /
        safeSampleCount;

    const colorfulRatio =
        colorfulPixels /
        safeSampleCount;

    const skinToneRatio =
        skinTonePixels /
        safeSampleCount;

    const edgeSamples =
        Math.max(
            1,
            Math.floor(
                (
                    (width - sampleStep) /
                    sampleStep
                ) *
                (
                    (height - sampleStep) /
                    sampleStep
                )
            )
        );

    const edgeDensity =
        edgeCount /
        edgeSamples;

    const strongEdgeDensity =
        strongEdgeCount /
        edgeSamples;

    const borderBrightness =
        borderCount > 0
            ? borderBrightnessSum /
              borderCount
            : brightness;

    const centerBrightness =
        centerCount > 0
            ? centerBrightnessSum /
              centerCount
            : brightness;

    const borderCenterDifference =
        Math.abs(
            borderBrightness -
            centerBrightness
        );

    const aspectRatio =
        originalWidth /
        originalHeight;

    const megapixels =
        (
            originalWidth *
            originalHeight
        ) / 1000000;

    /*
     * Document shape heuristics.
     */
    const landscapeDocumentShape =
        aspectRatio >= 1.20 &&
        aspectRatio <= 2.10;

    const portraitDocumentShape =
        aspectRatio >= 0.62 &&
        aspectRatio < 1.20;

    const veryPortrait =
        aspectRatio < 0.78;

    const squareLike =
        aspectRatio >= 0.88 &&
        aspectRatio <= 1.12;

    /*
     * Paper/document visual characteristics.
     */
    const brightPaperRatio =
        clamp(
            (
                brightRatio +
                (1 - saturation) * 0.45
            ),
            0,
            1
        );

    const documentLikeScore =
        (
            (landscapeDocumentShape ? 0.35 : 0) +
            (brightPaperRatio > 0.48 ? 0.25 : 0) +
            (edgeDensity > 0.045 ? 0.20 : 0) +
            (contrast > 22 ? 0.10 : 0) +
            (borderCenterDifference > 5 ? 0.10 : 0)
        );

    /*
     * Optional browser FaceDetector.
     *
     * Not required for the main analysis.
     * If unavailable, heuristics are used.
     */
    let faceCount = 0;
    let faceDetectionAvailable = false;

    try {
        if (
            "FaceDetector" in window
        ) {
            const detector =
                new FaceDetector({
                    fastMode: true,
                    maxDetectedFaces: 10
                });

            const faces =
                await detector.detect(
                    image
                );

            faceCount =
                Array.isArray(faces)
                    ? faces.length
                    : 0;

            faceDetectionAvailable = true;
        }
    } catch (error) {
        faceCount = 0;
        faceDetectionAvailable = false;
    }

    /*
     * Person-photo heuristic.
     *
     * Face alone does NOT reject an image because
     * legitimate identity documents can contain a face.
     */
    const colorfulPhoto =
        colorfulRatio > 0.10;

    const skinTonePresent =
        skinToneRatio > 0.025;

    const portraitPhotoShape =
        veryPortrait ||
        squareLike;

    const weakDocumentStructure =
        documentLikeScore < 0.50;

    const photoHeuristic =
        portraitPhotoShape &&
        colorfulPhoto &&
        skinTonePresent &&
        weakDocumentStructure &&
        edgeDensity > 0.035;

    const detectedPersonPhoto =
        (
            faceDetectionAvailable &&
            faceCount > 0 &&
            portraitPhotoShape &&
            documentLikeScore < 0.48
        ) ||
        (
            !faceDetectionAvailable &&
            photoHeuristic
        );

    /*
     * Score calculation.
     *
     * This is a visual screening score,
     * not a legal authenticity score.
     */
    let score = 8;

    const issues = [];
    const positives = [];

    /*
     * Resolution.
     */
    if (
        originalWidth < 600 ||
        originalHeight < 400
    ) {
        score += 25;

        issues.push(
            `Very low image resolution detected (${originalWidth} × ${originalHeight}px).`
        );
    } else if (
        originalWidth < 1000 ||
        originalHeight < 700
    ) {
        score += 10;

        issues.push(
            `Limited image resolution detected (${originalWidth} × ${originalHeight}px).`
        );
    } else {
        positives.push(
            `Resolution is suitable for preliminary visual screening (${originalWidth} × ${originalHeight}px).`
        );
    }

    /*
     * Brightness.
     */
    if (brightness < 55) {
        score += 18;

        issues.push(
            `Image is significantly dark (average brightness ${brightness.toFixed(1)}).`
        );
    } else if (brightness < 85) {
        score += 7;

        issues.push(
            `Image is somewhat dark (average brightness ${brightness.toFixed(1)}).`
        );
    } else if (brightness > 220) {
        score += 15;

        issues.push(
            `Image is heavily overexposed (average brightness ${brightness.toFixed(1)}).`
        );
    } else if (brightness > 195) {
        score += 5;

        issues.push(
            `Image is brighter than normal (average brightness ${brightness.toFixed(1)}).`
        );
    } else {
        positives.push(
            `Brightness is within a usable range (${brightness.toFixed(1)}).`
        );
    }

    /*
     * Contrast.
     */
    if (contrast < 15) {
        score += 15;

        issues.push(
            `Very low contrast may reduce text and boundary visibility (${contrast.toFixed(1)}).`
        );
    } else if (contrast < 25) {
        score += 7;

        issues.push(
            `Moderate-low contrast detected (${contrast.toFixed(1)}).`
        );
    } else if (contrast > 95) {
        score += 8;

        issues.push(
            `Very high contrast detected, which may hide fine document details (${contrast.toFixed(1)}).`
        );
    } else {
        positives.push(
            `Contrast supports preliminary text and boundary visibility (${contrast.toFixed(1)}).`
        );
    }

    /*
     * Aspect ratio.
     */
    if (
        aspectRatio < 0.50 ||
        aspectRatio > 2.60
    ) {
        score += 14;

        issues.push(
            `Unusual document proportions detected (aspect ratio ${aspectRatio.toFixed(2)}).`
        );
    } else if (
        aspectRatio < 0.58 ||
        aspectRatio > 2.30
    ) {
        score += 7;

        issues.push(
            `Document proportions are outside the common screening range (aspect ratio ${aspectRatio.toFixed(2)}).`
        );
    } else {
        positives.push(
            `Image proportions are compatible with a document-style capture (aspect ratio ${aspectRatio.toFixed(2)}).`
        );
    }

    /*
     * Edge structure.
     */
    if (edgeDensity < 0.025) {
        score += 12;

        issues.push(
            "Very little edge structure was detected; document boundaries or text may be unclear."
        );
    } else if (edgeDensity > 0.55) {
        score += 8;

        issues.push(
            "Very dense visual edges detected; the image may contain heavy background or visual noise."
        );
    } else {
        positives.push(
            "Text/document edge structure is detectable."
        );
    }

    /*
     * Excessive dark/bright regions.
     */
    if (darkRatio > 0.38) {
        score += 8;

        issues.push(
            `Large dark regions detected (${(darkRatio * 100).toFixed(1)}% of sampled pixels).`
        );
    }

    if (brightRatio > 0.55) {
        score += 5;

        issues.push(
            `Large over-bright regions detected (${(brightRatio * 100).toFixed(1)}% of sampled pixels).`
        );
    }

    /*
     * Document boundary structure.
     */
    if (
        landscapeDocumentShape &&
        borderCenterDifference > 5
    ) {
        positives.push(
            "Document-like boundary separation is visible between outer and center regions."
        );
    }

    /*
     * Color saturation.
     */
    if (
        saturation > 0.55 &&
        !detectedPersonPhoto
    ) {
        score += 5;

        issues.push(
            `High color saturation detected (${(saturation * 100).toFixed(1)}%), which may indicate a photographed or visually noisy document.`
        );
    }

    /*
     * Suspicious visual indicator:
     * strong edge concentration.
     */
    if (
        strongEdgeDensity > 0.18 &&
        !detectedPersonPhoto
    ) {
        score += 6;

        issues.push(
            "Strong localized visual changes were detected; the image may need additional manual inspection."
        );
    }

    /*
     * Positive document indicators.
     */
    if (
        landscapeDocumentShape &&
        brightPaperRatio > 0.45
    ) {
        positives.push(
            "Overall visual structure is compatible with a document image."
        );
    }

    /*
     * If the image looks like a person photo,
     * do NOT convert it into a fake-document risk score.
     */
    if (detectedPersonPhoto) {
        return {
            type: "HUMAN_IMAGE",
            score: null,
            level: "INVALID INPUT",
            recommendation:
                "Please upload a proper document image such as an ID card, certificate, license, or other supported document.",
            findings: [
                "The uploaded image appears to be a person/selfie-style photograph rather than a document.",
                faceDetectionAvailable && faceCount > 0
                    ? `A human face was detected in the image (${faceCount} face${faceCount > 1 ? "s" : ""}).`
                    : "The image has visual characteristics commonly associated with a personal photograph.",
                "A person photograph should not be assigned a document authenticity risk score.",
                "Please upload a clear JPG, JPEG, or PNG image of the document you want to screen."
            ],
            metrics: {
                width: originalWidth,
                height: originalHeight,
                megapixels,
                aspectRatio,
                brightness,
                contrast,
                saturation,
                edgeDensity,
                faceCount,
                faceDetectionAvailable,
                documentLikeScore
            }
        };
    }

    /*
     * Clamp final score.
     */
    score =
        Math.round(
            clamp(score, 5, 92)
        );

    /*
     * Keep normal-looking documents in the lower range.
     */
    if (
        documentLikeScore >= 0.70 &&
        score > 30
    ) {
        score =
            Math.min(
                score,
                30
            );
    }

    let level;
    let recommendationText;

    if (score <= 25) {
        level = "LOW RISK";

        recommendationText =
            "Visual characteristics are suitable for standard verification. Continue with normal identity/document checks.";
    } else if (score <= 60) {
        level = "REVIEW REQUIRED";

        recommendationText =
            "Some visual quality or structural indicators require additional verification before accepting the document.";
    } else {
        level = "HIGH RISK";

        recommendationText =
            "Multiple visual indicators require detailed manual verification. Do not rely on this preliminary screening alone.";
    }

    /*
     * Image-specific findings.
     */
    const findings = [];

    issues.forEach(issue => {
        if (
            !findings.includes(issue) &&
            findings.length < 5
        ) {
            findings.push(issue);
        }
    });

    positives.forEach(positive => {
        if (
            !findings.includes(positive) &&
            findings.length < 5
        ) {
            findings.push(positive);
        }
    });

    /*
     * Always give a useful result.
     */
    if (findings.length === 0) {
        findings.push(
            "No significant visual quality issue was detected in the uploaded image."
        );

        findings.push(
            "Document-like image characteristics were observed during preliminary screening."
        );
    }

    /*
     * Add metrics when there is room.
     */
    if (findings.length < 5) {
        findings.push(
            `Image analysis measured ${originalWidth} × ${originalHeight}px with ${megapixels.toFixed(2)} MP resolution.`
        );
    }

    return {
        type: "DOCUMENT",
        score,
        level,
        recommendation: recommendationText,
        findings,
        metrics: {
            width: originalWidth,
            height: originalHeight,
            megapixels,
            aspectRatio,
            brightness,
            contrast,
            saturation,
            darkRatio,
            brightRatio,
            colorfulRatio,
            skinToneRatio,
            edgeDensity,
            strongEdgeDensity,
            borderBrightness,
            centerBrightness,
            borderCenterDifference,
            faceCount,
            faceDetectionAvailable,
            documentLikeScore,
            documentShape:
                landscapeDocumentShape
                    ? "Landscape document"
                    : portraitDocumentShape
                        ? "Portrait / mixed"
                        : "Unusual"
        }
    };
}

/* =========================================================
   PDF ANALYSIS

   No external PDF rendering library is required.
   Therefore this is deliberately preliminary.
========================================================= */

function analyzePdfFile(file) {
    const sizeMB =
        file.size /
        (1024 * 1024);

    let score = 15;

    const findings = [
        "PDF file format detected successfully.",
        "File metadata is available for preliminary screening.",
        "The current frontend version does not render PDF pages into pixels.",
        "Pixel-level visual analysis is therefore not applied to the PDF contents."
    ];

    if (sizeMB < 0.01) {
        score += 15;

        findings.push(
            "The PDF is unusually small and may require additional manual inspection."
        );
    } else if (sizeMB > 25) {
        score += 8;

        findings.push(
            `Large PDF size detected (${sizeMB.toFixed(2)} MB).`
        );
    } else {
        findings.push(
            `PDF size is ${sizeMB.toFixed(2)} MB.`
        );
    }

    score =
        clamp(
            Math.round(score),
            5,
            45
        );

    let level;

    if (score <= 25) {
        level = "LOW RISK";
    } else {
        level = "REVIEW REQUIRED";
    }

    return {
        type: "PDF",
        score,
        level,
        recommendation:
            "The PDF passed basic file-level screening. For authenticity, page-level document validation and manual verification are recommended.",
        findings,
        metrics: {
            fileSizeMB: sizeMB,
            pixelAnalysis: false
        }
    };
}

/* =========================================================
   GENERATE RESULT

   IMPORTANT:
   This is now asynchronous because JPG/PNG images
   are actually analyzed before generating the result.
========================================================= */

async function generateResult() {
    if (!selectedFile) {
        return {
            type: "INVALID",
            score: null,
            level: "INVALID INPUT",
            recommendation:
                "Please select a supported document.",
            findings: [
                "No document was selected for screening."
            ],
            metrics: {}
        };
    }

    try {
        if (isImageFile(selectedFile)) {
            return await analyzeImagePixels(
                selectedFile
            );
        }

        if (isPdfFile(selectedFile)) {
            return analyzePdfFile(
                selectedFile
            );
        }

        return {
            type: "INVALID",
            score: null,
            level: "INVALID INPUT",
            recommendation:
                "Please upload a PDF, JPG, JPEG, or PNG document.",
            findings: [
                "Unsupported file type."
            ],
            metrics: {}
        };
    } catch (error) {
        console.error(
            "IDENTIS analysis error:",
            error
        );

        return {
            type: "ERROR",
            score: null,
            level: "ANALYSIS ERROR",
            recommendation:
                "The image could not be analyzed. Please upload a clear JPG, JPEG, or PNG document and try again.",
            findings: [
                "The browser could not decode or process the uploaded image.",
                "Please make sure the file is not corrupted.",
                "Try uploading a clear document image again."
            ],
            metrics: {}
        };
    }
}

/* =========================================================
   FINISH ANALYSIS
========================================================= */

async function finishAnalysis() {
    let result;

    try {
        result =
            await generateResult();
    } catch (error) {
        console.error(error);

        result = {
            type: "ERROR",
            score: null,
            level: "ANALYSIS ERROR",
            recommendation:
                "Unable to complete image analysis.",
            findings: [
                "The screening process encountered an unexpected error."
            ],
            metrics: {}
        };
    }

    latestResult = result;
    latestScanTime = new Date();

    setTimeout(
        () => {
            if (resultPanel) {
                resultPanel.classList.remove(
                    "hidden"
                );
            }

            /*
             * Risk badge.
             */
            if (riskBadge) {
                riskBadge.textContent =
                    result.level;

                riskBadge.className =
                    "risk-badge";

                if (
                    result.level === "LOW RISK"
                ) {
                    riskBadge.classList.add(
                        "low"
                    );
                } else if (
                    result.level ===
                    "REVIEW REQUIRED"
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

            /*
             * Score.
             *
             * Human photo / invalid input:
             * display — instead of a fake risk number.
             */
            if (riskScore) {
                riskScore.textContent =
                    result.score === null ||
                    typeof result.score ===
                        "undefined"
                        ? "—"
                        : result.score;
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

            /*
             * Findings.
             */
            if (findingsList) {
                findingsList.innerHTML = "";

                result.findings.forEach(
                    finding => {
                        const li =
                            document.createElement(
                                "li"
                            );

                        li.textContent =
                            finding;

                        findingsList.appendChild(
                            li
                        );
                    }
                );
            }

            /*
             * Status handling.
             */
            if (
                result.type ===
                "HUMAN_IMAGE"
            ) {
                if (documentStatus) {
                    documentStatus.textContent =
                        "INPUT REJECTED";
                }

                if (ocrStatus) {
                    ocrStatus.textContent =
                        "NOT A DOCUMENT";
                }

                if (riskStatus) {
                    riskStatus.textContent =
                        "NOT APPLICABLE";
                }

                if (finalStatus) {
                    finalStatus.textContent =
                        "DOCUMENT REQUIRED";
                }

                updateDocumentDetails(
                    "INVALID INPUT — DOCUMENT REQUIRED"
                );
            } else if (
                result.type ===
                "ERROR"
            ) {
                if (documentStatus) {
                    documentStatus.textContent =
                        "ANALYSIS ERROR";
                }

                if (ocrStatus) {
                    ocrStatus.textContent =
                        "FAILED";
                }

                if (riskStatus) {
                    riskStatus.textContent =
                        "NOT COMPLETED";
                }

                if (finalStatus) {
                    finalStatus.textContent =
                        "RETRY REQUIRED";
                }

                updateDocumentDetails(
                    "ANALYSIS ERROR"
                );
            } else {
                if (documentStatus) {
                    documentStatus.textContent =
                        "VERIFIED";
                }

                if (ocrStatus) {
                    ocrStatus.textContent =
                        result.type === "PDF"
                            ? "FILE ANALYSIS"
                            : "PIXEL ANALYSIS";
                }

                if (riskStatus) {
                    riskStatus.textContent =
                        "ANALYZED";
                }

                if (finalStatus) {
                    finalStatus.textContent =
                        "COMPLETED";
                }

                updateDocumentDetails(
                    "SCREENING COMPLETED"
                );
            }

            if (analyzeBtn) {
                analyzeBtn.disabled = false;
            }

            showSecurityIndicator();

            if (featureActions) {
                featureActions.classList.remove(
                    "hidden"
                );
            }

            /*
             * Save the ACTUAL result.
             */
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
   ANALYZE BUTTON
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
    if (
        !selectedFile ||
        !latestResult
    ) {
        return;
    }

    const scanDate =
        latestScanTime ||
        new Date();

    const findingsText =
        latestResult.findings
            .map(
                (finding, index) =>
                    `${index + 1}. ${finding}`
            )
            .join("\n");

    const scoreText =
        latestResult.score === null ||
        typeof latestResult.score ===
            "undefined"
            ? "NOT APPLICABLE"
            : `${latestResult.score}/100`;

    let metricsText =
        "No image metrics available.";

    if (
        latestResult.metrics &&
        latestResult.type ===
            "DOCUMENT"
    ) {
        const m =
            latestResult.metrics;

        metricsText = `
Resolution:
${m.width} × ${m.height}px

Megapixels:
${m.megapixels.toFixed(2)} MP

Aspect Ratio:
${m.aspectRatio.toFixed(2)}

Brightness:
${m.brightness.toFixed(2)}

Contrast:
${m.contrast.toFixed(2)}

Saturation:
${m.saturation.toFixed(2)}

Edge Density:
${m.edgeDensity.toFixed(3)}

Document Shape:
${m.documentShape || "—"}

Document-Like Score:
${m.documentLikeScore.toFixed(2)}

Face Detection:
${
    m.faceDetectionAvailable
        ? `Available — ${m.faceCount} detected`
        : "Browser face detector unavailable; heuristic analysis used"
}
`.trim();
    }

    if (
        latestResult.type ===
        "HUMAN_IMAGE"
    ) {
        const m =
            latestResult.metrics ||
            {};

        metricsText = `
Resolution:
${m.width || "—"} × ${m.height || "—"}px

Megapixels:
${
    typeof m.megapixels ===
    "number"
        ? m.megapixels.toFixed(2)
        : "—"
} MP

Aspect Ratio:
${
    typeof m.aspectRatio ===
    "number"
        ? m.aspectRatio.toFixed(2)
        : "—"
}

Brightness:
${
    typeof m.brightness ===
    "number"
        ? m.brightness.toFixed(2)
        : "—"
}

Contrast:
${
    typeof m.contrast ===
    "number"
        ? m.contrast.toFixed(2)
        : "—"
}

Detected Faces:
${
    typeof m.faceCount ===
    "number"
        ? m.faceCount
        : "—"
}

Input Classification:
PERSON / NON-DOCUMENT IMAGE
`.trim();
    }

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
            new Date(
                selectedFile.lastModified
            )
        )
        : "Not available"
}

------------------------------------------------------------
SCREENING RESULT
------------------------------------------------------------

Risk Score:
${scoreText}

Risk Level:
${latestResult.level}

Recommendation:
${latestResult.recommendation}

Analysis Type:
${latestResult.type}

------------------------------------------------------------
IMAGE / FILE ANALYSIS
------------------------------------------------------------

${metricsText}

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

The current IDENTIS demonstration performs
the analysis locally in the browser.

------------------------------------------------------------
IMPORTANT NOTICE
------------------------------------------------------------

This report represents a preliminary visual/file
screening result from the IDENTIS frontend demonstration.

The risk score is based on browser-side image/file
characteristics and does not establish legal authenticity,
validity, ownership, or genuineness.

A person/selfie image is treated as invalid input and
does not receive a document authenticity risk score.

High-risk or suspicious documents should be subjected
to appropriate human/manual verification.

============================================================
                    END OF REPORT
============================================================
`.trim();

    const blob =
        new Blob(
            [report],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

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

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );
}

/* =========================================================
   SCREENING HISTORY
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

   Stores the actual calculated result.
========================================================= */

function saveToHistory(result) {
    if (
        !selectedFile ||
        !result
    ) {
        return;
    }

    const history =
        getHistory();

    const record = {
        fileName:
            selectedFile.name,

        fileType:
            getReadableFileType(
                selectedFile
            ),

        fileSize:
            formatFileSize(
                selectedFile.size
            ),

        score:
            result.score,

        level:
            result.level,

        type:
            result.type,

        recommendation:
            result.recommendation,

        findings:
            Array.isArray(
                result.findings
            )
                ? result.findings
                : [],

        metrics:
            result.metrics || {},

        timestamp:
            new Date().toISOString()
    };

    history.unshift(record);

    const limitedHistory =
        history.slice(
            0,
            10
        );

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

    history.forEach(
        record => {
            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "identis-history-item";

            const left =
                document.createElement(
                    "div"
                );

            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "identis-history-name";

            name.textContent =
                record.fileName ||
                "Unknown document";

            const meta =
                document.createElement(
                    "div"
                );

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
                    record.fileSize ||
                    "Unknown size"
                } • ${recordDate}`;

            left.appendChild(
                name
            );

            left.appendChild(
                meta
            );

            const right =
                document.createElement(
                    "div"
                );

            right.className =
                "identis-history-right";

            const score =
                document.createElement(
                    "div"
                );

            score.className =
                "identis-history-score";

            score.textContent =
                record.score ===
                    null ||
                typeof record.score ===
                    "undefined"
                    ? "—"
                    : `${record.score}/100`;

            const risk =
                document.createElement(
                    "span"
                );

            risk.className =
                "identis-history-risk";

            if (
                record.level ===
                "LOW RISK"
            ) {
                risk.classList.add(
                    "identis-risk-low"
                );
            } else if (
                record.level ===
                "REVIEW REQUIRED"
            ) {
                risk.classList.add(
                    "identis-risk-review"
                );
            } else if (
                record.level ===
                "INVALID INPUT"
            ) {
                risk.classList.add(
                    "identis-history-invalid"
                );
            } else {
                risk.classList.add(
                    "identis-risk-high"
                );
            }

            risk.textContent =
                record.level ||
                "UNKNOWN";

            right.appendChild(
                score
            );

            right.appendChild(
                risk
            );

            item.appendChild(
                left
            );

            item.appendChild(
                right
            );

            historyList.appendChild(
                item
            );
        }
    );
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
        fileInfo.classList.add(
            "hidden"
        );
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
   NAVIGATION ACTIVE STATE
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

        sections.forEach(
            section => {
                const sectionTop =
                    section.offsetTop -
                    160;

                if (
                    window.scrollY >=
                    sectionTop
                ) {
                    current =
                        section.getAttribute(
                            "id"
                        );
                }
            }
        );

        navLinks.forEach(
            link => {
                link.classList.remove(
                    "active"
                );

                const href =
                    link.getAttribute(
                        "href"
                    );

                if (
                    href ===
                    `#${current}`
                ) {
                    link.classList.add(
                        "active"
                    );
                }
            }
        );
    }
);

/* =========================================================
   NAVIGATION CLICK
========================================================= */

navLinks.forEach(
    link => {
        link.addEventListener(
            "click",
            () => {
                navLinks.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                link.classList.add(
                    "active"
                );
            }
        );
    }
);

/* =========================================================
   INTERSECTION OBSERVER
========================================================= */

const observer =
    new IntersectionObserver(
        entries => {
            entries.forEach(
                entry => {
                    if (
                        entry.isIntersecting
                    ) {
                        entry.target.classList.add(
                            "visible"
                        );
                    }
                }
            );
        },
        {
            threshold: 0.15
        }
    );

document
    .querySelectorAll(
        ".tech-card, .impact-card, .workflow-step, .feasibility-card"
    )
    .forEach(
        element => {
            observer.observe(
                element
            );
        }
    );

/* =========================================================
   CTRL + U
========================================================= */

document.addEventListener(
    "keydown",
    event => {
        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "u"
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
    "%cFrontend image-analysis demonstration mode active.",
    "color:#63f2b1;font-size:11px;"
);

// ======================================
// MARS OUTPOST COMMAND
// GAME ENGINE + NASA MCS DATA
// ======================================


// INITIAL OUTPOST CONDITIONS

const startingResources = {
    oxygen: 92,
    power: 78,
    habitat: 96,
    crew: 84
};

let resources = { ...startingResources };
let currentSol = 0;
let missionStarted = false;
let missionCompleted = false;


// HTML ELEMENTS

const oxygenDisplay = document.getElementById("oxygen");
const powerDisplay = document.getElementById("power");
const habitatDisplay = document.getElementById("habitat");
const crewDisplay = document.getElementById("crew");

const message = document.getElementById("message");
const dialogue = document.getElementById("dialogue");
const choices = document.getElementById("choices");

const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");


// UPDATE THE DASHBOARD

function updateDashboard() {

    for (const system in resources) {

        const value = Math.round(resources[system]);

        const display = document.getElementById(system);
        const bar = document.getElementById(system + "-bar");

        display.textContent = value + "%";
        bar.style.width = value + "%";

        if (value < 30) {
            display.style.color = "#ff5555";
            bar.style.background = "#ff5555";
        } else if (value < 60) {
            display.style.color = "#e6b84b";
            bar.style.background = "#e6b84b";
        } else {
            display.style.color = "#55d6be";
            bar.style.background = "#55d6be";
        }
    }

    updateAlert();
}


// SYSTEM ALERTS

function updateAlert() {

    const lowest = Math.min(...Object.values(resources));
    const alert = document.getElementById("alert");

    if (lowest < 30) {
        alert.textContent = "CRITICAL SYSTEM WARNING";
        alert.style.color = "#ff5555";
    } else if (lowest < 60) {
        alert.textContent = "SYSTEMS UNDER PRESSURE";
        alert.style.color = "#e6b84b";
    } else {
        alert.textContent = "SYSTEMS NOMINAL";
        alert.style.color = "#55d6be";
    }
}


// TYPEWRITER EFFECT

let typingTimer;

function typeText(element, text, speed = 18) {

    clearTimeout(typingTimer);
    element.textContent = "";

    return new Promise(resolve => {
        let index = 0;

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                typingTimer = setTimeout(type, speed);
            } else {
                resolve();
            }
        }

        type();
    });
}


// START THE MISSION

function startMission() {

    if (missionStarted) return;

    missionStarted = true;
    startButton.classList.add("hidden");
    loadMission();
}


// LOAD A SOL

async function loadMission() {

    missionCompleted = false;

    const mission = missions[currentSol];
    
    updateCheMinPanel(mission);
    
    document.getElementById("sol").textContent =
        "SOL " + String(mission.sol).padStart(2, "0");

    document.getElementById("progress").textContent =
        "MISSION " + String(currentSol + 1).padStart(2, "0") +
        " / " + String(missions.length).padStart(2, "0");

    document.getElementById("status").textContent = "MISSION IN PROGRESS";

    document.getElementById("timestamp").textContent =
        "ARES // SOL " + String(mission.sol).padStart(2, "0");

    document.getElementById("event-title").textContent = mission.title;
    document.getElementById("environment").textContent = mission.environment;
    document.getElementById("crew-log").textContent = mission.crewMessage;
    document.getElementById("science-info").textContent = mission.scienceInfo;

    const science = marsScience[mission.science];

    document.getElementById("science-source").textContent =
        "DATA REFERENCE: " + science.instrument +
        " // " + science.source;

    document.getElementById("science-box").classList.remove("hidden");

    choices.innerHTML = "";
    nextButton.classList.add("hidden");
    dialogue.textContent = "";

    document.getElementById("alert").textContent = mission.type;

    updateMissionDataNote(mission);

    await typeText(message, mission.briefing);

    dialogue.textContent = "COMMANDER, SELECT YOUR RESPONSE.";
    createChoices(mission);
}


// ADD ARCHIVED DATA AS CONTEXT FOR CLIMATE MISSIONS

function updateMissionDataNote(mission) {

    const note = document.getElementById("mcs-mission-note");

    if (missionCompleted || mission.science !== "climate" || !selectedMCSProfile) {
        note.classList.add("hidden");
        note.textContent = "";
        return;
    }

    const profile = selectedMCSProfile;
    const surfaceC = profile.T_surf - 273.15;

    note.textContent =
        "ARCHIVED NASA EVIDENCE: The selected MCS profile recorded a " +
        "surface temperature of " + profile.T_surf.toFixed(1) +
        " K (" + surfaceC.toFixed(1) + " °C) at " +
        profile.Date + ", " + profile.UTC +
        " UTC, near " + profile.Profile_lat.toFixed(1) + "° latitude and " +
        profile.Profile_lon.toFixed(1) + "° longitude. " +
        "This is a historical observation at a different location, " +
        "so it provides scientific context rather than a live reading " +
        "for ARES. Compare it with the fictional station alert before deciding.";

    note.classList.remove("hidden");
}


// CREATE DECISION BUTTONS

function createChoices(mission) {

    mission.choices.forEach((choice, index) => {

        const button = document.createElement("button");
        button.className = "choice-button";
        button.textContent = (index + 1) + ". " + choice.text;

        button.addEventListener("click", () => {
            if (missionCompleted) return;
            makeDecision(choice, mission);
        });

        choices.appendChild(button);
    });
}


// APPLY THE CONSEQUENCES

async function makeDecision(choice, mission) {

    missionCompleted = true;

    const buttons = choices.querySelectorAll("button");
    buttons.forEach(button => {
        button.disabled = true;
    });

    for (const system in choice.effects) {
        resources[system] += choice.effects[system];

        resources[system] = Math.max(
            0,
            Math.min(100, resources[system])
        );
    }

    updateDashboard();

    document.getElementById("event-title").textContent = "DECISION RECORDED";

    await typeText(message, choice.result);

    dialogue.textContent = "SCIENTIFIC ANALYSIS";

    document.getElementById("science-info").textContent = choice.explanation;
    document.getElementById("mcs-mission-note").classList.add("hidden");
    document.getElementById("status").textContent = "SHIFT COMPLETED";

    choices.innerHTML = "";

    if (currentSol < missions.length - 1) {
        nextButton.classList.remove("hidden");
    } else {
        showEvaluation();
    }
}


// MOVE TO THE NEXT SOL

function nextMission() {

    if (currentSol >= missions.length - 1) return;

    currentSol++;
    loadMission();
}


// END OF MISSION EVALUATION

function showEvaluation() {

    nextButton.classList.add("hidden");

    document.getElementById("status").textContent = "MISSION COMPLETE";
    document.getElementById("event-title").textContent =
        "MISSION SUCCESSFULLY CONCLUDED";

    document.getElementById("science-box").classList.add("hidden");
    document.getElementById("evaluation").classList.remove("hidden");

    const average =
        Object.values(resources).reduce((a, b) => a + b, 0) / 4;

    let assessment;

    if (average >= 85) {
        assessment =
            "EXCELLENT PERFORMANCE. ARES Research Station has " +
            "maintained strong operational conditions. Your decisions " +
            "demonstrated effective resource management.";
    } else if (average >= 65) {
        assessment =
            "SATISFACTORY PERFORMANCE. The outpost has completed its " +
            "mission, although some systems experienced pressure. " +
            "Your decisions involved important resource trade-offs.";
    } else if (average >= 40) {
        assessment =
            "MISSION COMPLETED WITH DIFFICULTIES. Several systems " +
            "are under strain. Future shifts will require careful " +
            "resource management and maintenance.";
    } else {
        assessment =
            "CRITICAL OPERATIONAL CONDITION. The station has " +
            "experienced significant system deterioration. " +
            "The mission highlights the importance of balancing " +
            "environmental protection, research and crew wellbeing.";
    }

    document.getElementById("evaluation-message").textContent = assessment;

    const finalStats = document.getElementById("final-stats");
    finalStats.innerHTML = "";

    for (const system in resources) {
        const row = document.createElement("p");
        row.textContent = system.toUpperCase() + ": " + resources[system] + "%";
        finalStats.appendChild(row);
    }

    document.getElementById("evaluation").scrollIntoView({
        behavior: "smooth"
    });
}


// RESTART THE MISSION

function restartMission() {

    resources = { ...startingResources };
    currentSol = 0;
    missionStarted = false;
    missionCompleted = false;

    document.getElementById("evaluation").classList.add("hidden");
    document.getElementById("science-box").classList.add("hidden");
    document.getElementById("mcs-mission-note").classList.add("hidden");

    document.getElementById("event-title").textContent =
        "Awaiting mission briefing";

    message.textContent =
        "Commander, your shift is ready. Initialise the mission to receive your briefing.";

    dialogue.textContent = "";
    choices.innerHTML = "";

    document.getElementById("status").textContent = "AWAITING COMMAND";
    startButton.classList.remove("hidden");

    updateDashboard();

    document.getElementById("sol").textContent = "SOL 01";
    document.getElementById("progress").textContent = "MISSION 01 / 03";

    document.getElementById("environment").textContent =
        "Atmospheric conditions stable.";

    document.getElementById("crew-log").textContent = "No new messages.";
    document.getElementById("alert").textContent = "SYSTEMS NOMINAL";
    document.getElementById("timestamp").textContent = "ARES // SOL 01";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================
// NASA MARS CLIMATE SOUNDER DATA
// ======================================

let mcsData = null;
let selectedMCSProfile = null;

const MCS_FILE = "2006092416_DDR.TAB";
const MCS_ROWS_PER_PROFILE = 106; // 1 summary row + 105 altitude levels


// Parse a CSV line, including quoted fields

function parseCSVLine(line) {

    const result = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {

        const character = line[i];

        if (character === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                value += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (character === "," && !insideQuotes) {
            result.push(value.trim());
            value = "";
        } else {
            value += character;
        }
    }

    result.push(value.trim());
    return result;
}


// Convert missing values and numeric strings

function convertMCSValue(value) {

    const cleaned = value.trim().replace(/^"|"$/g, "").trim();

    if (cleaned === "" || cleaned === "-9999") {
        return null;
    }

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : cleaned;
}


// Turn a row into an object using its column headings

function makeMCSObject(headers, values) {

    const object = {};

    headers.forEach((header, index) => {
        object[header.trim()] = convertMCSValue(values[index] ?? "");
    });

    return object;
}


// Load and parse the original NASA archive file

async function loadMCSData() {

    const status = document.getElementById("mcs-status");
    const reading = document.getElementById("mcs-reading");
    const nextProfileButton = document.getElementById("mcs-next-button");

    try {

        status.textContent = "CONNECTING TO LOCAL ARCHIVE...";

        const response = await fetch(MCS_FILE);

        if (!response.ok) {
            throw new Error(
                "The browser could not find " + MCS_FILE +
                ". Check the filename and folder."
            );
        }

        const fileText = await response.text();

        // Ignore comment lines beginning with #.
        const lines = fileText
            .split(/\r?\n/)
            .filter(line =>
                line.trim() !== "" &&
                !line.trimStart().startsWith("#")
            );

        if (lines.length < 3) {
            throw new Error("The TAB file does not contain the expected table.");
        }

        // The first two non-comment lines are the summary and level headings.
        const summaryHeaders = parseCSVLine(lines[0]).slice(1);
        const levelHeaders = parseCSVLine(lines[1]).slice(1);

        const profiles = [];

        // The supplied file contains 198 blocks. Each block has one
        // profile-summary row followed by 105 vertical-level rows.
        for (
            let i = 2;
            i + MCS_ROWS_PER_PROFILE - 1 < lines.length;
            i += MCS_ROWS_PER_PROFILE
        ) {

            const summaryValues = parseCSVLine(lines[i]).slice(1);
            const summary = makeMCSObject(summaryHeaders, summaryValues);

            const levels = [];

            for (let j = 1; j < MCS_ROWS_PER_PROFILE; j++) {

                const values = parseCSVLine(lines[i + j]).slice(1);
                levels.push(makeMCSObject(levelHeaders, values));
            }

            summary.levels = levels;
            profiles.push(summary);
        }

        if (profiles.length === 0) {
            throw new Error("No MCS profiles could be read from the file.");
        }

        mcsData = { profiles };

        status.textContent = "ARCHIVE LOADED";
        status.style.color = "#55d6be";

        nextProfileButton.disabled = false;

        document.getElementById("mcs-profile-count").textContent =
            profiles.length + " PROFILES // " +
            (MCS_ROWS_PER_PROFILE - 1) + " LEVELS EACH";

        console.log("NASA MCS archive loaded:", profiles.length, "profiles");

        showMCSObservation();

    } catch (error) {

        console.error("MCS data loading error:", error);

        status.textContent = "ARCHIVE UNAVAILABLE";
        status.style.color = "#ff7777";

        reading.textContent =
            error.message +
            " Run the website with VS Code Live Server and keep the TAB file beside index.html.";

        document.getElementById("mcs-chart").textContent =
            "Temperature graph unavailable until the data file loads.";

        document.getElementById("mcs-profile-count").textContent =
            "No profile selected.";
    }
}


// Choose and display one real profile

function showMCSObservation() {

    if (!mcsData || !mcsData.profiles.length) return;

    const validProfiles = mcsData.profiles.filter(profile =>
        typeof profile.T_surf === "number" &&
        typeof profile.Profile_lat === "number" &&
        typeof profile.Profile_lon === "number"
    );

    if (!validProfiles.length) return;

    let profile;

    // Avoid immediately showing the same profile twice.
    const alternatives = validProfiles.filter(item =>
        item !== selectedMCSProfile
    );

    const pool = alternatives.length ? alternatives : validProfiles;

    profile = pool[Math.floor(Math.random() * pool.length)];

    selectedMCSProfile = profile;

    const surfaceC = profile.T_surf - 273.15;
    const nearSurfaceC =
        typeof profile.T_near_surf === "number"
            ? (profile.T_near_surf - 273.15).toFixed(1) + " °C"
            : "Unavailable";

    const dustValue =
        typeof profile.Dust_column === "number"
            ? profile.Dust_column.toFixed(4)
            : "Unavailable";

    const waterIceValue =
        typeof profile.H2Oice_column === "number"
            ? profile.H2Oice_column.toFixed(4)
            : "Unavailable";

    const reading = document.getElementById("mcs-reading");
    reading.innerHTML = `
        <div class="mcs-reading-grid">
            <div class="mcs-primary-reading">
                <span class="mcs-data-label">SURFACE TEMPERATURE</span>
                <strong>${profile.T_surf.toFixed(1)} K</strong>
                <span>${surfaceC.toFixed(1)} °C</span>
            </div>
            <div class="mcs-data-item">
                <span class="mcs-data-label">NEAR-SURFACE TEMPERATURE</span>
                <strong>${nearSurfaceC}</strong>
            </div>
            <div class="mcs-data-item">
                <span class="mcs-data-label">DUST COLUMN VALUE</span>
                <strong>${dustValue}</strong>
            </div>
            <div class="mcs-data-item">
                <span class="mcs-data-label">WATER-ICE COLUMN VALUE</span>
                <strong>${waterIceValue}</strong>
            </div>
        </div>
        <div class="mcs-location">
            <span><b>DATE:</b> ${profile.Date} // ${profile.UTC} UTC</span>
            <span><b>PROFILE LOCATION:</b> ${profile.Profile_lat.toFixed(2)}°,
            ${profile.Profile_lon.toFixed(2)}°</span>
            <span><b>ORBIT:</b> ${profile.Orb_num}</span>
        </div>
    `;

    drawMCSTemperatureChart(profile);
    updateMissionDataNote(missions[currentSol]);
}


// Draw a temperature-versus-altitude graph using one profile

function drawMCSTemperatureChart(profile) {

    const chart = document.getElementById("mcs-chart");

    const points = profile.levels
        .filter(level =>
            typeof level.T === "number" &&
            typeof level.Alt === "number" &&
            level.T > 0 &&
            level.Alt >= 0
        )
        .sort((a, b) => a.Alt - b.Alt);

    if (points.length < 2) {
        chart.textContent =
            "Not enough valid temperature levels are available for this profile.";
        return;
    }

    const width = 680;
    const height = 310;
    const left = 65;
    const right = 25;
    const top = 18;
    const bottom = 48;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const minTemp = 100;
    const maxTemp = 300;
    const maxAltitude = Math.max(
        100,
        Math.ceil(points[points.length - 1].Alt / 20) * 20
    );

    const x = temperature =>
        left + ((temperature - minTemp) / (maxTemp - minTemp)) * plotWidth;

    const y = altitude =>
        top + plotHeight - (altitude / maxAltitude) * plotHeight;

    const path = points.map((point, index) =>
        (index === 0 ? "M" : "L") +
        x(point.T).toFixed(2) + "," +
        y(point.Alt).toFixed(2)
    ).join(" ");

    let grid = "";

    for (let temp = 100; temp <= 300; temp += 50) {
        const xPosition = x(temp);

        grid += `
            <line x1="${xPosition}" y1="${top}" x2="${xPosition}"
                y2="${top + plotHeight}" class="chart-grid-line" />
            <text x="${xPosition}" y="${height - 20}"
                text-anchor="middle" class="chart-axis-label">${temp}</text>
        `;
    }

    for (let altitude = 0; altitude <= maxAltitude; altitude += 20) {
        const yPosition = y(altitude);

        grid += `
            <line x1="${left}" y1="${yPosition}" x2="${width - right}"
                y2="${yPosition}" class="chart-grid-line" />
            <text x="${left - 12}" y="${yPosition + 4}"
                text-anchor="end" class="chart-axis-label">${altitude}</text>
        `;
    }

    chart.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img"
            aria-label="Temperature in kelvin plotted against altitude in kilometres">
            ${grid}
            <line x1="${left}" y1="${top}" x2="${left}"
                y2="${top + plotHeight}" class="chart-axis-line" />
            <line x1="${left}" y1="${top + plotHeight}"
                x2="${width - right}" y2="${top + plotHeight}"
                class="chart-axis-line" />
            <path d="${path}" class="temperature-line" />
            <text x="${left + plotWidth / 2}" y="${height - 2}"
                text-anchor="middle" class="chart-axis-title">
                TEMPERATURE (K)
            </text>
            <text x="16" y="${top + plotHeight / 2}"
                text-anchor="middle" class="chart-axis-title"
                transform="rotate(-90 16 ${top + plotHeight / 2})">
                ALTITUDE (KM)
            </text>
        </svg>
        <p class="chart-caption">
            ${points.length} valid temperature levels plotted from this profile.
            Missing measurements are not plotted.
        </p>
    `;
}


// INITIALISE DASHBOARD AND LOAD ARCHIVED DATA

updateDashboard();
loadMCSData();


// ======================================
// NASA CHEMIN DATA — MARTIAN SOIL ANALYSIS
// ======================================

let cheminRDA = [];
let cheminMIN = [];
let cheminLoaded = false;

const CHEMIN_RDA_FILE =
    "cma_404470826rda00790050104ch11503p1.csv";

const CHEMIN_MIN_FILE =
    "cma_404470826min00790050104ch11503p1.csv";


// LOAD THE TWO CHEMIN CSV FILES

async function loadCheMinData() {

    const details = document.getElementById("chemin-rda-details");

    try {
        details.textContent = "Loading NASA CheMin measurements...";

        const [rdaResponse, minResponse] = await Promise.all([
            fetch(CHEMIN_RDA_FILE),
            fetch(CHEMIN_MIN_FILE)
        ]);

        if (!rdaResponse.ok || !minResponse.ok) {
            throw new Error(
                "Could not find one or both CheMin CSV files. Check their filenames and folder."
            );
        }

        const rdaText = await rdaResponse.text();
        const minText = await minResponse.text();

        // Read the diffraction measurements

        const rdaLines = rdaText.trim().split(/\r?\n/);

        cheminRDA = rdaLines.slice(1)
            .map(line => line.split(","))
            .filter(row => row.length >= 2)
            .map(row => ({
                angle: Number(row[0]),
                intensity: Number(row[1])
            }))
            .filter(point =>
                Number.isFinite(point.angle) &&
                Number.isFinite(point.intensity)
            );

        // Read the mineral abundance measurements

        const minLines = minText.trim().split(/\r?\n/);

        cheminMIN = minLines.slice(1)
            .map(line => line.split(","))
            .filter(row => row.length >= 3)
            .map(row => ({
                mineral: row[0].trim(),
                percent: Number(row[1]),
                error: Number(row[2])
            }))
            .filter(mineral =>
                Number.isFinite(mineral.percent) &&
                Number.isFinite(mineral.error)
            );

        if (cheminRDA.length === 0 || cheminMIN.length === 0) {
            throw new Error("The CheMin files loaded, but no valid measurements were found.");
        }

        cheminLoaded = true;

        drawCheMinChart();
        displayCheMinMinerals();

        details.textContent =
            cheminRDA.length +
            " diffraction measurements loaded from the Rocknest sample.";

        console.log("CheMin data loaded:", {
            diffractionMeasurements: cheminRDA.length,
            minerals: cheminMIN.length
        });

    } catch (error) {
        console.error("CheMin loading error:", error);
        details.textContent = error.message;
    }
}


// DRAW THE X-RAY DIFFRACTION GRAPH

function drawCheMinChart() {

    const canvas = document.getElementById("chemin-chart");

    if (!canvas || cheminRDA.length === 0) return;

    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth || 600;
    const height = 300;

    canvas.width = width * 2;
    canvas.height = height * 2;

    ctx.scale(2, 2);

    const left = 55;
    const right = 20;
    const top = 20;
    const bottom = 45;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const minAngle = Math.min(...cheminRDA.map(p => p.angle));
    const maxAngle = Math.max(...cheminRDA.map(p => p.angle));

    const maxIntensity = Math.max(...cheminRDA.map(p => p.intensity));

    const x = angle =>
        left + ((angle - minAngle) / (maxAngle - minAngle)) * plotWidth;

    const y = intensity =>
        top + plotHeight - (intensity / maxIntensity) * plotHeight;

    ctx.clearRect(0, 0, width, height);

    // Grid lines

    ctx.strokeStyle = "#344956";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const yPosition = top + (plotHeight / 4) * i;

        ctx.beginPath();
        ctx.moveTo(left, yPosition);
        ctx.lineTo(width - right, yPosition);
        ctx.stroke();
    }

    // Diffraction line

    ctx.beginPath();
    ctx.strokeStyle = "#55d6be";
    ctx.lineWidth = 1.5;

    cheminRDA.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(x(point.angle), y(point.intensity));
        } else {
            ctx.lineTo(x(point.angle), y(point.intensity));
        }
    });

    ctx.stroke();

    // Axis labels

    ctx.fillStyle = "#e6edf3";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";

    ctx.fillText("2-THETA (degrees)", width / 2, height - 8);

    ctx.save();
    ctx.translate(14, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("DIFFRACTION INTENSITY", 0, 0);
    ctx.restore();

    ctx.textAlign = "center";

    ctx.fillText(minAngle.toFixed(1), left, height - 27);
    ctx.fillText(maxAngle.toFixed(1), width - right, height - 27);
}


// DISPLAY THE MINERALS FOUND IN THE SAMPLE

function displayCheMinMinerals() {

    const container = document.getElementById("chemin-minerals");

    if (!container) return;

    container.innerHTML = "";

    cheminMIN.forEach(mineral => {

        const row = document.createElement("div");
        row.className = "mineral-row";

        const label = document.createElement("div");
        label.className = "mineral-label";

        label.innerHTML =
            `<strong>${mineral.mineral}</strong>
             <span>${mineral.percent.toFixed(1)}% ± ${mineral.error.toFixed(1)}</span>`;

        const barBackground = document.createElement("div");
        barBackground.className = "mineral-bar-background";

        const bar = document.createElement("div");
        bar.className = "mineral-bar";

        bar.style.width = Math.min(mineral.percent, 100) + "%";

        barBackground.appendChild(bar);

        row.appendChild(label);
        row.appendChild(barBackground);

        container.appendChild(row);
    });
}


// SHOW CHEMIN DATA ONLY DURING SOL 2

function updateCheMinPanel(mission) {

    const panel = document.getElementById("chemin-panel");

    if (!panel) return;

    if (mission.sol === 2) {

        panel.classList.remove("hidden");

        if (!cheminLoaded) {
            loadCheMinData();
        }

    } else {
        panel.classList.add("hidden");
    }
}


// REDRAW THE GRAPH WHEN THE WINDOW CHANGES SIZE

window.addEventListener("resize", () => {

    if (cheminLoaded) {
        drawCheMinChart();
    }

});

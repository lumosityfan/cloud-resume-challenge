const apiEndpoint = 'https://oewttkdxce.execute-api.us-east-2.amazonaws.com/job-match-calculator';

document.getElementById("JobMatchForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Declare this first — referencing it before this line (as a bare
    // global) threw a ReferenceError and silently killed the handler.
    const output = document.getElementById("output");

    const jobDescription = document.getElementById("jobDescription").value.trim();
    const jobUrl = document.getElementById("jobUrl").value.trim();
    const fileInput = document.getElementById("resume");

    if (!fileInput.files[0]) {
        output.innerHTML = `
            <div class="alert alert-danger mt-4" role="alert">
                Please upload a resume file.
            </div>
        `;
        return;
    }

    if (!jobDescription && !jobUrl) {
        output.innerHTML = `
            <div class="alert alert-danger mt-4" role="alert">
                Please provide either a job description or a job URL.
            </div>
        `;
        return;
    }

    output.innerHTML = `
        <div class="text-center mt-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Analyzing your resume...</p>
        </div>
    `;

    try {
        const file = fileInput.files[0];
        const pdfBase64 = await fileToBase64(file);

        const payload = {
            pdfBase64: pdfBase64,
            pdfFilename: file.name
        };
        if (jobDescription) payload.jobDescription = jobDescription;
        if (jobUrl) payload.jobUrl = jobUrl;

        const res = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.error) {
            output.innerHTML = `
                <div class="alert alert-danger mt-4" role="alert">
                    ${data.error}
                </div>
            `;
            return;
        }

        renderResultCard(data);

    } catch (err) {
        output.innerHTML = `
            <div class="alert alert-danger mt-4" role="alert">
                Request failed: ${err.message}
            </div>
        `;
    }
});

// Reads a File and resolves to just the base64 payload (strips the
// "data:<mime>;base64," prefix that readAsDataURL adds).
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read the file"));
        reader.readAsDataURL(file);
    });
}

function scoreColor(score) {
    if (score >= 75) return "success";
    if (score >= 50) return "warning";
    return "danger";
}

function listItems(items, icon, colorClass) {
    if (!items || items.length === 0) return `<li class="list-group-item text-muted">None noted</li>`;
    return items.map(item => `
        <li class="list-group-item d-flex align-items-start">
            <span class="me-2 ${colorClass}">${icon}</span>
            <span>${item}</span>
        </li>
    `).join("");
}

function renderResultCard(data) {
    const color = scoreColor(data.score);

    const html = `
        <div class="card mt-4 shadow-sm">
            <div class="card-body text-center border-bottom">
                <h6 class="text-muted text-uppercase mb-2" style="letter-spacing: 1px; font-size: 0.8rem;">Match Score</h6>
                <div class="display-4 fw-bold text-${color}">${data.score}<span class="fs-4 text-muted">/100</span></div>
                <div class="progress mt-2" style="height: 8px;">
                    <div class="progress-bar bg-${color}" role="progressbar" style="width: ${data.score}%"></div>
                </div>
                <p class="mt-3 mb-0 fst-italic text-secondary">${data.summary || ""}</p>
            </div>

            <div class="card-body">
                <h6 class="fw-bold text-success mb-2">Strengths</h6>
                <ul class="list-group list-group-flush mb-3">
                    ${listItems(data.strengths, "✓", "text-success")}
                </ul>

                <h6 class="fw-bold text-danger mb-2">Gaps</h6>
                <ul class="list-group list-group-flush mb-3">
                    ${listItems(data.gaps, "✗", "text-danger")}
                </ul>

                <h6 class="fw-bold text-primary mb-2">Suggestions</h6>
                <ul class="list-group list-group-flush">
                    ${listItems(data.suggestions, "→", "text-primary")}
                </ul>
            </div>
        </div>
    `;

    document.getElementById("output").innerHTML = html;
}
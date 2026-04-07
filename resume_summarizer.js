const apiEndpoint = 'https://xt9kqsik74.execute-api.us-east-2.amazonaws.com/resume-summarizer';

// Get resume summarizer form information
const resume_summarizer_form = document.getElementById('resume-summarizer-form');
resume_summarizer_form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = document.getElementById('formFile').files[0];
    if (!file) {
        alert('Please select a PDF file first.');
        return;
    }

    // convert PDF to base64
    const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // strip the data:application/pdf;base64, prefix
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    try {
        document.getElementById('summary-result').textContent = 'Summarizing...';

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfBase64: base64 }),
        });

        if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
        const data = await response.json();
        document.getElementById('summary-result').innerHTML = data;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('summary-result').textContent = 'Error summarizing resume.';
    }
});
// Example using fetch in your static site's JavaScript
const apiEndpoint = 'https://w0krslxy78.execute-api.us-east-2.amazonaws.com/visitor-counter';

async function fetchAndPost() {
    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
        const data = await response.json();
        document.getElementById('visitor-count').textContent = data[0].counter;
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndPost();

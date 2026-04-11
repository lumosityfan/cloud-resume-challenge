// Example using fetch in your static site's JavaScript
const apiEndpoint = 'https://oewttkdxce.execute-api.us-east-2.amazonaws.com/uniqueVisitorCount/increment';

async function fetchAndPost() {
    try {
        const postResponse = await fetch(apiEndpoint, { method: 'POST' });
        if (!postResponse.ok) throw new Error(`POST request failed: ${postResponse.statusText}`);
        const postData = await postResponse.json();
        document.getElementById('unique-visitor-count').textContent = postData.unique_visitor_counter;
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndPost();
// Example using fetch in your static site's JavaScript
const apiEndpointGet = 'https://oewttkdxce.execute-api.us-east-2.amazonaws.com/visitorCount';
const apiEndpointPost = 'https://oewttkdxce.execute-api.us-east-2.amazonaws.com/visitorCount/increment';

async function fetchAndPost() {
    try {
        const response = await fetch(apiEndpointGet);
        if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
        const data = await response.json();
        if (data.length === 0) {
            data[0] = {
                counter: 0,
                id: "visitor-counter",
                name: "Visitor Counter"
            }
        }
        const postResponse = await fetch(apiEndpointPost, { method: 'POST', 
                                                            headers: { 
                                                                'Content-Type': 'application/json',
                                                                'Cache-Control': 'no-cache'
                                                            }, 
                                                            body: JSON.stringify(data[0]) });
        if (!postResponse.ok) throw new Error(`POST request failed: ${postResponse.statusText}`);
        const postData = await postResponse.json();
        document.getElementById('visitor-count').textContent = postData[0].counter;
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndPost();

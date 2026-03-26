// Example using fetch in your static site's JavaScript
const apiEndpointGet = 'https://p05vz9vxlc.execute-api.us-east-2.amazonaws.com/visitor-counter';
const apiEndpointPost = 'https://p05vz9vxlc.execute-api.us-east-2.amazonaws.com/';

async function fetchAndPost() {
    try {
        // 1. GET requst
        const getResponse = await fetch(apiEndpointGet);
        if (!getResponse.ok) throw new Error(`GET request failed: ${getResponse.statusText}`);
        const data = await getResponse.json();
        
        // 2. POST request
        const newVisitorCount = data[0].counter + 1;
        const postResponse = await fetch(apiEndpointPost, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                counter: newVisitorCount,
                id: data[0].id,
                name: data[0].name 
            }),
        });
        if (!postResponse.ok) throw new Error(`POST request failed: ${postResponse.statusText}`);
        const postData = await postResponse.json();

        document.getElementById('visitor-count').textContent = newVisitorCount;
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndPost();

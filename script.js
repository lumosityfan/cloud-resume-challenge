// Example using fetch in your static site's JavaScript
const apiEndpoint = 'https://p05vz9vxlc.execute-api.us-east-2.amazonaws.com/';
const data = { 
    counter: 1,
    id: 'unique-id-12345',
    name: 'John Doe',
 };

fetch(apiEndpoint, {
    method: 'POST', // or 'POST' if you want to send data
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch((error) => console.error('Error:', error));

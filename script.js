// Example using fetch in your static site's JavaScript
const apiEndpoint = 'https://p05vz9vxlc.execute-api.us-east-2.amazonaws.com/visitor-counter';
// const data = { 
//     counter: 1,
//     id: 'visitor-counter',
//     name: 'Website Visitor Counter',
//  };

fetch(apiEndpoint, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
.then(response => console.log('Response:', response.json()))
.catch((error) => console.error('Error:', error));

// Example using fetch in your static site's JavaScript
const apiEndpointGet = 'https://p05vz9vxlc.execute-api.us-east-2.amazonaws.com/visitor-counter';
const apiEndpointPost = 'https://p05vz9vxlc.execute-api.us-east-2.amazonaws.com/';
let visitorCountObject

// Get initial visitor count
fetch(apiEndpointGet, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
.then(response => response.json())
.then(data => {
    console.log('Success:', data);
    visitorCountObject = data
})
.catch((error) => console.error('Error:', error));

console.log(visitorCountObject)
// const newVisitorCount = visitorCountObject.counter + 1;

// // Update visitor count
// fetch(apiEndpointPost, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ 
//         counter: newVisitorCount,
//         id: visitorCountObject.id,
//         name: visitorCountObject.name }),
// })
// .then(response => response.json())
// .then(data => {
//     console.log('Success:', data);
//     document.getElementById('visitor-count').textContent = newVisitorCount;
// })
// .catch((error) => console.error('Error:', error));
const fetch = require('node-fetch');

function registerEndpoint() {
    const res = fetch('http://40.113.32.16:8080/webhooks/register', {
        method: "POST",
        'content-type' : "application/json",
        body : JSON.stringify({
           endpoint: 'https://fc66-87-72-193-253.eu.ngrok.io/payment',
           eventType : 'bob' 
        })
    }).then((res) => console.log(res.status));   
}


function unregisterEndpoint() {
    const res = fetch('http://40.113.32.16:8080/webhooks/unregister', {
        method: "POST",
        'content-type' : "application/json",
        body : JSON.stringify({
           endpoint: 'https://3254-87-72-193-253.eu.ngrok.io/payment',
           eventType : 'bob' 
        })
    }).then((res) => console.log(res.status))
}
//registerEndpoint();
unregisterEndpoint();
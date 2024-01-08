// client.js
const axios = require('axios');

const apiUrl = 'http://localhost:3000/audit'; // Adjust the URL based on your server configuration
const urlsToAudit = [
    "https://www.microsoft.com",
    "https://www.google.com",
];

const auditData = {
    urls: urlsToAudit,
};

const startTime = new Date();

axios.post(apiUrl, auditData)
    .then(response => {
        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        console.log('The data has been saved in lighthouse_reports.json');
        console.log('Audit results:', response.data.lighthouseReports);
        console.log(`Time taken: ${elapsedTime} milliseconds`);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });

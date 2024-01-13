const express = require('express');
const bodyParser = require('body-parser');
const { main } = require('./light');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.get('/', (req, res) => {
    return res.status(200).json({ message: 'The server is running' });
});

app.post('/audit', async (req, res) => {
    const { urls } = req.body;

    if (!urls) {
        return res.status(400).json({ error: 'Invalid request. Please provide an array of URLs.' });
    }

    try {
        // Check if the number of values in the array is greater than 25
        if (urls.length > 25) {
            const totalUrls = urls.length;
            const size1 = Math.floor(totalUrls / 3);
            const size2 = size1 * 2;

            // Divide the array into three sub-arrays
            const urls1 = urls.slice(0, size1);
            const urls2 = urls.slice(size1, size2);
            const urls3 = urls.slice(size2);

            // Use Promise.all to send requests concurrently
            const [lighthouseReports1, lighthouseReports2, lighthouseReports3] = await Promise.all([
                postToEndpoint(urls1, 'https://light-bot-two.onrender.com/audit'),
                postToEndpoint(urls2, 'https://legendary-eureka.onrender.com/audit'),
                main(urls3)
            ]);

            console.log("First server")
            console.log(lighthouseReports1)
            console.log("Second server")
            console.log(lighthouseReports2)
            console.log("Third server")
            console.log(lighthouseReports3);

            // Combine the results
            const combinedReports = [
                ...lighthouseReports1,
                ...lighthouseReports2,
                ...lighthouseReports3
            ];

            console.log(combinedReports);
            res.json({ lighthouseReports: combinedReports });
        } else {
            // If the array has 25 or fewer values, pass it directly to the function
            const lighthouseReports = await main(urls);
            console.log(lighthouseReports);
            res.json({ lighthouseReports });
        }
    } catch (error) {
        console.error('Error processing audit request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to send POST request to a specific endpoint
async function postToEndpoint(urls, endpoint) {
    const auditData = { urls };

    try {
        const response = await axios.post(endpoint, auditData);
        return response.data;
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error.message);
        throw error;
    }
}

// Rest of the code remains unchanged

// Schedule pings for the four endpoints
const endpoints = [
    'https://light-bot-two.onrender.com',
    'https://legendary-eureka.onrender.com'       
];

const pingAllServers = async () => {
    const pingPromises = endpoints.map(endpoint => schedulePing(endpoint));
    await Promise.all(pingPromises);
    console.log('All pings completed successfully.');
};

async function schedulePing(endpoint) {
    try {
        // Initial ping
        await pingServer(endpoint);

        // Schedule a new ping after a random interval
        const interval = getRandomInterval();
        console.log(`Waiting for ${interval} milliseconds before the next ping to ${endpoint}`);
        await delay(interval);

        // Schedule the next ping
        await schedulePing(endpoint);
    } catch (error) {
        console.error(`Error pinging ${endpoint}:`, error.message);
        // Continue to the next ping even if there's an error
    }
}

async function pingServer(endpoint) {
    try {
        const response = await axios.get(endpoint);
        console.log(`Ping to ${endpoint} successful. Response:`, response.data);
    } catch (error) {
        console.error(`Error pinging ${endpoint}:`, error.message);
        throw error; // Propagate the error to the caller
    }
}

function getRandomInterval() {
    // Get a random interval between 1 and 14 minutes in milliseconds
    return Math.floor(Math.random() * 14 * 60 * 1000) + 1;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start pinging all servers
pingAllServers();

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

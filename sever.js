const express = require('express');
const bodyParser = require('body-parser');
const {main} = require('./light');
const {main_2} = require('./light_2'); // Assuming you have a second 'main' function in 'light_2'
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

    // Divide the URLs into two halves
    const mid = Math.ceil(urls.length / 2); 
    const urls1 = urls.slice(0, mid);
    const urls2 = urls.slice(mid);

    try {
        // Use Promise.all to run both functions concurrently
        const [lighthouseReports1, lighthouseReports2] = await Promise.all([main(urls1), main_2(urls2)]);
        console.log(`report 1 is ${lighthouseReports1})
        console.log(`report 2 is ${lighthouseReports2})
        // console.log(lighthouseReports1, lighthouseReports2)
        res.json({ lighthouseReports1, lighthouseReports2 });
    } catch (error) {
        console.error('Error processing audit request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

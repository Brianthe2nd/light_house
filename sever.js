const express = require('express');
const bodyParser = require('body-parser');
const {main} = require('./light');
const {main_2} = require('./light_2');
const {main_3} = require('./light_3');
const {main_4} = require('./light_4');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/audit', async (req, res) => {
    const { urls } = req.body;

    if (!urls) {
        return res.status(400).json({ error: 'Invalid request. Please provide an array of URLs.' });
    }

    try {
        let lighthouseReports;
        if (urls.length < 4) {
            // If the number of URLs is less than 4, use a singular main function
            lighthouseReports = await main_4(urls);
        } else {
            // If the number of URLs is 4 or more, divide the urls array into four
            const quarter = Math.ceil(urls.length / 4); 
            const urls1 = urls.slice(0, quarter);
            const urls2 = urls.slice(quarter, quarter*2);
            const urls3 = urls.slice(quarter*2, quarter*3);
            const urls4 = urls.slice(quarter*3);

            // Pass the divided arrays to the functions simultaneously
            const [lighthouseReports1, lighthouseReports2, lighthouseReports3, lighthouseReports4] = await Promise.all([main(urls1), main_2(urls2), main_3(urls3), main_4(urls4)]);

            // Combine the reports
            lighthouseReports = [...lighthouseReports1, ...lighthouseReports2, ...lighthouseReports3, ...lighthouseReports4];
        }
        console.log(lighthouseReports)
        res.json({ lighthouseReports });
    } catch (error) {
        console.error('Error processing audit request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

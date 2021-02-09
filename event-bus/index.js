const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];

app.post('/events', async (req, res) => {
  const event = req.body;
  console.log('Received event', event);

  events.push(event);

  try {
    axios.post(`http://posts-clusterip-srv:4000/events`, event);
    axios.post(`http://comments-srv:4001/events`, event);
    axios.post(`http://query-srv:4002/events`, event);
    axios.post(`http://moderation-srv:4003/events`, event);
  } catch (e) {}

  res.status(200).send({ status: 'OK' });
});

app.get('/events', (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log('Event Bus Listening on 4005');
});

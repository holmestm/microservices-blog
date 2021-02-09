const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const posts = {};

function handleEvent(type, data) {
  let comment = {};
  switch (type) {
    case 'PostCreated':
      posts[data.id] = { id: data.id, title: data.title, comments: [] };
      break;
    case 'CommentCreated':
      comment = { id: data.id, content: data.content, status: data.status };
      posts[data.postId].comments.push(comment);
      break;
    case 'CommentUpdate':
      comment = posts[data.postId].comments.find((x) => {
        return x.id === data.id;
      });
      comment.status = data.status;
      comment.content = data.content;
      break;
    default:
      break;
  }
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.get('/posts/:id', (req, res) => {
  res.send(posts[req.params.id] || {});
});

app.post('/events', (req, res) => {
  console.log('Received event', req.body);

  handleEvent(req.body.type, req.body.data);

  res.send({});
});

app.listen(4002, async () => {
  console.log('Query Service Listening on 4002');

  const res = await axios.get('http://event-bus-srv:4005/events');
  console.log('Reapplying events:');

  res.data.map((event) => {
    handleEvent(event.type, event.data);
  });
  console.log('Finished Startup');
});

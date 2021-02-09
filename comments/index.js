const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.post('/events', async(req, res) => {
  console.log('Received event', req.body);
  let { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { postId, id, status } = data;
    const comments = commentsByPostId[postId];
    let comment = comments.find(x=> {if (x.id===id) return x});
    comment.status=status;
    let content = comment.content;
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdate',
      data: {
        ...comment,
        postId: postId
      }
    });
  }

  res.send({});
});

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || {});
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  let comment = { id: commentId, content, status: 'pending' };

  comments.push(comment);
  commentsByPostId[req.params.id] = comments;

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      ...comment,
      postId: req.params.id
    }
  })

  res.status(201).send(comments);
});

app.listen(4001, () => {
  console.log('Comments Service Listening on 4001');
});
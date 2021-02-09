import React from 'react';

export default ({ comments }) => {
  const renderedComments = comments.map(comment => {
    let content = comment.status==='approved' ? comment.content : 'redacted'
    return <li key={comment.id}>{content}</li>;
  });
  return <ul>{renderedComments}</ul>
};
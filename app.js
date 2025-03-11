const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const db = require('./db/database');

const app = express();
const port = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  db.all(`SELECT * FROM users`, (err, users) => {
    if (err) { 
      res.status(500).send(err.message);
      return;
    }
    const postsQuery = `
      SELECT posts.id, posts.title, posts.content, users.name AS author
      FROM posts
      JOIN users ON posts.user_id = users.id
    `;
    db.all(postsQuery, [], (err, posts) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      const commentsQuery = `
        SELECT comments.id, comments.comment, posts.title AS postTitle, users.name AS commenter
        FROM comments
        JOIN posts ON comments.post_id = posts.id
        JOIN users ON comments.user_id = users.id
      `;
      db.all(commentsQuery, [], (err, comments) => {
        if (err) {
          res.status(500).send(err.message);
          return;
        }
        res.render('index', { 
          users: users || [], 
          posts: posts || [], 
          comments: comments || [] 
        });
      });
    });
  });
});


app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
  
    db.get(checkQuery, [email], (err, existingUser) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (existingUser) {
        return res.status(400).send('Uživatel s tímto e-mailem již existuje.');
      }
      const insertQuery = 'INSERT INTO users (name, email) VALUES (?, ?)';
      db.run(insertQuery, [name, email], function(err) {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.redirect('/');
      });
    });
  });

app.put('/users/:id', (req, res) => {
  const { name, email } = req.body;
  const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  db.run(query, [name, email, req.params.id], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});

app.delete('/users/:id', (req, res) => {
  const query = 'DELETE FROM users WHERE id = ?';
  db.run(query, [req.params.id], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});


app.post('/posts', (req, res) => {
  const { user_id, title, content } = req.body;
  const query = 'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)';
  db.run(query, [user_id, title, content], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});

app.put('/posts/:id', (req, res) => {
  const { title, content } = req.body;
  const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
  db.run(query, [title, content, req.params.id], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});

app.delete('/posts/:id', (req, res) => {
  const query = 'DELETE FROM posts WHERE id = ?';
  db.run(query, [req.params.id], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});


app.post('/comments', (req, res) => {
  const { post_id, user_id, comment } = req.body;
  const query = 'INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)';
  db.run(query, [post_id, user_id, comment], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});


app.put('/comments/:id', (req, res) => {
  const { comment } = req.body;
  const query = 'UPDATE comments SET comment = ? WHERE id = ?';
  db.run(query, [comment, req.params.id], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});


app.delete('/comments/:id', (req, res) => {
  const query = 'DELETE FROM comments WHERE id = ?';
  db.run(query, [req.params.id], function(err) {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.redirect('/');
  });
});


app.listen(port, () => {
  console.log(`Server běží na portu ${port}`);
});

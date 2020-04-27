const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

var knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'web'
  }
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("Working!");
})

app.post('/parent/login', (req, res) => {
  var info = req.body;
  knex('parentlogin')
  .where({username:info.username, password:info.password})
  .select('name')
  .then(data => {
    if(data.length == 1){
      res.json(data[0]);
    }
    else{
      res.json("Something went Wrong!");
    }
  })
  .catch(err => console.log('error in parent login bro'));
});

app.post('/parent/change', (req, res)  => {
  var info = req.body;
  knex('parentlogin')
  .where({name: info.name, password: info.password})
  .update({password: info.new_password})
  .then(result => {
    if(result)
      res.json("Success");
    else
      res.json("Enter Password Correctly!");
  });
});

app.post('/warden/login', (req, res) => {
  var info = req.body;
  knex('securitylogin')
  .where({username:info.username, password:info.password})
  .select()
  .then(data => {
    if(data.length > 0){
      res.json("Success");
    }
    else{
      res.json("Something went Wrong!");
    }
  })
  .catch(err => console.log('error in warden login bro'));
});

app.post('/warden/change', (req, res)  => {
  var info = req.body;
  knex('securitylogin')
  .where({username: info.username, password: info.password})
  .update({password: info.new_password})
  .then(result => {
    if(result)
      res.json("Success");
    else
      res.json("Enter Password Correctly!");
  });
});

app.post('/parent/request', (req, res) => {
  var info = req.body;
  knex('info')
  .insert({name: info.name, username: info.username, reason: info.reason,
           f_d: info.f_d, t_d: info.t_d, status: info.status})
  .then(result => res.json("Success"));
});

app.get('/history', (req, res) => {
  var info = req.query.name;
  knex('info')
  .where({name: info, status: 'accepted'})
  .select()
  .then(response => {
    if(response.length > 0)
      res.json(response);
    else
      res.json("None");
   });
})

app.get('/warden/request', (req, res) => {
  knex('info')
  .where({status: 'pending'})
  .select()
  .then(data => res.json(data))
  .catch(err => res.json("Something went Wrong!"));
});

app.post('/warden/request', (req, res) => {
  var info = req.body;
  knex('info')
  .where({name: info.name, username: info.username})
  .update({status: info.status})
  .then(result => {
    if(result)
      res.json("Success");
    else
      res.json("Failed");
  });
});

app.get('/security', (req, res) => {
  knex('info')
  .where({status: 'accept'})
  .select()
  .then(data => res.json(data))
  .catch(err => res.json("Something went Wrong!"));
});

app.post('/security/accept', (req, res) => {
  var info = req.body;
  knex('info')
  .where({name: info.name, username: info.username})
  .update({status: 'accepted'})
  .then(response => res.json("Success"));
})

var PORT = process.env.PORT;
app.listen(PORT);

//parentlogin TABLE (name, username[rollnumber], password)---
//securitylogin TABLE (username, password)---
//info TABLE (name, username[roll], reason, f_date, t_date, status)

//Parents-Login => post(id, password)---
//Parents-LoggedIn-ChangePassword => post(name, password, new_password)---
//Parents-LoggedIn-Request => post(name, username, reason, f_d, t_d, status)---
//Parents-LoggedIn-History => post(name)
//Warden-Login => post(username, password)---
//Warden-LoggedIn-ChangePassword => post(username, password, new_password)---
//Warden-LoggedIn => get()---
//Warden-LoggedIn-Decide => post(name, username, status)---
//Security => post(name, username)---

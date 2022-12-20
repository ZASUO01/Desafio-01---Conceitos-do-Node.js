const express = require('express');
const cors = require('cors');
const { v4 : uuidv4 } = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const foundUser = users.find((user) => user.username === username);

  if(!foundUser){
    return response.status(404).json({error: 'User not found.'});
  }

  request.user = foundUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyCreated = users.some((user) => user.username === username);

  if(userAlreadyCreated){
    return response.status(400).json({error: 'User already created.'})
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user }  = request
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { title, deadline } = request.body;

   const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
   }

   user.todos.push(newTodo);

   return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if(!foundTodo){
      return response.status(404).json({error: 'Todo not found.'});
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.json(foundTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if(!foundTodo){
      return response.status(404).json({error: 'Todo not found.'});
  }

  foundTodo.done = true;

  return response.json(foundTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const  { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if(!foundTodo){
    return response.status(404).json({error: 'Todo not found.'});
  }

  user.todos = user.todos.filter((todo) => { 
    return todo.id !== id; 
  });

  return response.status(204).send();
});

module.exports = app;
// FRONT-END (CLIENT) JAVASCRIPT HERE

const renderTodos = async function( todos ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  const results = document.querySelector('#todo-results')
  results.innerHTML = ''
  
  todos.forEach(function(todo){
    const row = document.createElement('tr')
    row.innerHTML = `<td>${todo.task}</td> <td>${todo.priority}</td> <td>${todo.creationDate}</td> <td>${todo.deadline}</td>
                  <td> <button type="button" class="delete-button" data-id="${todo.id}">Delete</button></td>`
                  results.appendChild(row)})}


const getTodos = async function () {
  try{
    const response = await fetch('/api/todos')
    if(!response.ok){
      throw new Error('Rendering todos failed')
    }
    const todos = await response.json()
    renderTodos(todos)
  } catch(error){
    const message = document.querySelector('#form-message')
    message.textContent = error.message
  }
}

const submitTodo = async function (event) {
  event.preventDefault()

  const todo = {
    task: document.querySelector('#task').value.trim(),
    priority: document.querySelector('#priority').value,
    creationDate: document.querySelector('#creation-date').value
  }
  try{
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify(todo)
    })
      const data = await response.json()
      if(!response.ok){
        throw new Error(data.error)
      }
      renderTodos(data)
      document.querySelector('#todo-form').reset()
      document.querySelector('#form-message').textContent = 'Todo added successfully'
    } catch(error){
      document.querySelector('#form-message').textContent = error.message
    }
}

const deleteTodo = async function (event) {
  if(!event.target.classList.contains('delete-button')){
    return
  }
  const id = event.target.dataset.id

  try{
    const response = await fetch(`/api/todos/${id}`, {method: 'DELETE'})
    const data = await response.json()

    if(!response.ok){
      throw new Error(data.error)}

    renderTodos(data)
    document.querySelector('#form-message').textContent = 'Todo deleted successfully.'
  } catch(error){
   document.querySelector('#form-message').textContent = error.message}
  
}

window.addEventListener('DOMContentLoaded', function() {
  getTodos()
  document.querySelector('#todo-form').addEventListener('submit', submitTodo)
  document.querySelector('#todo-results').addEventListener('click', deleteTodo)
})
const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

const appdata = [
  { id: 1, task: 'CS Assignment 2', priority: 'medium', creationDate: '2026-09-01', deadline: '2026-09-04' },
  { id: 2, task: 'History Deliverable 2', priority: 'low', creationDate: '2026-09-01', deadline: '2026-09-08' },
  { id: 3, task: 'DS Assignment 1', priority: 'high', creationDate: '2026-09-01', deadline: '2026-09-02' }, 
]

const calculateDeadline = function(creationDate, priority){
  const deadline = new Date(`${creationDate}T00:00:00Z`)
  const daysByPriority = {
    high: 1,
    medium: 3,
    low: 7
  }
  deadline.setUTCDate(
    deadline.getUTCDate() + daysByPriority[priority]
  )
  return deadline.toISOString().slice(0,10)
}

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  } else if (request.method === 'DELETE'){
    handleDelete(request, response)
  } else{
    response.writeHead(405, {'Content-Type': 'application/json'})
    response.end(JSON.stringify({error: 'Method not allowed'}))
  }
})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/api/todos' ) {
    response.writeHead( 200,  {
      'Content-Type': 'application/json'
    })
    response.end(JSON.stringify(appdata))
  }else if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  if(request.url !== '/api/todos'){
    response.writeHead(404, {
      'Content-Type': 'application/json'
    })

    response.end(JSON.stringify({error: 'Endpoint not found'}))
    return
  }
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    try{
      const incomingTodo = JSON.parse(dataString)
      const validPriorities = [ 'high', 'medium', 'low']

      if(
        !incomingTodo.task || !incomingTodo.creationDate || !validPriorities.includes(incomingTodo.priority)
      ){
        response.writeHead( 400, {'Content-Type': 'application/json' })
        response.end(JSON.stringify({error: 'Please provide valid todo information'}))
        return
      }

      const nextId = appdata.length === 0 ? 1 : Math.max(...appdata.map(todo => todo.id)) + 1

      const newTodo = {
        id: nextId,
        task: incomingTodo.task,
        priority: incomingTodo.priority,
        creationDate: incomingTodo.creationDate,
        deadline: calculateDeadline(incomingTodo.creationDate, incomingTodo.priority)
      }
      appdata.push(newTodo)
      // ... do something with the data here
      response.writeHead(201, {'Content-Type': 'application/json'})
      response.end(JSON.stringify(appdata))
    } catch(error){
      response.writeHead(400, {'Content-Type': 'application/json'})
      response.end(JSON.stringify({error: 'Invalid JSON data'}))
    }
  })
}

const handleDelete = function(request, response){
  const match = request.url.match(/^\/api\/todos\/(\d+)$/)

  if (!match){
    response.writeHead(404, {'Content-Type': 'application/json'})
    response.end(JSON.stringify({error: 'Todo not found'}))
    return
  }
  const id = Number(match[1])
  const todoIndex = appdata.findIndex(todo => todo.id === id)

  if(todoIndex === -1){
    response.writeHead(404, {'Content-Type': 'application/json'})
    response.end(JSON.stringify({error: 'Todo not found'}))
    return
  }
  appdata.splice(todoIndex, 1)
  response.writeHead(200, {'Content-Type': 'application/json'})
  response.end(JSON.stringify(appdata))
}


const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHead( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHead( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )

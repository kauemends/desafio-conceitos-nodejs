const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
// const likes = 0;
  
function logRequests(request, response, next) { 
  const { method, url } = request; 

  const logLabel = `[${method.toUpperCase()}] ${url}`; 

  console.time(logLabel);

  next(); 

  console.timeEnd(logLabel); 

}

function validateRepositoryId(request, response, next) {
  const { id } = request.params; 

  if (!isUuid(id)) { 
      return response.status(400).json({ error: "Invalid project ID." }); 
  }

  return next();
}

app.use(logRequests);
app.use("/repositories/:id", validateRepositoryId);

app.get("/repositories", (request, response) => {
  const { title } = request.query;
  const { id } = request.params;

  const results = title
   ? repositories.filter(project => project.title.includes(title))
   : repositories;

   return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  
  const repository = { 
    id: uuid(), 
    title, 
    url, 
    techs,
    likes: 0, 
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => 
    repository.id === id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Project not found." });
  };

  const updatedRepository = {
    title,
    url,
    id,
    techs,
    likes: repositories[repositoryIndex].likes
  };

  repositories[repositoryIndex] = updatedRepository;

  return response.json(updatedRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id }= request.params;

  const repositoryIndex = repositories.findIndex(repository => 
    repository.id === id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Repository not found." });
  } else {
    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();  
  };
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => 
    repository.id === id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Project not found." });
  };
  
  repositories[repositoryIndex].likes++;

  return response.json({ "likes": repositories[repositoryIndex].likes });
});

module.exports = app;

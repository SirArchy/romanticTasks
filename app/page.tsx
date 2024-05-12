"use client"; 

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import EmailIcon from '@mui/icons-material/Email';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContactForm from './contactForm';
import tasksDe from './romanticTasksDe.json';
import tasksEn from './romanticTasksEn.json';
import tasksEs from './romanticTasksEs.json';

const taskListByLanguage = {
  de: tasksDe,
  en: tasksEn,
  es: tasksEs,
};

interface Task {
  id: number;
  description: string;
  attributes: {
    sexual: boolean;
    expensive: boolean;
    outside: boolean;
  };
  likes?: number;
  dislikes?: number;
}

const MainPage: React.FC = () => {
  const [language, setLanguage] = useState('en');
  const [tasks, setTasks] = useState<Task[]>(taskListByLanguage[language as keyof typeof taskListByLanguage]);
  const [currentTask, setCurrentTask] = useState<Task | null>(taskListByLanguage[language as keyof typeof taskListByLanguage][0]);
  const [taskEngagements, setTaskEngagements] = useState<{ [key: number]: { likes: number; dislikes: number } }>({});
  const [filters, setFilters] = useState({
    sexual: false,
    expensive: false,
    outside: false,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    sexual: false,
    expensive: false,
    outside: false,
  });
  const [isContactFormOpen, setContactFormOpen] = useState(false);

  const handleOpenContactForm = () => {
    setContactFormOpen(true);
  };

  const handleCloseContactForm = () => {
    setContactFormOpen(false);
  };

  const switchLanguage = (lang: keyof typeof taskListByLanguage) => {
    setLanguage(lang);
    setTasks(taskListByLanguage[lang]);
    setCurrentTask(taskListByLanguage[lang][0]);
  };

  const addNewTask = () => {
    if (!newTask.description.trim()) {
      alert('Description is required');
      return;
    }

    const maxId = Math.max(...tasks.map(t => t.id), 0);
    setTasks([
      ...tasks,
      {
        id: maxId + 1,
        description: newTask.description,
        attributes: {
          sexual: newTask.sexual,
          expensive: newTask.expensive,
          outside: newTask.outside,
        },
        likes: 0,
        dislikes: 0,
      }
    ]);

    setNewTask({
      description: '',
      sexual: false,
      expensive: false,
      outside: false,
    });
    setShowDialog(false);
  };

  const getRandomTask = () => {
    const filteredTasks = tasks.filter((task) => {
      return (
        (!filters.sexual || task.attributes.sexual) &&
        (!filters.expensive || task.attributes.expensive) &&
        (!filters.outside || task.attributes.outside)
      );
    });

    if (filteredTasks.length === 0) {
      alert('No tasks match your filters.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredTasks.length);
    setCurrentTask(filteredTasks[randomIndex]);
  };

  const handleLike = (taskId: number) => {
    setTaskEngagements(prevEngagements => ({
      ...prevEngagements,
      [taskId]: {
        likes: (prevEngagements[taskId]?.likes || 0) + 1,
        dislikes: prevEngagements[taskId]?.dislikes || 0,
      }
    }));
  };

  const handleDislike = (taskId: number) => {
    setTaskEngagements(prevEngagements => ({
      ...prevEngagements,
      [taskId]: {
        likes: prevEngagements[taskId]?.likes || 0,
        dislikes: (prevEngagements[taskId]?.dislikes || 0) + 1,
      }
    }));
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const engagements = taskEngagements[task.id] || { likes: 0, dislikes: 0 };
    return (
      <div className="p-4 m-4 border rounded shadow">
        <p>{task.description}</p>
        <div>
          <button onClick={() => handleLike(task.id)}><ThumbUpIcon /> ({engagements.likes})</button>
          <button onClick={() => handleDislike(task.id)}><ThumbDownIcon /> ({engagements.dislikes})</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="bg-black rounded-lg p-6 w-11/12 max-w-md">
      <h1 className="text-white text-2xl font-bold mb-4">ROMANTIC TASK GENERATOR</h1>
      {currentTask && <TaskCard task={currentTask} />}
      <button 
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4 hover:bg-blue-700"
        onClick={getRandomTask}>
          Get Another Task
      </button>
      <button 
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4 hover:bg-blue-700"
        onClick={() => setShowDialog(true)}>
        Add New Task Idea
      </button>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} sx={{'& .MuiPaper-root': {borderRadius: "22px"}}}>
  <DialogTitle>Add a new Task</DialogTitle>
  <DialogContent>
    <form onSubmit={(e) => { e.preventDefault(); addNewTask(); }}>
      <TextField
        autoFocus
        margin="dense"
        id="description"
        label="Description"
        type="text"
        fullWidth
        variant="outlined"
        value={newTask.description}
        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={newTask.sexual}
            onChange={e => setNewTask({ ...newTask, sexual: e.target.checked })}
            name="sexual"
          />
        }
        label="Sexual"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={newTask.expensive}
            onChange={e => setNewTask({ ...newTask, expensive: e.target.checked })}
            name="expensive"
          />
        }
        label="Expensive"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={newTask.outside}
            onChange={e => setNewTask({ ...newTask, outside: e.target.checked })}
            name="outside"
          />
        }
        label="Outside"
      />
      <DialogActions>
        <Button type="submit" color="primary" variant="contained">
          Submit
        </Button>
        <Button onClick={() => setShowDialog(false)} color="secondary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </form>
  </DialogContent>
</Dialog>
      <div>
        <label>
          <input type="checkbox" checked={filters.sexual} onChange={() => setFilters({ ...filters, sexual: !filters.sexual })} />
          Sexual
        </label>

        <label>
          <input type="checkbox" checked={filters.expensive} onChange={() => setFilters({ ...filters, expensive: !filters.expensive })} />
          Expensive
        </label>

        <label>
          <input type="checkbox" checked={filters.outside} onChange={() => setFilters({ ...filters, outside: !filters.outside })} />
          Outside
        </label>

      </div>
      <div>
        <button onClick={() => switchLanguage('de')}></button>
        <button onClick={() => switchLanguage('en')}></button>
        <button onClick={() => switchLanguage('es')}></button>
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={handleOpenContactForm}><EmailIcon /></button>
        <button onClick={() => window.location.href='mailto:fabian.ebert@online.de'}><AlternateEmailIcon /></button>
        <button onClick={() => window.open('https://github.com/SirArchy', '_blank')}><GitHubIcon /></button>
        <button onClick={() => window.open('https://www.linkedin.com/in/fabian-e-762b85244', '_blank')}><LinkedInIcon /></button>
    </div>
    <Dialog open={isContactFormOpen} onClose={handleCloseContactForm} sx={{'& .MuiPaper-root': {borderRadius: "22px"}}}>
        <ContactForm />
      </Dialog>
      </div>
    </div>
  );
};
export default MainPage;
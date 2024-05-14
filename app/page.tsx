"use client"; 

import React, { useState, useEffect } from 'react';
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
import flagOfGermany from "./utilities/images/Flag_of_Germany.png" 
import flagOfUk from "./utilities/images/Flag_of_United_Kingdom.png"
import flagOfSpain from "./utilities/images/Flag_of_Spain.png"
import translationsDe from './translationsDe.json';
import translationsEn from './translationsEn.json';
import translationsEs from './translationsEs.json';
import Image from 'next/image';
import Switch from '@mui/material/Switch';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgNzpSAukO6EbJAQAo6MgystUV-yrRXkc",
  authDomain: "romantictaskgenerator.firebaseapp.com",
  projectId: "romantictaskgenerator",
  storageBucket: "romantictaskgenerator.appspot.com",
  messagingSenderId: "411189281051",
  appId: "1:411189281051:web:95d235416c27c0c26b93be"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const translationsByLanguage = {
  de: translationsDe,
  en: translationsEn,
  es: translationsEs,
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
  const translations = translationsByLanguage[language as keyof typeof translationsByLanguage];
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<{ [key: string]: Task[] }>({});
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
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

  useEffect(() => {
    const fetchTasks = async () => {
      const allTasks: { [key: string]: Task[] } = {};
      for (const lang of ['de', 'en', 'es']) {
        const taskCollection = collection(db, `tasks_${lang}`);
        const taskSnapshot = await getDocs(taskCollection);
        allTasks[lang] = taskSnapshot.docs.map(doc => doc.data() as Task);
      }
      setAllTasks(allTasks);
      setCurrentTasks(allTasks[language]);
    };
  
    fetchTasks();
  }, [language]);
  
  useEffect(() => {
    setCurrentTasks(allTasks[language]);
  }, [language, allTasks]);

  const switchLanguage = (lang: 'de' | 'en' | 'es') => {
    setLanguage(lang);
  };

  const addNewTask = async () => {
    if (!newTask.description.trim()) {
      alert(translations.addTaskForm.validate.descriptionAlert);
      return;
    }

    const maxId = Math.max(...tasks.map(t => t.id), 0);
    const newTaskData = {
      id: maxId + 1,
      description: newTask.description,
      attributes: {
        sexual: newTask.sexual,
        expensive: newTask.expensive,
        outside: newTask.outside,
      },
      likes: 0,
      dislikes: 0,
    };

    const taskCollection = collection(db, `tasks_${language.toLowerCase()}`);
    await addDoc(taskCollection, newTaskData);

    setTasks([
      ...tasks,
      newTaskData
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
      alert(translations.filterAlert);
      return;
    }
  
    const sortedTasks = filteredTasks.sort((a, b) => {
      const aLikes = a.likes || 0;
      const bLikes = b.likes || 0;
      const likesDiff = bLikes - aLikes;
      if (likesDiff !== 0) {
        return likesDiff;
      } else {
        const aDislikes = a.dislikes || 0;
        const bDislikes = b.dislikes || 0;
        return aDislikes - bDislikes;
      }
    });
  
    const topHalfIndex = Math.floor(sortedTasks.length / 2);
    const randomIndex = Math.floor(Math.random() * topHalfIndex);
    setCurrentTask(sortedTasks[randomIndex]);
  };

  const [userEngagements, setUserEngagements] = useState<{ [key: number]: 'like' | 'dislike' }>({});

  const handleLike = async () => {
    if (currentTask && !userEngagements[currentTask.id]) {
      const taskDoc = doc(db, `tasks_${language.toLowerCase()}`, currentTask.id.toString());
      const likes = currentTask.likes ? currentTask.likes + 1 : 1;
      await updateDoc(taskDoc, { likes });
      setUserEngagements({
        ...userEngagements,
        [currentTask.id]: 'like',
      });
    }
  };
  
  const handleDislike = async () => {
    if (currentTask && !userEngagements[currentTask.id]) {
      const taskDoc = doc(db, `tasks_${language.toLowerCase()}`, currentTask.id.toString());
      const dislikes = currentTask.dislikes ? currentTask.dislikes + 1 : 1;
      await updateDoc(taskDoc, { dislikes });
      setUserEngagements({
        ...userEngagements,
        [currentTask.id]: 'dislike',
      });
    }
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const engagements = taskEngagements[task.id] || { likes: 0, dislikes: 0 };
    const userEngagement = userEngagements[task.id];
    return (
      <div className="p-4 m-4 border rounded shadow">
        <p>{task.description}</p>
        <div>
          <button disabled={!!userEngagement} onClick={() => handleLike()}><ThumbUpIcon /> ({engagements.likes})</button>
          <button disabled={!!userEngagement} onClick={() => handleDislike()}><ThumbDownIcon /> ({engagements.dislikes})</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="bg-black rounded-lg p-6 w-full max-w-2xl min-h-[50vh]">
      <h1 className="text-white text-4xl font-bold mb-4 text-center">{translations.title}</h1>
      {currentTask && <TaskCard task={currentTask} />}
      <button 
          className="bg-purple-700 text-white font-bold py-2 px-4 rounded-full mt-4 hover:bg-purple-800 transition-colors duration-200"
          style={{
            background: 'linear-gradient(to right, rgb(23, 25, 64), rgb(93, 35, 130), rgb(161, 13, 99))',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            transition: '0.5s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgb(13, 15, 54), rgb(63, 25, 110), rgb(131, 3, 79))'}
          onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgb(23, 25, 64), rgb(93, 35, 130), rgb(161, 13, 99))'}
        onClick={getRandomTask}>
          {translations.newTaskButton}
      </button>
      <h2 className="text-white text-2xl font-bold pt-4" >{translations.include}</h2>
      <div className="flex flex-col">
      <FormControlLabel
        control={
          <Switch
            checked={filters.sexual}
            onChange={() => setFilters({ ...filters, sexual: !filters.sexual })}
          />
        }
        label={translations.addTaskForm.filterSexual}
      />
    
      <FormControlLabel
        control={
          <Switch
            checked={filters.expensive}
            onChange={() => setFilters({ ...filters, expensive: !filters.expensive })}
          />
        }
        label={translations.addTaskForm.filterExpensive}
      />
    
      <FormControlLabel
        control={
          <Switch
            checked={filters.outside}
            onChange={() => setFilters({ ...filters, outside: !filters.outside })}
          />
        }
        label={translations.addTaskForm.filterOutside}
      />
    </div>
      <button 
          className="bg-purple-700 text-white font-bold py-2 px-4 rounded-full mt-4 hover:bg-purple-800 transition-colors duration-200"
          style={{
            background: 'linear-gradient(to right, rgb(23, 25, 64), rgb(93, 35, 130), rgb(161, 13, 99))',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            transition: '0.5s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgb(13, 15, 54), rgb(63, 25, 110), rgb(131, 3, 79))'}
          onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgb(23, 25, 64), rgb(93, 35, 130), rgb(161, 13, 99))'}
        onClick={() => setShowDialog(true)}>
        {translations.addTaskButton}
      </button>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} sx={{'& .MuiPaper-root': {borderRadius: "22px"}}} className="bg-black rounded-lg p-6 w-11/12 max-w-md">
  <DialogTitle>{translations.addTaskForm.title}</DialogTitle>
  <DialogContent >
    <form onSubmit={(e) => { e.preventDefault(); addNewTask(); }}>
      <TextField
        autoFocus
        margin="dense"
        id="description"
        label={translations.addTaskForm.description}
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
        label={translations.addTaskForm.filterSexual}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={newTask.expensive}
            onChange={e => setNewTask({ ...newTask, expensive: e.target.checked })}
            name="expensive"
          />
        }
        label={translations.addTaskForm.filterExpensive}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={newTask.outside}
            onChange={e => setNewTask({ ...newTask, outside: e.target.checked })}
            name="outside"
          />
        }
        label={translations.addTaskForm.filterOutside}
      />
      <DialogActions>
        <Button type="submit" color="primary" variant="contained">
          {translations.addTaskForm.submit}
        </Button>
        <Button onClick={() => setShowDialog(false)} color="secondary" variant="contained">
          {translations.addTaskForm.close}
        </Button>
      </DialogActions>
    </form>
  </DialogContent>
</Dialog>
      <div className="flex justify-center items-center space-x-4 space-y-4">
        <button onClick={() => switchLanguage('de')}><Image src={flagOfGermany} width={50} height={50} alt="DE" /></button>
        <button onClick={() => switchLanguage('en')}><Image src={flagOfUk} width={50} height={50} alt="EN" /></button>
        <button onClick={() => switchLanguage('es')}><Image src={flagOfSpain} width={50} height={50} alt="ES" /></button>
      </div>
      <div className="flex justify-center items-center space-x-4 space-y-4">
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
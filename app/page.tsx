import { useEffect, useState } from 'react';

interface Task {
  id: number;
  description: string;
  attributes: {
    sexual: boolean;
    expensive: boolean;
    outside: boolean;
  };
}

type TasksJson = Task[];

const MainPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    sexual: false,
    expensive: false,
    outside: false,
  });

  useEffect(() => {
    const loadTasks = async () => {
      const response = await fetch('/romanticTasks.json');
      const data: TasksJson = await response.json();
      setTasks(data);
      setCurrentTask(data[0]);
    };
    loadTasks();
  }, []);

  const getRandomTask = () => {
    const filteredTasks = tasks.filter((task) => {
      return (
        (!filters.sexual || (filters.sexual && task.attributes.sexual)) &&
        (!filters.expensive || (filters.expensive && task.attributes.expensive)) &&
        (!filters.outside || task.attributes.outside === filters.outside)
      );
    });

    if (filteredTasks.length === 0) {
      alert('No tasks match your filters.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredTasks.length);
    setCurrentTask(filteredTasks[randomIndex]);
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    return (
      <div className="p-4 m-4 border rounded shadow">
        <p>{task.description}</p>
      </div>
    );
  };

  return (
    <div>
      {currentTask && <TaskCard task={currentTask} />}
      <button 
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-700"
        onClick={getRandomTask}>
          Get Another Task
      </button>
     
      {/* Filter Checkboxes */}
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
    </div>
  );
};
import React, {createContext, useContext, useReducer, useState} from 'react';

// Define types for user and task
interface User {
  // Define user properties
}

interface Task {
  // Define task properties
}

// Define the context value type
interface AppContextType {
  user: User;
  tasks: Task[];
}

// Initial value for the context
const INITIAL_VALUE: AppContextType = {
  user: {},
  tasks: [],
};

// Create the context
export const AppContext = createContext<any>(null);

// Create a provider component for the context
export const AppStoreProvider = ({children}: any) => {
  const [appState, setAppState] = useState<AppContextType>(INITIAL_VALUE);
  // Method to update user in the context
  const updateUser = (newUser: User) => {
    setAppState(prevState => ({
      ...prevState,
      user: newUser,
    }));
  };

  // Method to add a task to the context
  const addTask = (newTask: Task) => {
    setAppState(prevState => ({
      ...prevState,
      tasks: [...prevState.tasks, newTask],
    }));
  };

  // Method to update a task in the context
  const updateTask = (taskId: number, updatedTask: Partial<Task>) => {
    setAppState(prevState => ({
      ...prevState,
      tasks: prevState.tasks.map(task =>
        task.id === taskId ? {...task, ...updatedTask} : task,
      ),
    }));
  };

  // Method to remove a task from the context
  const removeTask = (taskId: number) => {
    setAppState(prevState => ({
      ...prevState,
      tasks: prevState.tasks.filter(task => task.id !== taskId),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...appState,
        updateUser,
        addTask,
        updateTask,
        removeTask,
      }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

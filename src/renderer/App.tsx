import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';

const Hello = () => {
  const [connectionNum, setConnectionNum] = useState(0);
  useEffect(() => {
    window.electron.ipcRenderer.on('connection', () => {
      setConnectionNum(connectionNum + 1);
    });
    window.electron.ipcRenderer.on('disconnection', () => {
      setConnectionNum(connectionNum - 1);
    });
  }, [connectionNum]);
  return <div>ConnectionNum:{connectionNum}</div>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}

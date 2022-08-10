import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';

const Hello = () => {
  const [connectionNum, setConnectionNum] = useState(0);
  const [history, setHistory] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    window.electron.ipcRenderer.on('connection', () => {
      setConnectionNum(connectionNum + 1);
    });
    window.electron.ipcRenderer.on('disconnection', () => {
      setConnectionNum(connectionNum - 1);
    });

    window.electron.ipcRenderer.on('received-message', (data) => {
      setHistory(`${history}\n client:${data}`);
    });
  }, [connectionNum, history]);
  const sentMessage = (msg: any) => {
    setHistory(`${history}\n me:${msg}`);
    window.electron.ipcRenderer.sendMessage('sent-message', msg);
  };
  return (
    <div>
      <div>
        <div>
          <div>{history}</div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <button
            onClick={() => {
              sentMessage(message);
            }}
          >
            sent message
          </button>
        </div>
      </div>
      <div>ConnectionNum:{connectionNum}</div>
    </div>
  );
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

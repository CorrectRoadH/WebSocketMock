import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import { useEffect, useState } from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import Message from '../class/Message';

const Hello = () => {
  const [connectionNum, setConnectionNum] = useState(0);
  const [history, setHistory] = useState('');
  const [message, setMessage] = useState('');
  const [selectState, setSelectState] = useState<Array<boolean>>(
    new Array<boolean>(0)
  );
  useEffect(() => {
    window.electron.ipcRenderer.on('connection', () => {
      setConnectionNum(connectionNum + 1);
      setSelectState(new Array<boolean>(connectionNum + 1).fill(true));
    });
    window.electron.ipcRenderer.on('disconnection', () => {
      setConnectionNum(connectionNum - 1);
      setSelectState(new Array<boolean>(connectionNum - 1).fill(true));
    });

    window.electron.ipcRenderer.on('received-message', (data) => {
      setHistory(`${history}\n client:${data}`);
    });
  }, [connectionNum, history]);
  const sentMessage = (msg: any) => {
    setHistory(`${history}\n me:${msg}`);

    const receiver = new Array(0);
    for (let i = 0; i < selectState.length; i += 1) {
      if (selectState[i]) {
        receiver.push(i);
      }
    }

    window.electron.ipcRenderer.sendMessage('sent-message', {
      receiver,
      msg,
    } as Message);
  };

  return (
    <div>
      <div>
        <div className="text-white">
          已连接Socket客户端:
          <FormGroup>
            {Array.from(Array(connectionNum), (_e, i) => {
              return (
                <FormControlLabel
                  key={i}
                  control={
                    <Checkbox
                      value={selectState[i]}
                      onClick={() => {
                        const newArray = selectState;
                        newArray[i] = !newArray[i];
                        setSelectState(newArray);
                      }}
                    />
                  }
                  label={`socketClient${i}`}
                />
              );
            })}
          </FormGroup>
          <div>
            <textarea
              value={history}
              onChange={() => {}}
              style={{ resize: 'none' }}
            />
          </div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button
            variant="contained"
            onClick={() => {
              sentMessage(message);
            }}
          >
            sent message
          </Button>
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

import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

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
    for (let i = 0; i < selectState.length; i++) {
      if (selectState[i]) {
        receiver.push(i);
      }
    }

    window.electron.ipcRenderer.sendMessage('sent-message', { receiver, msg });
  };

  return (
    <div>
      <div>
        <div>
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
                        console.log(newArray);
                      }}
                    />
                  }
                  label={`socketClient${i}`}
                />
              );
            })}
          </FormGroup>
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

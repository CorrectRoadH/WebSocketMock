import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import { useEffect, useState } from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import Message from '../class/Message';

const Hello = () => {
  const [connectionNum, setConnectionNum] = useState(0);
  const [history, setHistory] = useState('');
  const [jsObject, setJsObject] = useState({
    userID: 'nancy_mccarty',
    userName: "Nancy's McCarty",
    id: 'A1',
  });
  const [selectState, setSelectState] = useState<Array<boolean>>(
    new Array<boolean>(0)
  );
  useEffect(() => {
    window.electron.ipcRenderer.on('connection', () => {
      setConnectionNum(connectionNum + 1);
      setSelectState(new Array<boolean>(connectionNum + 1).fill(false));
    });
    window.electron.ipcRenderer.on('disconnection', () => {
      setConnectionNum(connectionNum - 1);
      setSelectState(new Array<boolean>(connectionNum - 1).fill(false));
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
    <div className="flex flex-col	w-screen">
      <div className="m-auto flex flex-col">
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
                        console.log(newArray);
                      }}
                    />
                  }
                  label={`socketClient${i}`}
                />
              );
            })}
          </FormGroup>
          <div className="w-screen flex">
            <textarea
              className="w-9/12 h-96 m-auto text-black"
              value={history}
              onChange={() => {}}
              style={{ resize: 'none' }}
            />
          </div>
          <div className="m-auto flex h-16">
            Send Message Content:
            {/* <Editor value={message} onChange={setMessage} /> */}
            <JSONInput
              id="a_unique_id"
              placeholder={jsObject}
              height="200px"
              onChange={(e) => {
                setJsObject(e.jsObject);
              }}
            />
            <Button
              className="m-auto "
              variant="contained"
              onClick={() => {
                sentMessage(JSON.stringify(jsObject));
              }}
            >
              sent message
            </Button>
          </div>
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

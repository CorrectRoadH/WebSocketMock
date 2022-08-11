import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import JSONInput from 'react-json-editor-ajrm';
import Message from '../class/Message';
import Dict = NodeJS.Dict;
import RecevieMessage from '../class/RecevieMessage';

const Hello = () => {
  const [connectionNum, setConnectionNum] = useState(0);
  const [history, setHistory] = useState('history messages:\n');
  const [jsObject, setJsObject] = useState({
    msg: 'Hello World',
  });

  const [selectState, setSelectState] = useState<Dict<boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.on('connection', (id: string) => {
      // when new connection join
      const tempSelectState: Dict<boolean> = selectState;
      tempSelectState[id] = false;
      setSelectState(tempSelectState);

      setConnectionNum(connectionNum + 1);
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.on('disconnection', (id: string) => {
      const tempSelectState: Dict<boolean> = selectState;
      delete tempSelectState[id];
      setSelectState(tempSelectState);

      setConnectionNum(connectionNum - 1);
    });

    window.electron.ipcRenderer.on(
      'received-message',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (data: RecevieMessage) => {
        setHistory(`${history}\n client(${data.sentID}):${data.msg}`);
      }
    );
  }, [connectionNum, history, selectState]);
  const sentMessage = (msg: any) => {
    const receiver = new Array<string>(0);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(selectState)) {
      if (value) {
        receiver.push(key);
      }
    }

    setHistory(`${history}\n me to(${receiver.toString()}):${msg}`);

    window.electron.ipcRenderer.sendMessage('sent-message', {
      receiver,
      msg,
    } as Message);
  };

  return (
    <div className="grid grid-rows-6 w-screen h-screen">
      <div className="flex flex-row  border-solid m-1 border-4 rounded-lg border-sky-500 bg-sky-500 hover:hover:shadow-lg shadow-indigo-500/50">
        <div className="m-auto">
          Mode:
          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
          >
            <Button>WebSocket</Button>
            <Button>SocketIO</Button>
          </ButtonGroup>
        </div>
        <div className="m-auto">
          Listen Port:4778 <Button variant="contained">Change</Button>
        </div>
      </div>
      <div className="grid grid-cols-6 row-start-2 row-end-6">
        <div className="border-solid m-1 border-4 rounded-lg border-sky-500 bg-sky-500 text-white hover:shadow-lg shadow-indigo-500/50">
          <div>
            WS Client List:
            <FormGroup>
              {Object.entries(selectState).map(([key, value]) => {
                return (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        value={value}
                        onClick={() => {
                          const tempSelectState: Dict<boolean> = selectState;
                          tempSelectState[key] = !tempSelectState[key];
                          setSelectState(tempSelectState);
                        }}
                      />
                    }
                    label={key}
                  />
                );
              })}
            </FormGroup>
          </div>
        </div>

        <div className="flex border-solid m-1 border-4 rounded-lg border-sky-500 col-start-2 col-end-5 bg-sky-500 hover:shadow-lg shadow-indigo-500/50">
          <textarea
            className="w-11/12 h-96  m-auto text-black"
            value={history}
            onChange={() => {}}
            style={{ resize: 'none' }}
          />
        </div>
        <div className="border-solid m-1 border-4 rounded-lg border-sky-500 col-start-5 col-end-7 bg-sky-500 hover:shadow-lg shadow-indigo-500/50">
          Send Message Content:
          {/* <Editor value={message} onChange={setMessage} /> */}
          <JSONInput
            id="a_unique_id"
            placeholder={jsObject}
            height="400px"
            onChange={(e: any) => {
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
      <div className="">ConnectionNum:{connectionNum}</div>
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

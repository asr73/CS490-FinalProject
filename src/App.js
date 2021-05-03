import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import ContextManager from './ContextManager';
import ToolBar from './ToolBar';
import HomeScreen from './HomeScreen';
import UploadImg from './UploadImg';

import Sketchit from './Sketchit';

import SearchPage from './SearchPage';

const socket = io(); // Connects to socket connection


function App() {
  const [contentState, setContent]=useState('uploadImg.myFirstPool');
  const [username, setUsername] = useState('');
  
  function setPage(page) {
    const pageValues = page.split('.');
    const pageType = pageValues[0];
    const pageData = pageValues.length==2?pageValues[1]:null;
    return {
      'home' : (<HomeScreen />),
      'sketchit' : (<Sketchit poolName={pageData} />),
      'viewPool' : (<div>{pageData}</div>),
      'search': (<SearchPage pageData={pageData}/>),
      'uploadImg': (<UploadImg poolName={pageData}/>),
    } [pageType]
  }
  
  useEffect(() => {
    socket.on('loginSuccess', (data) => {
      setUsername(data.username);
      console.log('success');
    });
  }, []);
  
  return (
    <ContextManager
      content={[contentState, setContent]}
      username={[username, setUsername]}
      socket={socket}
    >
    <div className="App">
    
      <ToolBar />
      
      <div style={{clear: 'both'}}>
      </div>
      
      {setPage(contentState)}

    </div>
    </ContextManager>
    );
}

export default App;
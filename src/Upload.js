import './App.css';
import React, { useState, useRef, useEffect, useContext} from 'react';
import 'react-dropdown/style.css';
import UsernameContext from './UsernameContext';


function Upload({
  poolName,
  changeHandler,
}) {
  
  const [username, setUsername] = useContext(UsernameContext);
  


  
  return (
    <div style={{paddingLeft:'75px'}}>
       <input type="file" name="file" onChange={changeHandler} />
    </div>
    
  );
}

export default Upload;


import logo from './logo.svg';
import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import Upload from './Upload';
import io from 'socket.io-client';
import UserPool from './UserPool';


const socket = io(); // Connects to socket connection


function App() {
  
  const [isLogin,setLogin]=useState(false);
  const [isLoginClicked,setLoginClicked]=useState(false);
  const [isNewUserClicked,setNewUserClicked]=useState(false);

  
  const inputRef = useRef(null);
  const inputRefUser = useRef(null); 
  const inputRefPassword = useRef(null); 
  const inputNewUser = useRef(null); 
  const inputNewUserPassword = useRef(null); 

  function onClick(){
    const username=inputRefUser.current.value;
    const password=inputRefPassword.current.value;
    console.log(username);
    console.log(password);
    changeLogin()
     socket.emit('login',{user:username,password:password});
    
    }

  function newUser(){
    const username=inputNewUser.current.value;
    const password=inputNewUserPassword.current.value;
    console.log(username);
    console.log(password);
     socket.emit('newUser',{user:username,password:password});
    
    }

  const options = [
  'Keyword', 'Tag', 'Random Images'
  ];

  const buttonstyle = {
    background: "transparent",
    border: "none"
  };
  
  function onSearch() {
    console.log('search');
  }
  
  function changeLogin(){
    setLogin((prevLogin)=> {
      return !prevLogin;
    });
  }
  
  function changeLoginClick(){
    console.log("button clicked");
    setLoginClicked((prevLogin)=> {
      return !prevLogin;
    });
  }
  
  function changeNewUserClick(){
    console.log("button clicked");
    setNewUserClicked((prevLogin)=> {
      return !prevLogin;
    });
  }
  
  return (
  <div>
    {isLogin === false ? (
      <div className="App">
      <div>
      <h1 style={{float: 'left', display: 'inline-block'}}>Arachne</h1>
      <h4 style={{float: 'right', display: 'inline'}}>
      {isNewUserClicked === false?(
      <div>
        <button onClick={()=>changeLoginClick()}>Login</button>
      <div>
      {isLoginClicked === true?
        (
          <form> <br />
          <label>
            Login-ID:
            <input ref={inputRefUser} type="text"/>
          </label><br />
          <label>
          Password
            <input type="password" ref={inputRefPassword} />
          </label><br />
          <input type="submit" value="Submit" onClick={onClick} />
          <br />
        </form>
        ):
        (null)
      }
        </div>
        </div>
        ):(null)
      }
      <br />
      {isLoginClicked === false?(
      <div>
        <button onClick={()=>changeNewUserClick()}>New User</button>
      <div>
      {isNewUserClicked === true?
        (
          <form><br />
            <label>
              User-ID:
              <input ref={inputNewUser} type="text"/>
            </label><br />
            <label>
            Password
              <input type="password" ref={inputNewUserPassword} />
            </label><br />
            <input type="submit" value="Submit" onClick={newUser} />
          <br />
        </form>
        ):
        (null)
      }
        </div>
        </div>
      ):(null)
      }
      <br />
      
        </h4>
        </div>
          <div style={{clear: 'both'}}>
          </div>
          <button style={buttonstyle}>
          <Dropdown style={buttonstyle} options={options} placeholder="Search by" />
          </button>
          <input ref={inputRef} type="text" />
          <button type="button" onClick={onSearch}>
            Search
          </button>
          
          <h1><button>Play Game</button></h1>
          <Upload />
        </div>
        ):(
          <div>
            <UserPool/>
          </div>
        )}
    </div>
    );
}

export default App;

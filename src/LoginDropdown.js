import React, {useState, useRef, useContext} from 'react';
import SocketContext from './SocketContext';

function LoginDropdown({}) {
    
    const socket = useContext(SocketContext);
    
    const [isLoginClicked,setLoginClicked]=useState(false);
    const [isNewUserClicked,setNewUserClicked]=useState(false);
    
    const usernameRef = useRef(null); 
    const passwordRef = useRef(null); 

    function onLoginComplete(){
        const username=usernameRef.current.value;
        const password=passwordRef.current.value;
        console.log(username);
        console.log(password);
        socket.emit('login',{user:username,password:password});
    }
    
    function onNewUserComplete(){
        const username=usernameRef.current.value;
        const password=passwordRef.current.value;
        console.log(username);
        console.log(password);
        socket.emit('newUser',{user:username,password:password});
    }
    
    
    function onLoginClick() {
        setLoginClicked(true);
        setNewUserClicked(false);
    }
    
    function onNewUserClick() {
        setNewUserClicked(true);
        setLoginClicked(false);
    }
  
    return (
        <div>
        <div>
            {isLoginClicked?(null):(<button onClick={() => onLoginClick()}>Login</button>)}
            {isNewUserClicked?(null):(<button onClick={() => onNewUserClick()}>New User</button>)}
            {isLoginClicked||isNewUserClicked?(
                <div>
                <br />
                <label>
                    Login-ID:
                    <input ref={usernameRef} type="text"/>
                </label>
                <br />
                <label>
                    Password
                    <input type="password" ref={passwordRef} />
                </label>
                <br />
                {isLoginClicked?(
                    <input type="submit" value="Login" onClick={onLoginComplete} />
                ):(
                    <input type="submit" value="Create Account" onClick={onNewUserComplete} />
                )}
                <br />
                </div>
            ):(null)
            }
        </div>
        </div>
    )
}

export default LoginDropdown;
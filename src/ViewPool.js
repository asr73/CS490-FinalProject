import React, {useContext, useState, useEffect} from 'react';
import UsernameContext from './UsernameContext';
import ContentContext from './ContentContext';
import SocketContext from './SocketContext';
import "./style.css";


function ViewPool({
    poolName,
}) {
    
    const [username, setUsername] = useContext(UsernameContext);
    const [contentState, setContent] = useContext(ContentContext);
    const socket = useContext(SocketContext);
    
    const [imageList, setImages] = useState([]);
    const [initialized, setInit] = useState(false);
    const [owner, setOwner] = useState('');
    
    if (!initialized){
        socket.emit('fetchImages', {pool:poolName});
        setInit(true);
    }
    
    useEffect(() => {
        socket.on('list images', (data) => {
            setImages(data.imageList);
            setOwner(data.owner)
            data.imageList.map((image) => console.log(image));
        });
    }, []);
    
    return (
        <div className='App-header' style={{width:'80vw', alignItems:'center'}}>
            <h1 style={{display:'flex'}}>{poolName.toUpperCase()}</h1>
            <div className='App-header-row'>
            
            <div className='App-header' style={{width:'20%', height:'55vh'}}>
            </div>
            
            <div className='App-header' style={{width:'60%', overflow:'auto', height:'55vh'}}>
            <div style={{display:'flex', flexDirection:'row',  flexWrap:'wrap'}}>
                {
                    imageList.map(image => (
                        <img src={image} style={{width:'200px', height:'200px', borderRadius:'12px', objectFit:'cover'}}/>
                    ))
                }
                {username === owner ? (
                <button 
                    className='Grid-button'
                    style={{width:'195px', height:'195px'}}
                    onClick={() => setContent('uploadImg.'+poolName)}
                >Add Image</button>
                ) : null}
            </div>
            </div>
            
            <div className='App-header' style={{width:'20%', height:'55vh'}}>
                <button class="button" onClick={() => setContent('sketchit.'+poolName)}>Start Sketching!</button><br />
                <button class="button" onClick={() => setContent('viewPools')}>Back To Pools</button>
            </div>
            
            </div>
        </div>
    )
}

export default ViewPool;
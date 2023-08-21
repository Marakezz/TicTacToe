import React from 'react';
import socket from "../socket";
import reducer from '../reducer';


function TestComponentt({roomName}) {

    // const [colorToggle, setColorToggle] = React.useState(true);
    const [state, dispatch] = React.useReducer(reducer, {
        colorToggle: true,
    }) ;

    const changeColorToggle = (toggle) => {
        console.log('ПРишлоо');
        // setColorToggle((colorToggle) => !colorToggle);
        dispatch({
            type: 'CHANGE_COLOR',
            payload: toggle,
        });
    }
   
    React.useEffect( () => {
        socket.on('ROOM:CHANGE_COLOR', changeColor );

        return() => { 
            socket.off('ROOM:CHANGE_COLOR', changeColor );
        }}, []);

    const testRef = React.useRef(null);

    const changeColor1 = () => {
        changeColor(state.colorToggle);
        const obj = {
            toggle: state.colorToggle,
            roomName
        }
        socket.emit('ROOM:CHANGE_COLOR', obj);
    }
    
        const changeColor = (toggle) => {
        if(toggle) {
            testRef.current.className = ' bg-blue-200 px-6 rounded-md border-2 border-pink-900 font-bold text-center text-red-700'
            console.log(toggle);
            changeColorToggle(toggle);
        }
        else {
            testRef.current.className = 'bg-gray-200 px-6 rounded-md border-2 border-pink-900 font-bold text-center text-red-700'
            console.log(toggle);
            changeColorToggle(toggle);
        }  
        }   

    return (
        <div className=' bg-gray-50 border border-blue-500 rounded-md mx-40 text-center'>
            <h1 className=' font-serif font-bold text-3xl' >Teeest</h1>
            <button onClick={changeColor1} ref={testRef} className=' bg-gray-200 px-6 rounded-md border-2 border-pink-900 font-bold text-center text-red-700'>Change color</button>
        </div>
    );
}

export default TestComponentt;
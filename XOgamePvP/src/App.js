import './App.css';
import React from 'react';
import socket from './socket';
import JoinBlock from './components/JoinBlock';
import RoomChat from './components/Room/RoomChat';
import RoomDetails from './components/Room/RoomDetails';
import reducer from './reducer';
import axios from 'axios';
import GameDisplay from './components/Room/GameDisplay';


function App() {
  const [state, dispatch] = React.useReducer(reducer, {
    joined: false,
    userName: null,
    isReady: false,
    isAllReady: false,
    currentPlayerId: null,
    currentRound: null,
    userId: null,
    users: [],
    roomIndex: null,
    cells: [],
    messages: [] //массив объектов из userName, message
  });

  const setUsers = (users) => {
    console.log('новый пользователь', users); 
    dispatch({
      type: 'SET_USERS',
      payload: users,
    });
}

const addMessage = (message) => {
  dispatch({
    type: 'NEW_MESSAGE',
    payload: message,
  });
}

const changeReady = async (status) => {
  const obj = {
    userId: state.userId,
    roomIndex: state.roomIndex,
    status
  }
  await axios.post('/changeReady', obj).then((res)=>{
    let cpi = res.data.currentPlayerId;
    let c = res.data.cells;
    let cr = res.data.currentRound;
    if (!res.data.isAllReady)  {
      cpi = null;
      c = []; 
      cr = null;
    }
    dispatch({ //Что за грязь? :d 
      type: 'CHANGE_READY',
      payload: res.data.users,
      payload1: status,
      payload2: res.data.isAllReady,
      payload3: cpi,
      payload4: c,
      payload5: cr
    })
    
  });

  socket.emit('CHANGE_READY', obj);

}

const isAllReady = (obj) => {
  dispatch({
    type: 'ALLREADY',
    payload: obj
  })
}


const clickCell = async (index) => { //Нужно остановить игру когда она кончается!
  const obj = {
    userId: state.userId,
    roomIndex: state.roomIndex,
    cellIndex: index
  }
  await axios.post('/cellClicked', obj).then((res) => {

    if(res.data.cells) { //Проверил пришел ли объект
      dispatch({
        type: 'ENDOFTURN',
        payload: res.data
      })
      if(res.data.isDraw) {
        alert('Ничья')
        socket.emit('ROUND:DRAW', state.roomIndex);
      }
      if(res.data.win > 0) {
        dispatch({
          type: 'SET_USERS',
          payload: res.data.users
        })
        alert('Ты победил!')}
      const obj1 = {
        roomIndex: state.roomIndex,
        currentPlayerId: +res.data.currentPlayerId,
        cells: res.data.cells,
        win: res.data.win,
        winnerName: state.userName
      }
      socket.emit('ROUND:END_OF_TURN', obj1);
      // console.log(state.users[+res.data].userName)
    } else {
      switch(res.data){
        case 'ItsNotYourTurn':
          alert('Дождись своего хода')
        break;
        case 'CellIsAnavailable':
          alert('Клетка занята')
        break;

        default:
          alert('Что-то пошло не так')
    } 
  }
})
}


const endOfTurn = (obj) => {
  dispatch({
    type: 'ENDOFTURN',
    payload: obj
  })

  if(obj.win > 0) {
    alert('Победил игрок: ' + obj.winnerName)
    
  }
}

const roundDraw = () => {
  alert('Ничья')
}

React.useEffect( () => {
  socket.on('ROOM:PLAYER_DELETED', onExitFromRoom);
  socket.on('ROOM:SET_USERS', setUsers);
  socket.on('ROOM:NEW_MESSAGE', addMessage);
  socket.on('ROOM:ALLREADY', isAllReady);
  socket.on('ROUND:END_OF_TURN', endOfTurn );
  socket.on('ROUND:DRAW', roundDraw);
 
  

  return() => { 
    socket.off('ROOM:PLAYER_DELETED', onExitFromRoom);
    socket.off('ROOM:SET_USERS', setUsers);
    socket.off('ROOM:NEW_MESSAGE', addMessage); 
    socket.off('ROOM:ALLREADY', isAllReady);
    socket.off('ROUND:END_OF_TURN', endOfTurn );
    socket.off('ROUND:DRAW', roundDraw);}
}, []);

  const onLogin = async (obj) => {
    obj.userId = socket.id;
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    socket.emit('ROOM:JOIN',obj);
    const {data} = await axios.get(`/rooms/${obj.roomIndex}`); 
    dispatch({ 
      type: 'SET_DATA',
      payload: data
    })
  };

  const onExitFromRoom = () => {
    dispatch({
      type: 'UNJOINED',
    })
    socket.disconnect();
  }

  // window.socket = socket; Зачем это?

  return (
<div className='wrapper'>
  {!state.joined ? (<JoinBlock onLogin={onLogin}/>) : (
     <div 
      className='
        flex 
        flex-col
        md:flex-row
        h-screen
      '
     >
      <RoomDetails {...state} onExitFromRoom={onExitFromRoom} />
      <GameDisplay {...state} changeReady={changeReady} clickCell={clickCell}/>
      <RoomChat {...state} onAddMessage={addMessage}/>
     </div>
  )}
  
  
</div>

  );
}

export default App;

//Добавить авто-обновление списка комнат при удалении или добавлении таковых
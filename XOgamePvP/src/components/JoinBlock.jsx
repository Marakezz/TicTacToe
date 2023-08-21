import React from 'react';
import axios from 'axios';
import socket from '../socket';



function JoinBlock({ onLogin }) {

    const [roomPassword, setRoomPassword] = React.useState('');
    const [isPasswordNeeded, setIsPasswordNeeded] = React.useState(false);
    const [userName, setUserName] = React.useState('');
    const [isLoading, setLoading] = React.useState(false);
    const [showAllRoomsToggle, setShowAllRoomsToggle] = React.useState(false);
    const [allRooms, setAllRooms] = React.useState([]);
    const [isChosen, setIsChosen] = React.useState(false);

    const showAllRooms = async () => {
        const data = await axios.get(`/allRooms`);
        // setRoomName('');
        setShowAllRoomsToggle(true);
        setIsChosen(true);
        setAllRooms(data.data);
        if (!socket.connected) {
            socket.connect();
        }
    }

    const makeNewRoom = () => {
        setShowAllRoomsToggle(false);
        setIsChosen(true);
        if (!socket.connected) {
            socket.connect();
        }
    }

    const onMakeNewRoom = async () => {
        if (!userName) {
            return alert('Неверные данные');
        }
        const obj = {
            userName,
            roomPassword,
        }
        setLoading(true);

        await axios.post('/rooms', obj).then((res) => {
            if (res.data === 'NicknameIsAnavailable') {
                alert('Nickname Is Anavailable');
                setLoading(false);
            } else {
                obj.roomIndex = res.data;
                onLogin(obj);
            }
        })

    };

    const onEnterToRoom = async (room) => {
        if (!userName) {
            return alert('Введите имя');
        }
        // setRoomName(room.roomName);
        const obj1 = {
            roomIndex: room.id,
            roomPassword
        }
        await axios.post('/checkPassword', obj1).then((res) => {
            switch(res.data){
                case 'Success':
                const obj = {
                    userName,
                    roomIndex: room.id
                }
                setLoading(true);
                onLogin(obj);
                break;

                case 'RoomIsFull':
                    alert('Комната уже заполнена')
                    break;

                case 'RoomIsNotExist':
                    alert('Комната уже не существует') 
                    break;
                    
                case 'Fail':
                    alert('Неправильно введен пароль')
                    break;

                default:
                    alert('Что-то пошло не так')
            }

        })


    };


    return (
        <>
            <div>
                {isChosen ? <div>
                    {showAllRoomsToggle ?
                        <div className='ml-2'>
                            <button className='btn btn-success border-2 border-blue-300 rounded-md p-0.5 my-2 font-bold bg-gray-300' onClick={() => setShowAllRoomsToggle(false)}>Создать новую комнату</button>
                            <button className='btn btn-success border-2 border-blue-300 rounded-md p-0.5 my-2 font-bold bg-gray-300 ml-4' onClick={showAllRooms}>Обновить список комнат</button>
                            <h2 className='font-bold'>Ваше имя:</h2>
                            <input className='border-2 border-blue-300 rounded-md p-0.5 mr-10 mb-5'
                                type="text" placeholder='Ваше имя' value={userName} onChange={e => setUserName(e.target.value)} />
                            <h2 className='font-bold'>Введите пароль от комнаты:</h2>
                            <input className='border-2 border-blue-300 rounded-md p-0.5 mr-10'
                                type="text" placeholder='Пароль комнаты' value={roomPassword} onChange={e => setRoomPassword(e.target.value)} />
                            <h2>Количество комнат: {allRooms.length}</h2>
                            <ul>
                                {allRooms.map((room, index) =>
                                    <div key={room.id}>
                                        {(room.numberOfUsers < 2) ?

                                            (<li>
                                                Комната: {room.roomName}
                                                <button onClick={() => onEnterToRoom(room)}
                                                    className='btn btn-success border-2 border-blue-300 rounded-md p-0.5 ml-2 mb-1'>Присоединиться</button>
                                            </li>)

                                            :
                                            (<li>
                                                Комната: {room.roomName} <b>Заполнена</b>
                                            </li>)}
                                    </div>
                                )}
                            </ul>
                        </div>
                        :
                        <div className="join-block text-center border-double border-b-8 mt-4">
                            <label className='p-0.5 mr-10'>
                                <input type="checkbox" value = {isPasswordNeeded} onClick={e => {setIsPasswordNeeded(e.target.checked) 
                                    setRoomPassword('')}}/>
                                    Без пароля
                            </label>
                            
                            <input disabled={isPasswordNeeded} className='border-2 border-blue-300 rounded-md p-0.5 mr-10'
                                type="text" placeholder='Пароль комнаты' value={roomPassword} onChange={e => setRoomPassword(e.target.value)} />
                            <input className='border-2 border-blue-300 rounded-md p-0.5 mr-10'
                                type="text" placeholder='Ваше имя' value={userName} onChange={e => setUserName(e.target.value)} />
                            <button disabled={isLoading} onClick={onMakeNewRoom}
                                className='btn btn-success border-2 border-blue-300 rounded-md p-0.5' >
                                {isLoading ? 'Создаем...' : 'Создать комнату'}
                            </button>
                            <button className='btn btn-success border-2 border-blue-300 rounded-md p-0.5 ml-4 font-bold bg-gray-300'
                                onClick={showAllRooms}>Войти в комнату</button>
                        </div>}
                </div>
                    :
                    <div className='mt-2'>
                        <button className='btn btn-success border-2 border-blue-300 rounded-md p-0.5 ml-4 font-bold'
                            onClick={showAllRooms}>Войти в комнату</button>
                        <button className='btn btn-success border-2 border-blue-300 rounded-md p-0.5 ml-4 font-bold'
                            onClick={makeNewRoom}>Создать комнату</button>
                    </div>}

            </div>
        </>
    );
}

export default JoinBlock;
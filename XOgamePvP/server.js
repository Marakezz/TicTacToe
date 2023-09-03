const express = require('express');
const app = express(); 
// const useSocket = require('socket.io');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
    }
});
app.use(express.json());

const rooms = new Map();
let roomIndex = 0;
const numberOfPlayersInTheRoom = 2

app.get('/rooms/:id', (req, res) => { 
    const {id: roomIndex} = req.params;
    const users = [];
    [...rooms.get(+roomIndex).get('users').values()].forEach((item, index) => {
        const obj = {
            id: item.get('id'),
            userName: item.get('userName'),
            points: item.get('points'),
            isReady: item.get('isReady')
        }
        users.push(obj);
    }) 
    const obj = rooms.has(+roomIndex) ? {
        users: users,
        messages: [...rooms.get(+roomIndex).get('messages').values()]
    } : {users:[], messages: []};
    res.json(obj);
});

app.get('/roomUsers/:id', (req, res) => { //Больше не нужен?
    const {id: roomIndex} = req.params;
    const users = [];
    if(rooms.has(+roomIndex)){
        [...rooms.get(+roomIndex).get('users').values()].forEach((item, index) => {
            const obj = {
                id: item.get('id'),
                userName: item.get('userName'),
                points: item.get('points'),
                isReady: item.get('isReady')
            }
            users.push(obj);
        }) 
        res.json(users);
    } else {
        res.json([]);
    }
});


app.post('/rooms', (req, res) => {
    const { userName, roomPassword } = req.body;
    let a = 0;
    rooms.forEach((room) => {
        if(room.get('roomName') === userName){ 
        a++;
        }
    });

    if(a === 0)
    {rooms.set(
        roomIndex,
        new Map([
          ['users', new Map()],
          ['messages', []],
          ['roomName', userName],
          ['roomPassword', roomPassword],
          ['currentPlayer', 0],
          ['currentRound', 1],
          ['cells', ['', '', '', '', '', '', '', '', '']] //O - это буква
        ]),
    );

    res.json(roomIndex);
    roomIndex ++ ;} else {
        res.json('NicknameIsAnavailable')
    }
    res.send();
  });


  app.post('/checkPassword', (req, res) => {
    const {roomIndex, roomPassword} = req.body;
    if(rooms.has(roomIndex)) {
        if((rooms.get(roomIndex).get('users').size) >= numberOfPlayersInTheRoom ) {
            res.json('RoomIsFull') 
        }
        else {
        if((rooms.get(roomIndex).get('roomPassword') === '') || (roomPassword === rooms.get(roomIndex).get('roomPassword'))) {
            res.json('Success')
        } else {
            res.json('Fail')
        }
        }
        } else {
            res.json('RoomIsNotExist')
        }

  });

  app.post('/changeReady', (req,res) => {
    const {userId, roomIndex, status} = req.body;
    rooms.get(roomIndex).get('users').get(userId).set('isReady', status );
    const users = [];
    let isAllReady = true;
    [...rooms.get(+roomIndex).get('users').values()].forEach((item, index) => {
        if(rooms.get(+roomIndex).get('users').size < numberOfPlayersInTheRoom)
        isAllReady = false; else {
            if(item.get('isReady') === false) 
            isAllReady=false;
        }
      

        const obj = {
            id: item.get('id'),
            userName: item.get('userName'),
            points: item.get('points'),
            isReady: item.get('isReady')
        }
        users.push(obj);
    }) 
    const currentPlayerId = rooms.get(roomIndex).get('currentPlayer')
    const currentRound = rooms.get(roomIndex).get('currentRound')
    const cells = rooms.get(roomIndex).get('cells')

    res.json({users, isAllReady, currentPlayerId, currentRound, cells});

  })

  app.post('/cellClicked', (req,res) => {
    const {userId, roomIndex, cellIndex} = req.body;
    //Да это жестко
    if([...rooms.get(+roomIndex).get('users').values()][rooms.get(roomIndex).get('currentPlayer')].get('id') === userId){

        if(rooms.get(roomIndex).get('cells')[cellIndex]) {
            res.json('CellIsAnavailable')
        } else {
            
            console.log('Сходил игрок ' + [...rooms.get(+roomIndex).get('users').values()][rooms.get(roomIndex).get('currentPlayer')].get('userName') )
            if(rooms.get(roomIndex).get('currentPlayer')%2 === 0) {
                rooms.get(roomIndex).get('cells')[cellIndex] = 'X'
            } else {
                rooms.get(roomIndex).get('cells')[cellIndex] = 'O'
            }

            let isDraw = false;
            let win = 0
            //Проверка выиграна ли игра
           
            if( (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex+3]) && //верхний в вертикальной
            (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex+6])) win++
            if( (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex-3]) && //средний в вертикальной
            (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex+3])) win++
            if( (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex-3]) && //нижний в вертикальной
            (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex-6])) win++

            if ((cellIndex%3 === 0) && (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex+1]) && //левый в горизонтальной
            (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex+2])) win++
            if ((cellIndex%3 === 1) && (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex+1]) && //средний в горизонтальной
            (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex-1])) win++
            if ((cellIndex%3 === 2) && (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex-1]) && //правый в горизонтальной
            (rooms.get(roomIndex).get('cells')[cellIndex] === rooms.get(roomIndex).get('cells')[cellIndex-2])) win++

            if ((rooms.get(roomIndex).get('cells')[0] === rooms.get(roomIndex).get('cells')[4]) && //диагональ 1
            (rooms.get(roomIndex).get('cells')[0] === rooms.get(roomIndex).get('cells')[8]) && (rooms.get(roomIndex).get('cells')[4] !== '') ) win++
            if ((rooms.get(roomIndex).get('cells')[2] === rooms.get(roomIndex).get('cells')[4]) && //диагональ 2
            (rooms.get(roomIndex).get('cells')[2] === rooms.get(roomIndex).get('cells')[6]) && (rooms.get(roomIndex).get('cells')[4] !== '') ) win++

           
            // console.log(win)

            const users = [];
            if(win <= 0 ) {
                rooms.get(+roomIndex).set('currentPlayer', ((rooms.get(roomIndex).get('currentPlayer')+1)%numberOfPlayersInTheRoom));
                isDraw = true;
                [...rooms.get(roomIndex).get('cells')].forEach((cell, id) => {
                    if(!cell) isDraw = false
                })
                if(isDraw) {
                    rooms.get(roomIndex).set('cells', (['', '', '', '', '', '', '', '', '']));
                }
            } else {
                rooms.get(roomIndex).set('cells', (['', '', '', '', '', '', '', '', '']));
                [...rooms.get(+roomIndex).get('users').values()][rooms.get(roomIndex).get('currentPlayer')].set('points', 
                [...rooms.get(+roomIndex).get('users').values()][rooms.get(roomIndex).get('currentPlayer')].get('points')+ 1);
                rooms.get(roomIndex).set('currentRound', rooms.get(roomIndex).get('currentRound')+1);
                rooms.get(+roomIndex).set('currentPlayer', ((rooms.get(roomIndex).get('currentRound')+1)%numberOfPlayersInTheRoom));
                [...rooms.get(roomIndex).get('users').values()].forEach((item, index) => {
                  item.set('isReady', false)
                }) ;
                [...rooms.get(roomIndex).get('users').values()].forEach((item, index) => {
                    const obj ={
                        id: item.get('id'),
                        userName: item.get('userName'),
                        points: item.get('points'),
                        isReady: item.get('isReady')
                    }
                    users.push(obj);
            })
        }
                    const obj = {
                        currentPlayerId:rooms.get(roomIndex).get('currentPlayer'),
                        cells: rooms.get(roomIndex).get('cells'),
                        isDraw,
                        win,
                        users
                }
                    res.json(obj)
            

        }

    } else {
        res.json('ItsNotYourTurn')
    }
    
  })

  app.get('/allRooms', (req, res) => {
    const allRooms = [];

    for (let room of rooms) {
        const obj = {
            id: room[0],
            roomName: room[1].get('roomName'),
            numberOfUsers: room[1].get('users').size
        }
        allRooms.push(obj)
    }

    res.json(allRooms);

  })


io.on('connection', (socket) => {
    socket.on('ROOM:JOIN', ({userName, roomIndex}) => { 
        socket.join(roomIndex); 
        rooms.get(roomIndex).get('users').set(socket.id, new Map([
            ['id', socket.id],
            ['userName', userName],
            ['points', 0],
            ['isReady', false]
        ])); 
        const users = [];
        [...rooms.get(roomIndex).get('users').values()].forEach((item, index) => {
            const obj ={
                id: item.get('id'),
                userName: item.get('userName'),
                points: item.get('points'),
                isReady: item.get('isReady')
            }
            users.push(obj);
        }) 
        socket.to(roomIndex).emit('ROOM:SET_USERS', users);

    });

    
    socket.on('ROOM:NEW_MESSAGE', ({roomIndex, userName, text}) => {
        const obj = {
            userName,
            text,
        }
        if ( rooms.get(roomIndex).get('messages') ) {
            rooms.get(roomIndex).get('messages').push(obj); //messages у нас просто массив
            socket.to(roomIndex).emit('ROOM:NEW_MESSAGE', obj );
        }
    });

    socket.on('CHANGE_READY', ({roomIndex}) => {
        const users = [];
        let isAllReady = true;
        [...rooms.get(roomIndex).get('users').values()].forEach((item, index) => {
            if(item.get('isReady') === false) 
            isAllReady=false;
            const obj ={
                id: item.get('id'),
                userName: item.get('userName'),
                points: item.get('points'),
                isReady: item.get('isReady')
            }
            users.push(obj);
        }) 
        socket.to(roomIndex).emit('ROOM:SET_USERS', users);
        if(isAllReady) {
            const obj = {
                isAllReady,
                currentPlayerId: rooms.get(roomIndex).get('currentPlayer'),
                currentRound: rooms.get(roomIndex).get('currentRound'),
                cells: rooms.get(roomIndex).get('cells')
            }

            socket.to(roomIndex).emit('ROOM:ALLREADY', obj);
        }
    })

    socket.on('ROUND:END_OF_TURN', ({roomIndex, currentPlayerId, cells, win, winnerName}) => {
        const users = [];
        [...rooms.get(roomIndex).get('users').values()].forEach((item, index) => {
            const obj ={
                id: item.get('id'),
                userName: item.get('userName'),
                points: item.get('points'),
                isReady: item.get('isReady')
            }
            users.push(obj);
        }) 
        socket.to(roomIndex).emit('ROOM:SET_USERS', users);

        const obj = {
            currentPlayerId,
            cells, 
            win,
            winnerName,
        }
        socket.to(roomIndex).emit('ROUND:END_OF_TURN', obj);
    })

    socket.on('ROUND:DRAW', (roomIndex) => {
        socket.to(roomIndex).emit('ROUND:DRAW');
    })

    socket.on('disconnect', () => {
        rooms.forEach((value, roomIndex) => {//ищем определенную комнату (здесь в другом порядке value-значение, roomName - ключ)
            if(value.get('users').has(socket.id)){ 

                    if(value.get('users').size === 1) {
                    console.log('Ушел последний пользователь из комнаты: ' + roomIndex)
                    value.get('users').delete(socket.id)
                    rooms.delete(roomIndex);
                    } else {
                        const obj = {
                            userName: value.get('users').get(socket.id).get('userName'),
                            text: '----------Покинул чат----------'
                        }
                        socket.to(roomIndex).emit('ROOM:NEW_MESSAGE', obj );
        
                        rooms.get(roomIndex).set('cells', (['', '', '', '', '', '', '', '', '']));
        
                        value.get('users').delete(socket.id)//это метод Map(а), возвращает тру если удалился, и фолс если нет
                        const users = [];
                        [...value.get('users').values()].forEach((item, index) => {
                            const obj = {
                                id: item.get('id'),
                                userName: item.get('userName'),
                                points: item.get('points'),
                                isReady: item.get('isReady')
                            }
                            users.push(obj);
                        }) 
                        socket.to(roomIndex).emit('ROOM:SET_USERS', users);
                        socket.to(roomIndex).emit('ROOM:ALLREADY', false);
                    }
            }
        });
        console.log('User DISconnected', socket.id);
    });


    console.log('User connected', socket.id);
});


server.listen(8888, (err) =>{  
    if(err) {
        throw Error(err);
    }
    console.log('Сервер запущен');
});
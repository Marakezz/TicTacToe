
const reducer =  (state, action) => {
    switch (action.type) {
        case 'JOINED': 
            return {
                ...state,
                joined: true, 
                userName: action.payload.userName,
                userId: action.payload.userId,
                // roomName: action.payload.roomName,
                roomIndex: action.payload.roomIndex,
            };

            case 'UNJOINED': 
            return {
                ...state,
                joined: false, 
                isReady: false,
                isAllReady: false,
                users: [],
                messages: []
            };

            case 'SET_DATA':  
            return {
                ...state,
                users: action.payload.users,
                messages: action.payload.messages,
            };

            case 'SET_USERS':  
            return {
                ...state,
                users: action.payload,
            };

            case 'NEW_MESSAGE':  
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };

            case 'CHANGE_READY':
            return {
                ...state,
                users: action.payload,
                isReady: action.payload1,
                isAllReady:action.payload2,
                currentPlayerId: action.payload3,
                cells: action.payload4
            };

            case 'ALLREADY':
            return {
                ...state,
                isAllReady:action.payload.isAllReady,
                currentPlayerId: action.payload.currentPlayerId,
                cells: action.payload.cells
            }
            

            case 'ENDOFTURN':
                return {
                    ...state,
                    currentPlayerId: action.payload.currentPlayerId,
                    cells: action.payload.cells
                }


        default:
            return state; //если ничего не передали то возвращает старое состояние
    }
}

export default reducer;
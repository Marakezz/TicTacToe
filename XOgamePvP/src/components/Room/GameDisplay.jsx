import React from "react";

function GameDisplay({userName, users, userId, cells, currentPlayerId, currentRound, isReady, isAllReady, changeReady, clickCell}) {

    // const [timerOfBeginning, setTimerOfBeginning] = React.useState(false);

    return( 
    <div            
        className="
        w-full
        md:w-2/4
        lg:w-3/5
        bg-neutral-50
        h-1/2
        md:h-[600px]
    "> {/*flex flex-row */}

        <div className="h-8 w-auto">
            Me: <b>{userName}</b>
        </div>
        

        {
            (isAllReady) ?
            <>
            {/* <h2 className="ml-8 h-8 w-auto">Все готовы!</h2> */}
            <h2 className="h-8 w-auto"> Round: {currentRound}</h2>
            <span className="font-serif h-8">Now it's <b>{users[+currentPlayerId].userName}</b>'s turn</span>
            

            <div className="w-80  ml-auto mr-auto">


            {cells.map((cell, index) => 
                    <button className="font-bold text-xl border-solid border-2 border-black w-24 h-24"
                    onClick={() => clickCell(index)} key = {index}>&nbsp;{cell}&nbsp;</button>)} 
            {/* &nbsp; Этот знак ставит пробел*/}
            </div>              

            </> : 
            <div className="ml-auto mr-auto w-80">
            {
            (isReady) ? 
            <button className="font-bold border-solid border-sky-600 border-4 bg-sky-300 w-60 h-20" 
            onClick={() => changeReady(false)}
            >Отменить готовность</button>
            :
            <button className="font-bold border-solid border-red-600 border-4 bg-red-300 w-60 h-20"
            onClick={() => changeReady(true)}
            >Готов</button> 
            }
            </div>
        }

    </div> 
    )
}

export default GameDisplay;
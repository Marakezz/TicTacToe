import React from "react";

function GameDisplay({userName, users, userId, cells, currentPlayerId, isReady, isAllReady, changeReady, clickCell}) {

    // const [timerOfBeginning, setTimerOfBeginning] = React.useState(false);

    return( 
    <div            
        className="
        w-full
        md:w-2/4
        lg:w-3/5
        flex
        flex-row
        bg-neutral-50
        h-1/2
        md:h-[600px]
    ">

        <div className="h-8 w-auto">
            I am {userName}
        </div>
        

        {
            (isAllReady) ?
            <>
            <h2 className="ml-8 h-8 w-auto">Все готовы!</h2>
            <span className="ml-2 font-serif font-bold h-8">Now it's {users[+currentPlayerId].userName}'s turn</span>

            <div className="w-80">


            {cells.map((cell, index) => 
                    <button className="font-bold text-xl border-solid border-2 border-black w-24 h-24"
                    onClick={() => clickCell(index)} key = {index}>{cell}</button>)}

            </div>       

            {/* {cells.map((cell, index) => 
            (index/3 < 1) ?
                            <button className="font-bold text-xl border-solid border-2 border-black w-24 h-24"
                            onClick={clickCell}>{cell}</button> : <>
            {
            (index/3 < 2) ? <button className="font-bold text-xl border-solid border-2 border-black w-24 h-24"
                            onClick={clickCell}>{cell}</button> :
                            <button className="font-bold text-xl border-solid border-2 border-black w-24 h-24"
                            onClick={clickCell}>{cell}</button>
            }
            </>
            
            )}  */}
            

            {/* {
            (userId === users[+currentPlayerId].id) ?
            <button className="font-bold border-solid border-black border-4 bg-green-400 m-auto w-60 h-20" 
            onClick={clickCell}>Кликни</button> :
            <button className="font-bold border-solid border-black border-4 bg-gray-600 m-auto w-60 h-20" 
            onClick={clickCell}>Кликни</button>
            } */}
        

            </> : 
            <>
            {
            (isReady) ? 
            <button className="font-bold border-solid border-sky-600 border-4 bg-sky-300 m-auto w-60 h-20" 
            onClick={() => changeReady(false)}
            >Не готов</button>
            :
            <button className="font-bold border-solid border-red-600 border-4 m-auto bg-red-300 w-60 h-20"
            onClick={() => changeReady(true)}
            >Готов</button>
            }
            </>
        }

    </div> 
    )
}

export default GameDisplay;
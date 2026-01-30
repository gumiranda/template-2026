import { useState } from "react"
import MenuPage from "../menu/page"
import { Id } from "@workspace/backend/_generated/dataModel"
export default function CreateMenu({id}:{id:Id<"restaurants">}) {
    const [createMenu, setCreateMenu] = useState(false)

    return (
        <div >
            {createMenu == true ? (
                <div className="fixed inset-0 z-50 flex items-start justify-center ">
                    <div className="mt-20 w-full  bg-white rounded-2xl p-6 max-h-[80%] max-w-[80%] overflow-y-auto rounded-x5">

                   <button onClick={() => setCreateMenu(false)} className="flex items-center l-100px">
                        x
                    </button>
                    <MenuPage selectedRestaurantIdProps={id} >
                    </MenuPage>
                    
                     </div>
                </div>
            ) : (
                <div>
                    <button onClick={() => setCreateMenu(true)}>
                        create menu
                    </button>
                </div>
            )}
        </div>
    )
}
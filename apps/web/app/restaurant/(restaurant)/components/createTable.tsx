
import { ChangeEvent, useState } from "react"

import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Id } from "@workspace/backend/_generated/dataModel";
export default function CreateTableBtn({selectRestaurantId}:{selectRestaurantId:string | null}) {
    function CreateTable() {
        const createTable = useMutation(api.tables.createTable);
        const[tableData, setTableData] = useState({
            tableNumber:"",
            capacity:0,
            qrCode:""

        });

        async function create() {
            await createTable({
                isActive:true,
                restaurantId:selectRestaurantId as Id<"restaurants">,
                tableNumber:tableData.tableNumber,
                capacity:Number(tableData.capacity),
                qrCode:tableData.qrCode
            })    
        }
        
        function handleSetData(e:any) {
            setTableData({... tableData, [e.target.name]:e.target.value})
        }
    return( 
     <div>
        <Input placeholder="table number" type="text" name="tableNumber" onChange={(e) => handleSetData(e)}></Input>
        <Input placeholder="capacity" type="number" name="capacity" onChange={(e) => handleSetData(e)}></Input> 
        <Input placeholder="qrCode" type="text" name="qrCode" onChange={(e) => handleSetData(e)}></Input>
        <Button onClick={create}>
            create table
        </Button>
     </div>
    )
}
    const[showCreateTable, setShowCreateTable] = useState(false)
    return(
        <div>
            {showCreateTable == true? (

                <div className="relative">
                    <div className="p-2 h-16">
                 
                    <button onClick={() => setShowCreateTable(false)} className="absolute h-8 p-4 right-2">
                        x
                    </button>
                           
                    </div>
                    <CreateTable />
                </div>
            ):(
                <div>
                    <button onClick={() => setShowCreateTable(true)}>
                        create table
                    </button>
                </div>
            )}
        </div>
    )
}
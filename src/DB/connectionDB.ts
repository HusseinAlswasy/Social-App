
import { connect } from "mongoose";
import { DB_URL } from "../config/config.service";
import dns from "node:dns";


// dns.setServers([
//     "8.8.8.8",
//     "1.1.1.1",
// ])
export default async function connectionDB(){
    try{
        await connect(DB_URL)
        console.log("DB Connected Successfully..............🤩");
        
    }catch(error){
        console.log("DB Connected Failed..............💀");

    }
}
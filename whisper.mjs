


import OpenAI  from "openai";
import fs from "fs";


let key ="OPENAI-API-KEY-HERE"


const openai = new OpenAI({
    apiKey:key,
});


const Audioo= async()=>{
   const transcription= await openai.audio.transcriptions.create(
    {
        file:fs.createReadStream('C:/Users/user/Desktop/Proj1/assets/recording(29).wav'),
        model:'whisper-1'

    }
   )
  console.log(transcription);


}
Audioo();





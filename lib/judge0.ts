import axios from "axios";
import { ms } from "date-fns/locale";

export function getJudge0laguageId(language:string){
    const languageMap={
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
    }
    return languageMap[language.toUpperCase() as keyof typeof languageMap];
}

export async function submitBatch(submissions:any) {
    
    const options = {
  method: 'POST',
  url: 'https://judge0-extra-ce1.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': '201fcca4a3mshbc5b6b16019cec5p10f95djsna061b05b9c6b',
    'x-rapidapi-host': 'judge0-extra-ce1.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: 
    {submissions: submissions}
    
  
};

    
    const {data}= await axios.request(options);
    return data;
}

export async function pollBatchResults(tokens:string[]) {
    while(true){
        const options = {
  method: 'GET',
  url: 'https://judge0-extra-ce1.p.rapidapi.com/submissions/batch',
  params: {
    tokens: tokens.join(","),
    base64_encoded: 'true',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': '201fcca4a3mshbc5b6b16019cec5p10f95djsna061b05b9c6b',
    'x-rapidapi-host': 'judge0-extra-ce1.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};
    const {data}= await axios.request(options);
    const results=data.submissions;
    const isAllDone=results.every(
        (r:any)=>r.status.id!==2 &&r.status.id!=2
    )
    if (isAllDone){return results;}
    await sleep(1000);
    }
}
export const sleep=(ms:any)=>new Promise((resolve)=>setTimeout(resolve,ms));

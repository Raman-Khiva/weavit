import { Request, Response } from "express"

// LEETCODE Routes 

export const getLeetcodeByUsername = async(req : Request, res : Response)=>{
       
  try{
    
    const {username} = req.params;
    if(!username || (typeof username != "string")){
      return res.status(500).json({
        message : "User name is required",
        error : "Invalid username"
      })
    }
    
    const recentSubmissionListQuery = `
     query recentSubmissions($username : String!){
        recentSubmissionList(username : $username, limit : 1){
           timestamp
        }
    }`; 

    const variables = {
      username : username
    };

    const response = await fetch("https://leetcode.com/graphql",{
      method : 'POST',
      headers : {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
      , body : JSON.stringify({
        query : recentSubmissionListQuery,
        variables : variables
      })
    });

    if(!response.ok){
      return res.status(response.status).json({
          message : "Failed to fetch data from leetcode",
      })
    }

    const result = await response.json();

    if(result.errors){
      return res.status(400).json({
        errors : result.errors
      })
    }

    const todayStart = new Date(); 
    todayStart.setHours(0,0,0,0);

    const recentTimestamp = Number(result.data.recentSubmissionList?.[0].timestamp) *1000;

    let doneToday : boolean= false;

    if(recentTimestamp) doneToday = recentTimestamp >= todayStart.getTime();

    return res.status(200).json({doneToday : doneToday});



  }catch(error){
    return res.status(500).json({
      message : "Internal Server Error while fetching leetcode data",
      error : error,
    })
  }
}

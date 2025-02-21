const axios = require('axios')
const parse = require('node-html-parser').parse;
const {getGMail} = require('uuseCommons');
const {
  date,
  capture,
  doNotUpdate} = require('uuseCommons');
const {extractFutureDate} = require('uuseCommons')
const {findStartingContent} = require('uuseCommons');
const {getArticlesFromHTML,getAllArticles} = require('uuseCommons')
const {cleanTitle, normalizeTitle} = require('uuseCommons')
const {updateMenu,bulkInsert,bulkUpdate,
       bulkDelete,fetchRecords, getEvents, 
       getAxiosTemplate,
       getRepeaters} = require('uuseCommons');
const {append1, append3, divider} = require('uuseCommons')
const {richContentToText,
  getGeneratedDescriptionFromArticle,
  getLongDescriptionFromArticle,
  getTextFromArticle,
  newEvent} = require('uuseCommons');

const emmyS_BlogPost_ID ='f0c96956-2277-4491-a644-027e1b07bbd4';
const my_BlogPost_ID    ='ec852cd6-a03d-4eab-9638-538fc58f2570';
const the_BlogPost_ID = (doNotUpdate)?my_BlogPost_ID:emmyS_BlogPost_ID;
console.log("DO NOT UPDATE",doNotUpdate,the_BlogPost_ID)

const timestamp = new Date().toISOString();    // used in Rich Content annotations

const filters = {subject: "Update From Emmy", from:"dcym@uuse.org"};

getGMail(filters ,date, capture, (html)=>{
  const root = parse(html);
  const path = findStartingContent(root);
  const articles = getArticlesFromHTML(path);
  const options = getAxiosTemplate("?");
  options.url= '/posts/'+the_BlogPost_ID+"?fieldsets=RICH_CONTENT";
  options.method = 'get';
  options.baseURL= 'https://www.wixapis.com/blog/v3';
  delete options.data

  let article = articles[0][1];
  // article.shift();
  // article = article.slice(0,-15);
  const richContent = {nodes:article,documentStyle:{}};
  const url = options.baseURL+'/draft-posts/'+the_BlogPost_ID
  const updatedContent = {draftPost:{richContent}};

  axios.patch(url, updatedContent, {
      headers : options.headers
    })
      .then(response => {
        console.log("Updated Blog Post:", response.status,response.data);
          const url = `https://www.wixapis.com/blog/v3/draft-posts/${the_BlogPost_ID}/publish`;
          if (!doNotUpdate)
          axios.post(url, {}, {
            headers: options.headers
          }).then(response =>{
            console.log("Response:", response.data);
          })
      })
      .catch(error => {
        console.error(url)
        console.error(options.headers)
        console.error(updatedContent)
        console.error("Error updating blog post:", error.response ? error.response.data : error);
      });
  })
//})

function pretty(s){return JSON.stringify(s,null,2)}
function stop(){process.exit(0)}


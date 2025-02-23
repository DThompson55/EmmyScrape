const axios = require('axios')
const parse = require('node-html-parser').parse;
const {getGMail} = require('uuseCommons');
const {date, capture, doNotUpdate} = require('uuseCommons');
const {findStartingContent} = require('uuseCommons');
const {getArticlesFromHTML,getAllArticles} = require('uuseCommons')
const {getAxiosTemplate} = require('uuseCommons');

const emmyS_BlogPost_ID ='f0c96956-2277-4491-a644-027e1b07bbd4';
const my_BlogPost_ID    ='ec852cd6-a03d-4eab-9638-538fc58f2570';

const the_BlogPost_ID = (doNotUpdate)?my_BlogPost_ID:emmyS_BlogPost_ID;
console.log("DO NOT UPDATE",doNotUpdate,the_BlogPost_ID)

const filters = {subject: "Update From Emmy", from:"dcym@uuse.org"};
const headers = getAxiosTemplate("").headers;

getGMail(filters ,date, capture, (html)=>{
  const root = parse(html);
  const path = findStartingContent(root);
  const articles = getArticlesFromHTML(path);
  const article = articles[0][0];

  const url = `https://www.wixapis.com/blog/v3/draft-posts/${the_BlogPost_ID}?fieldsets=RICH_CONTENT`;

  axios.patch(url, 
        {draftPost:{
         richContent:{nodes:article,documentStyle:{}},
         firstPublishedDate:(new Date().toISOString())
        }}, 
        {headers})
      .then(response => {
          const url = `https://www.wixapis.com/blog/v3/draft-posts/${the_BlogPost_ID}/publish`;
          if (!doNotUpdate)
          axios.post(url, {}, {
            headers
          }).then(response =>{
            console.log("Emmy Blog Update Response:", response.data);
          })
      })
      .catch(error => {
        console.error("Error updating blog post:", error.response ? error.response.data : error);
        console.error(`"_id ="${the_BlogPost_ID}`);
      });
  })
//})

function pretty(s){return JSON.stringify(s,null,2)}
function stop(){process.exit(0)}


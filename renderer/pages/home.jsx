import { app } from 'electron';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import child_process from "child_process";
import * as util from "util";
import sudoer from "sudo-prompt";
import path from "path"; 

function Home() {
 
 
  async function handleClick() {
    console.log("increment like asdasd count")

    var path = require('path');
    var p = path.join(__dirname, '.', 'README.md');
    console.log(p);
   

 
  /*  await command(ipSecConf).then((value) => {       
      console.log(value)  
      //    child_process.spawn('rasdial', [`${connectionName}`, '', '']);
       }).catch(error=>{
        console.log(error, 'Settings error has occurred');
       });  
*/
  }
 

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-javascript)</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Nexts.js ⚡ -
          <Link href="/next">
            <a>Go tod next page</a>
          </Link>
        
        </p>
        <img src="/images/logo.png" />
      </div>
    </React.Fragment>
  );
};

export default Home;

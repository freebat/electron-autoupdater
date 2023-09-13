import { app,ipcRenderer,ipcMain } from 'electron';
import React,{useEffect,useState} from 'react';
import Head from 'next/head';
import Link from 'next/link';
import child_process from "child_process";
import * as util from "util";
import sudoer from "sudo-prompt";
import path from "path"; 

function Home() {
 
  const [message, setmessage] = useState('hello world');
 
 
  useEffect(() => {    


    ipcRenderer.on(
      "message",
      function (event, arg) {
        console.log(arg);
        setmessage(arg);  
      }) 
 
  }, []);

  

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-javascript)</title>
      </Head>
      <div>
        <div>{message}</div>
      </div>
    </React.Fragment>
  );
};

export default Home;

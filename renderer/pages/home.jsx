import { app } from 'electron';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import child_process from "child_process";
import * as util from "util";
import sudoer from "sudo-prompt";
import path from "path";
import { KillSwitch } from "./killswitch";


function Home() {

  const killnetwork = new KillSwitch();

  async function command(AddVPNCmd) {
    return new Promise((resolve, reject) => {
      //  const childProcess = spawn('powershell.exe', ['-Command', 'Get-VpnConnection -Name "Your VPN Connection Name" | Select-Object -ExpandProperty ConnectionStatus']);
      const result_add_vpn = child_process.spawn('powershell.exe', ['-Command', AddVPNCmd]);     
     
      let errorMessage_out='';
      let result = '';
      result_add_vpn.stdout.on('data', (data) => {
        result = 'success';
      });
  
      result_add_vpn.stderr.on('data', (data) => {
        errorMessage_out += data.toString();
        result='error';
      });
  
      result_add_vpn.on('close', (code) => { 
        console.log(errorMessage_out);
        if (code === 0) {
          resolve(result);
        } else {
          reject(result);
        }
      });
    });
  }
 
  async function handleClick() {
    console.log("increment like asdasd count")

    var path = require('path');
    var p = path.join(__dirname, '.', 'README.md');
    console.log(p);
    
    killnetwork.enabled_test();

 

 
  /*  await command(ipSecConf).then((value) => {       
      console.log(value)  
      //    child_process.spawn('rasdial', [`${connectionName}`, '', '']);
       }).catch(error=>{
        console.log(error, 'Settings error has occurred');
       });  
*/
  }
  async function disabled_handleClick() {
    console.log("increment like asdasd count")

    var path = require('path');
    var p = path.join(__dirname, '.', 'README.md');
    console.log(p);
    
    killnetwork.disable_test();

 

 
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
          <button onClick={handleClick}>Enabled</button>

          <button onClick={disabled_handleClick}>Disabled</button>
        </p>
        <img src="/images/logo.png" />
      </div>
    </React.Fragment>
  );
};

export default Home;

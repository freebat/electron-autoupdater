import { app } from "electron";
import { ISWVpn } from "main/types/types";
import path from "path";
import fs from "fs"; 
import sudoer from "sudo-prompt";
import wincmd from "node-windows";
import fetch from "cross-fetch";
import Downloader from "nodejs-file-downloader";
import child_process from "child_process";
import { KillSwitch } from "./killswitch";

const connectionName = 'IpSecVpn';
const conCheckConf = `Get-VpnConnection -Name "${connectionName}" | Select-Object -ExpandProperty ConnectionStatus`;
const conDisconectConf = `  ${connectionName}  /disconnect`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
interface IIPSEConnect {
    serverIp: string;
    configName: string;
    allowedApps: ISWVpn["allowed_apps"][];
    splitOption: ISWVpn["split_option"]["ipsec"];
    configKeyName: string;         
    killswitch_status: boolean;
    all_locations:string[]
  }
  function messageSend (data: ISWVpn["message_event"]){
    console.log(data,'MESSAGE STAATUS')
    process.emit("message", data, () => {});
  };
  export class Ikev2 {
 

    public connect = async (props: IIPSEConnect) => {

     let killswitch_status = props.killswitch_status;
     const killnetwork = new KillSwitch();

      console.log('KILL SWITCH')

  

      //http://210.114.19.151:8080/client_test555/client_test555.p12
      let serverIp =  '210.114.19.151' //props.serverIp;
      console.log(props);

       const configPath = path.join(
            app.getPath("userData"),
            serverIp,
            `${props.configKeyName}.p12`
          );        
          
          console.log(configPath);

          if(!fs.existsSync(configPath)){
            const dlResult = await this.downloadConfig(serverIp, props.configKeyName);
            console.log(dlResult)
            if (dlResult === "ABORTED") {
              messageSend({
                vpn_status: "disconnected",
              });
            }
          }
          //C:\Users\CSKIT\AppData\Roaming\softwiz-vpn\139.84.227.105\freebat2003@gmail.com.p12


 
    
      const serverAddress = serverIp;
    
      const certutilCommand = `certutil -f -p "" -importpfx "${configPath}" NoExport `;
      const sudoOptions = { name: '136', };
      const AddVPNCmd = `Add-VpnConnection -ServerAddress "${serverAddress}" -Name "${connectionName}" -TunnelType IKEv2 -AuthenticationMethod MachineCertificate -EncryptionLevel Required -PassThru`;
      const ipSecConf = `Set-VpnConnectionIPsecConfiguration -ConnectionName "${connectionName}" -AuthenticationTransformConstants GCMAES128 -CipherTransformConstants GCMAES128 -EncryptionMethod AES256 -IntegrityCheckMethod SHA256 -PfsGroup None -DHGroup Group14 -PassThru -Force`;
      //Add-VpnConnection -Name "Your VPN Connection Name" -ServerAddress "vpn.example.com" 2>&1
  
      //Get-VpnConnection -Name "Your VPN Connection Name" | Select-Object -ExpandProperty ConnectionStatus

      
     try{
 // work
        await sudoer.exec(certutilCommand, sudoOptions, function (error, stdout, stderr) {
        if (error) throw error; 
        console.log('stdout: ' + stdout);
      });

      await this.runAddVPNCommand(AddVPNCmd).then(async(value) => {  
        console.log(value,'add vpn then')  
        await this.runAddSettingsCommand(ipSecConf).then(async (value) => {       
          console.log(value,'settings check')  

            
              await runConnectCommand().then((obj)=>{
                console.log(obj.connection_status)
              if(obj.connection_status){
                messageSend({
                  vpn_status: "connected",
                }); 

                  if (killswitch_status) {
                //   sudoer.exec(
                //     'netsh interface set interface "Ethernet" admin=disable',
                //     { name: "SOFTWIZ" },
                //     (err, stdout) => {
                //       sudoer.exec(
                //         'netsh interface set interface "Ethernet" admin=enable',
                //         { name: "SOFTWIZ" }
                //       );
                //     }
                //   );
               }
                
              }else{
                messageSend({
                  vpn_status: "disconnected",
                }); 
              }

              }).catch(error=>{
                console.log(error);
                messageSend({ vpn_status: "disconnected" });

              });
            
          }).catch(error=>{
            console.log(error, 'Settings error has occurred');
            messageSend({ vpn_status: "disconnected" });
          });  
      }).catch(async function (value:string) {      
        console.log(value.length,'add v[n] config erroraaaaaaaaaaaa')   
        if(value==='already'){
          console.log('connection begin',`${connectionName}`)
        
            await runConnectCommand().then((obj)=>{
              console.log(obj)              
                if(obj.connection_status){
                  console.log(obj.connection_status)
                  messageSend({
                    vpn_status: "connected",
                  }); 
                }
                else{                  
                messageSend({
                  vpn_status: "disconnected",
                }); 
                }
                
            }).catch(error=>{
              console.log(error);
              messageSend({ vpn_status: "disconnected" });
            });
    
        }
        else
        {
          this.isRunning().then((isRunning:boolean) => {
            if (isRunning) {
              messageSend({ vpn_status: "connected" });
            } else {
              messageSend({ vpn_status: "disconnected" });
            }
          });  
        }
               
      });
        
     }
     catch(error){

      messageSend({ vpn_status: "disconnected" });
     } 
    
  }
  
 
  

    
public runCheckStatusCommand = async( conCheckConf:string)=>{
  return new Promise((resolve, reject) => {
    //  const childProcess = spawn('powershell.exe', ['-Command', 'Get-VpnConnection -Name "Your VPN Connection Name" | Select-Object -ExpandProperty ConnectionStatus']);

    const result_status_config = child_process.spawn('powershell.exe', ['-Command', conCheckConf]);
    let connection_status = '';
    let return_status = false;
    result_status_config.stdout.on('data', (data) => {
      connection_status = data.toString();

      ///console.log(connection_status, connection_status.length, 'Connected'.length);
      if (connection_status.replace(/\s/g, '') === 'Connected') {
        console.log('Connected')
        return_status=true;
      }
      else {
        console.log('Disconnected');
        return_status=false;
      }
    }); 

    result_status_config.on('close', (code) => { 
      if (code === 0) {
        resolve(return_status);
      } else {
        reject(return_status);
      }
    });

  });
}


public runAddSettingsCommand = async( AddVPNCmd:string)=>{
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
      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  });
}

public runAddVPNCommand = async( AddVPNCmd:string)=> {
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
    
      if(result==='error'){
          
        if (errorMessage_out.includes('This VPN connection has already been created')) 
          {
            console.log('VPN connection already exists.');
            result = 'already';
          } else {
            result = 'error';
          }
      } 
      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  });
}

    public downloadConfig = async (serverIp: string, configFileName) => {
      
      const res = await fetch(
        `http://${serverIp}:8080/client/createIKEv2ClientConfig`,
        //`http://${serverIp}/v1/client/createOVPNClientConfig`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ client_name: configFileName }),
        }
      )
        .then((res) => res.json())
        .then((res) => res).catch(err=>console.log(err));
        console.log(res);

      if (res.message === "success") {
        const downloader = new Downloader({
          url: `http://${serverIp}:8080/${res.path_p12}`,
          directory: path.join(app.getPath("userData"), `/${serverIp}`),
          fileName: `${configFileName}.p12`,
        });
        const d = await downloader.download();
        return d.downloadStatus;
      }
    };
    
    public isRunning = async (): Promise<boolean> => {
        return new Promise(async (resolve) => {
           
          await this.runCheckStatusCommand(conCheckConf).then(async (value:boolean)=>{
            if(value){
              await sleep(1000);
              resolve(true);
            }
            else{
              resolve(false);
            }
        });    
        });
      };
      public disconnect = (killswitch_status:boolean):void => {
        try {
          const killnetwork = new KillSwitch();

          console.log('disconnecte bgin ',conDisconectConf)
          let result_status_config =child_process.spawn('rasdial', [`${connectionName}`, '/DISCONNECT']);
    
          result_status_config.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
          
          result_status_config.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
          });
          
          result_status_config.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
          });

          
         // const result_status_config = child_process.spawn('powershell.exe', ['-Command', conDisconectConf]);
          result_status_config.on('close', async (code) => {    
            console.log(code)      ;

            if (!killswitch_status) {
                 await killnetwork.disabled();
            }

            this.isRunning().then((isRunning) => {
              if (isRunning) {
                messageSend({ vpn_status: "connected" });
              } else {
                messageSend({ vpn_status: "disconnected" });
              }
            });  
          });

                 
        } catch (err) { console.log(err)}
      }; 
};

 
async function runConnectCommand () {
  return new Promise((resolve, reject) => {
    //  const childProcess = spawn('powershell.exe', ['-Command', 'Get-VpnConnection -Name "Your VPN Connection Name" | Select-Object -ExpandProperty ConnectionStatus']);
    console.log('BEGNI ..................',connectionName)
    let cmd_result =child_process.spawn('rasdial', [`${connectionName}`, '', '']);
    

    let stdout = '';
    let stderr = '';
    let connection_status =false;
    cmd_result.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(data.toString());
      if (/Command completed successfully/.test(data.toString())) {
        console.log("connected successfully"); 
        connection_status =true;
      } 
    }); 
    cmd_result.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    cmd_result.on('close', (code) => { 

      console.log(stdout,stderr)
      if (code === 0) {
        resolve({ stdout, stderr,connection_status });
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

  });
}
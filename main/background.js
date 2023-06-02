import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import child_process from "child_process";
import * as util from "util";
import sudoer from "sudo-prompt";
import Registry  from 'winreg';

const promiseExec = util.promisify(child_process.exec);
const promisespawn = util.promisify(child_process.spawn);
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

async function runCheckStatusCommand(conCheckConf) {
  return new Promise((resolve, reject) => {
    //  const childProcess = spawn('powershell.exe', ['-Command', 'Get-VpnConnection -Name "Your VPN Connection Name" | Select-Object -ExpandProperty ConnectionStatus']);

    const result_status_config = child_process.spawn('powershell.exe', ['-Command', conCheckConf]);
    let connection_status = '';
    result_status_config.stdout.on('data', (data) => {
      connection_status = data.toString();

      ///console.log(connection_status, connection_status.length, 'Connected'.length);
      if (connection_status.replace(/\s/g, '') === 'Connected') {
        console.log('Connected')
        connection_status='Connected';
      }
      else {
        console.log('Disconnected');
        connection_status='Disconnected';
      }
    });

 
    result_status_config.on('close', (code) => { 
      if (code === 0) {
        resolve(connection_status);
      } else {
        reject(connection_status);
      }
    });

  });
}


async function runAddSettingsCommand(AddVPNCmd) {
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

async function runAddVPNCommand(AddVPNCmd) {
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

(async () => {
  await app.whenReady();
  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });
  // const programFilesPath = await promiseExec("echo %ProgramFiles%");
  //console.log(programFilesPath);

  //const rasdial = await promisespawn('rasdial', ['cskit2', '','']); 

  let regKey = new Registry({                                       // new operator is optional
    hive: Registry.HKCU,                                        // open registry hive HKEY_CURRENT_USER
    key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' // key containing autostart programs
  })
  regKey.values(function (err, items /* array of RegistryItem */) {
    if (err)
      console.log('ERROR: '+err);
    else
      for (var i=0; i<items.length; i++)
        console.log('ITEM: '+items[i].name+'\t'+items[i].type+'\t'+items[i].value);
  });

  regKey.set('Your_Application_Name', Registry.REG_SZ, '"' + process.execPath + '"', function (err) {
    if (!err) {
    console.log(err);
    }
});


  const p12_file = 'batsukh.p12';
  const serverAddress = '210.114.19.151';
  const connectionName = 'IPSECV1';
  const certutilCommand = `certutil -f -p "" -importpfx "${p12_file}" NoExport `;
  const sudoOptions = { name: '136', };
  const AddVPNCmd = `Add-VpnConnection -ServerAddress "${serverAddress}" -Name "${connectionName}" -TunnelType IKEv2 -AuthenticationMethod MachineCertificate -EncryptionLevel Required -PassThru`;
  const ipSecConf = `Set-VpnConnectionIPsecConfiguration -ConnectionName "${connectionName}" -AuthenticationTransformConstants GCMAES128 -CipherTransformConstants GCMAES128 -EncryptionMethod AES256 -IntegrityCheckMethod SHA256 -PfsGroup None -DHGroup Group14 -PassThru -Force`;
  //Add-VpnConnection -Name "Your VPN Connection Name" -ServerAddress "vpn.example.com" 2>&1
  const conCheckConf = `Get-VpnConnection -Name "${connectionName}" | Select-Object -ExpandProperty ConnectionStatus`;
  //Get-VpnConnection -Name "Your VPN Connection Name" | Select-Object -ExpandProperty ConnectionStatus

  try {
/*
    // work
    sudoer.exec(certutilCommand, sudoOptions, function (error, stdout, stderr) {
      if (error) throw error; 
      console.log('stdout: ' + stdout);
    });
    await runAddVPNCommand(AddVPNCmd).then(async(value) => {  
      console.log(value)  
      await runAddSettingsCommand(ipSecConf).then((value) => {       
        console.log(value)  
            child_process.spawn('rasdial', [`${connectionName}`, '', '']);
         }).catch(error=>{
          console.log(error, 'Settings error has occurred');
         });  
    }).
      catch(async function (value) {
        await runCheckStatusCommand(conCheckConf);
        console.log(value, 'Some error has occurred');
      });
*/

    /*
    result_add_vpn.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);


      const result_config = child_process.spawn('powershell.exe', ['-Command', ipSecConf]);

      result_config.stdout.on('data', (data) => {

        child_process.spawn('rasdial', [`${connectionName}`, '', '']);


        console.error(`stderr: ${data}`);
      });


      const result_status_config = child_process.spawn('powershell.exe', ['-Command', conCheckConf]);
      let connection_status = '';
      result_status_config.stdout.on('data', (data) => {
        connection_status = data.toString();

        console.log(connection_status, connection_status.length, 'Connected'.length);
        if (connection_status.replace(/\s/g, '') === 'Connected') {
          console.log('Connected')
        }
        else {
          console.log('Disconnected');
        }

      });



    });
*/





    //console.log(stdout);
    //console.error(stderr);
  } catch (err) {
    console.log(err, '1111');
  }
  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

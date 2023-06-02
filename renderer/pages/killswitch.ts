
import child_process from "child_process";
import * as util from "util";
import sudoer from "sudo-prompt";
import path from "path";

export class KillSwitch {
    // Class properties
  
    constructor() {
      // Constructor logic
    }

    private  async status_change_rule_firewall(rule_name:string,status:string): Promise<boolean> {
        return new Promise((resolve, reject) => { 
                
            
            try {
                const command = 'powershell.exe';
                const args = [
                '-ExecutionPolicy',
                'Bypass',
                '-Command',
                `Set-NetFirewallRule -DisplayName "${rule_name}" -Enabled  ${status} 
                `
                ];
                const options = {
                name: 'PowerShell',
                };
    
                sudoer.exec(`${command} ${args.join(' ')}`, options, (error, stdout, stderr) => {
              
                if (error) {
                    resolve(false);
                } else {
                    resolve(true)
                }
                });
            } catch (error) {
                resolve(false)
            }


        });
    }

    private  async check_rule_firewall(rule_name:string): Promise<boolean> {
        return new Promise((resolve, reject) => { 
                
            
            try {
                const command = 'powershell.exe';
                const args = [
                '-ExecutionPolicy',
                'Bypass',
                '-Command',
                `Get-NetFirewallRule  `
                ];
                const options = {
                name: 'PowerShell',
                };
    
                sudoer.exec(`${command} ${args.join(' ')}`, options, (error, stdout, stderr) => {
              
                if (error) {
                    reject(false);
                } else {
                    console.log('Command executed successfully.');          
                    if (stdout.includes(rule_name)) {
                    console.log(`Name '${rule_name}' found in stdout.`);
                    resolve(true)
                    } else {
                    console.log(`Name '${rule_name}' not found in stdout.`);
                    resolve(false)
                    }
                }
                });
            } catch (error) {
                resolve(false)
            }


        });
    }

    private  async set_create_firewall_rule_change(rule_name:string,type:string,url_path:string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {   
            
 
       
            const path =url_path;
            const command = 'powershell.exe';
         
           
           // Set-NetFirewallRule -DisplayName "Killswitch" -Direction Inbound -Action Allow -Profile  Domain, Public,Private -Program "C:\Program Files\Google\Chrome\Application\chrome.exe"; 
            // /New-NetFirewallRule -DisplayName "Killswitch1" -Direction Outbound -Action Allow -Profile Domain,  Public , Private )
            const options = {
              name: 'PowerShell',
            };
            if(type==='program'){

                const args = [
                    '-ExecutionPolicy',
                    'Bypass',
                    '-Command',
                   `New-NetFirewallRule -DisplayName "${rule_name}" -Direction Outbound -Program "${path}" -Action  Allow -Profile  Domain, Public,Private   ` 
                  ];

                  sudoer.exec(`${command} ${args.join(' ')}`, options, (error, stdout, stderr) => {
                    if (error) {
                      console.error(error);
                     
                    } else {
                      console.log('Command executed successfully 1.');
                  //    console.log(stdout);
                    }
                  });  

                    
            const argss = [
                '-ExecutionPolicy',
                'Bypass',
                '-Command',
               `New-NetFirewallRule -DisplayName "${rule_name}" -Direction Inbound -Program "${path}" -Action  Allow -Profile  Domain, Public,Private   ` 
              ];
             
            
            sudoer.exec(`${command} ${argss.join(' ')}`, options, (error, stdout, stderr) => {
                if (error) {
                  console.error(error);
                
                } else {
                  console.log('Command executed successfully 2.');
               //   console.log(stdout);
               resolve(true);  
                }
              });  


           
            }
            else{

                const args = [
                    '-ExecutionPolicy',
                    'Bypass',
                    '-Command',
                   `New-NetFirewallRule -DisplayName "${rule_name}" -Direction Outbound -RemoteAddress "${path}" -Action  Allow -Profile  Domain, Public,Private   ` 
                  ];

                  sudoer.exec(`${command} ${args.join(' ')}`, options, (error, stdout, stderr) => {
                    if (error) {
                      console.error(error); 
                    } else {
                      console.log('Command executed successfully 1.');
                  //    console.log(stdout);


                  const argss = [
                    '-ExecutionPolicy',
                    'Bypass',
                    '-Command',
                   `New-NetFirewallRule -DisplayName "${rule_name}" -Direction Inbound -RemoteAddress  "${path}" -Action  Allow -Profile  Domain, Public,Private   ` 
                  ];
                 
                
                sudoer.exec(`${command} ${argss.join(' ')}`, options, (error, stdout, stderr) => {
                    if (error) {
                      console.error(error);
                      resolve(false)
                    } else {
                      console.log('Command executed successfully 2.');
                   //   console.log(stdout);
                     resolve(true)
                    }
                  }); 

                    }
                  });  


         
             
            }
            
         
        });
      }

    private  async set_firewall_change(blockorallow:string): Promise<boolean> {
        return new Promise((resolve, reject) => {      
       
        
            const command = 'powershell.exe';
            const args = [
              '-ExecutionPolicy',
              'Bypass',
              '-Command',
              `Set-NetFirewallProfile -Profile Domain,Private -DefaultOutboundAction ${blockorallow}`
            ];
            
            const options = {
              name: 'PowerShell',
            };
            
            sudoer.exec(`${command} ${args.join(' ')}`, options, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
              } else {
                console.log('Command executed successfully 1.');
                console.log(stdout);
              }
            });   
            const argss = [
                '-ExecutionPolicy',
                'Bypass',
                '-Command',
                `Set-NetFirewallProfile -Profile Public -DefaultOutboundAction Allow`
              ];
            sudoer.exec(`${command} ${argss.join(' ')}`, options, (error, stdout, stderr) => {
                if (error) {
                  console.error(error);
                } else {
                  console.log('Command executed successfully 2.');
                  console.log(stdout);
                  resolve(true);
                }
              });  
              
            
        });
      }



     private  async get_internet_network_info(): Promise<[number,string]> {
        return new Promise((resolve, reject) => {        
          const res_cmd = child_process.spawn('powershell.exe', ['-Command', "Get-NetConnectionProfile | Where-Object { $_.IPv4Connectivity -eq 'Internet' -or $_.IPv6Connectivity -eq 'Internet' } | Sort-Object -Property Priority | Select-Object -First 1 | ConvertTo-Json"]);                  
          let errorMessage_out='';          
          let get_networkinfo;
          let result = '';
          let InterfaceIndex:number = 0;
          res_cmd.stdout.on('data', (data) => {
            result = 'success';
            get_networkinfo =`${data}`;
          });      
          res_cmd.stderr.on('data', (data) => {
            errorMessage_out += data.toString();
            result='error';
          });      
          res_cmd.on('close', (code) => { 
            console.log(errorMessage_out);
           try {
            InterfaceIndex=JSON.parse(get_networkinfo).InterfaceIndex;
            console.log(InterfaceIndex)
            if (code === 0) {
              resolve([InterfaceIndex,errorMessage_out]);
            } else {
              reject(new Error('Operation get internet adapter'));
            }
           } catch (error) {
            resolve([InterfaceIndex,errorMessage_out]);
           }
          });
        });
      }
      private  async get_set_internet_network_private(interfaceIndex:Number,type:string): Promise<boolean> {
        return new Promise((resolve, reject) => {     
         
            
            const command = 'powershell.exe';
            const args = [
              '-ExecutionPolicy',
              'Bypass',
              '-Command',
              `Set-NetConnectionProfile -InterfaceIndex ${interfaceIndex} -NetworkCategory ${type}`
            ];
            
            const options = {
              name: 'PowerShell',
            };
            
            sudoer.exec(`${command} ${args.join(' ')}`, options, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                reject(new Error('Operation set type'))
              } else {
                console.log('Command executed successfully.');
                resolve(true)
                console.log(stdout);
              }
            }); 



            

        });
      }

      private  async rule_delete_firewall( rule_name:string): Promise<boolean> {
        return new Promise((resolve, reject) => {     
         
            
            const command = 'powershell.exe';
            const args = [
              '-ExecutionPolicy',
              'Bypass',
              '-Command',
              `Remove-NetFirewallRule -DisplayName  "${rule_name}" `
            ];
            
            const options = {
              name: 'PowerShell',
            };
            
            sudoer.exec(`${command} ${args.join(' ')}`, options, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                reject(new Error('Operation delete'))
              } else {
                console.log('Command executed successfully. delete rule');
                resolve(true)
                console.log(stdout);
              }
            }); 



            

        });
      }
      public async disable_test(): Promise<void>  {        
        await this.get_internet_network_info().then(async (a)=>{
        let index:number = a[0];
        console.log(index); 
        let interfaceIndex =  index;

        const options = {
          name: 'VPN', // Optional, provide your application name
        };        
        const command = `        
          powershell.exe -Command "Set-NetConnectionProfile -InterfaceIndex ${interfaceIndex} -NetworkCategory Public "
          powershell.exe -Command " Set-NetFirewallProfile -Profile Domain,Private -DefaultOutboundAction Allow"
          powershell.exe -Command " Remove-NetFirewallRule -DisplayName  "killswitch_w"  "
          powershell.exe -Command " Remove-NetFirewallRule -DisplayName  "killswitch_i"  "           
          powershell.exe -Command " Remove-NetFirewallRule -DisplayName  "killswitch_o"  "
        `;

        sudoer.exec(command, options, function(error, stdout, stderr) {
          if (error) {
            console.error(error);
            return;
          }
        
          // Process the output
          console.log('Standard Output:');
          console.log(stdout);
        
          console.log('Standard Error:');
          console.log(stderr);
        });
      });

      }
      public async enabled_test(): Promise<void>  {

        
        await this.get_internet_network_info().then(async (a)=>{
        let index:number = a[0];
        console.log(index);
        let address_ip='192.168.3.36';
        let wireguard_program = 'm.exe';
        let openvpn_program = 'po.exe';
        let interfaceIndex =  index;

        const options = {
          name: 'SOFTWIZ', // Optional, provide your application name
        };
        
        const command = `        
          powershell.exe -Command "Set-NetConnectionProfile -InterfaceIndex ${interfaceIndex} -NetworkCategory Private "
          powershell.exe -Command " Set-NetFirewallProfile -Profile Domain,Private -DefaultOutboundAction Block"
          powershell.exe -Command " New-NetFirewallRule -DisplayName "killswitch_w" -Direction Outbound -Program "${wireguard_program}" -Action  Allow -Profile  Domain, Public,Private   "
          powershell.exe -Command " New-NetFirewallRule -DisplayName "killswitch_w" -Direction Inbound -Program "${wireguard_program}" -Action  Allow -Profile  Domain, Public,Private   "
          powershell.exe -Command " New-NetFirewallRule -DisplayName "killswitch_i" -Direction Inbound -RemoteAddress  "${address_ip}" -Action  Allow -Profile  Domain, Public,Private "  
          powershell.exe -Command " New-NetFirewallRule -DisplayName "killswitch_i" -Direction Outbound -RemoteAddress  "${address_ip}" -Action  Allow -Profile  Domain, Public,Private "  
          powershell.exe -Command " New-NetFirewallRule -DisplayName "killswitch_o" -Direction Outbound -Program "${openvpn_program}" -Action  Allow -Profile  Domain, Public,Private   "
          powershell.exe -Command " New-NetFirewallRule -DisplayName "killswitch_o" -Direction Inbound -Program "${openvpn_program}" -Action  Allow -Profile  Domain, Public,Private   "
          powershell.exe -Command " Set-NetFirewallRule -DisplayName killswitch_w  -Enabled  True"
          powershell.exe -Command " Set-NetFirewallRule -DisplayName killswitch_o  -Enabled  True"
          powershell.exe -Command " Set-NetFirewallRule -DisplayName killswitch_i  -Enabled  True"
        `;

        sudoer.exec(command, options, function(error, stdout, stderr) {
          if (error) {
            console.error(error);
            return;
          }
        
          // Process the output
          console.log('Standard Output:');
          console.log(stdout);
        
          console.log('Standard Error:');
          console.log(stderr);
        });
      });

      }
    // Class methods
    public async enabled(): Promise<void>  {
      // Function logic
      console.log('hji');
      let rule_name_vpn='killswitch_o';
      let rule_name_wireguard='killswitch_w';
      let rule_name_ikev2='killswitch_i';
      let vpn_ipaddress='103.17.108.20,103.17.108.22';
      let wireguard_app='chrome.exe';
      let openVpn_app='chrome.exe';

      await this.get_internet_network_info().then(async (a)=>{
        console.log(a)
        let index:number = a[0];
        if(index>0){
            await this.get_set_internet_network_private(index,'Private');
            await this.set_firewall_change('Block');  
            
            console.log('NEXT COMMAND1')

            await this.check_rule_firewall(rule_name_ikev2).then(async val=>{
                console.log(rule_name_ikev2,val)
                await this.rule_delete_firewall(rule_name_ikev2);
                await this.set_create_firewall_rule_change(rule_name_ikev2,'ip',vpn_ipaddress);
                 
            });
            console.log('NEXT COMMAND2')
            await this.check_rule_firewall(rule_name_wireguard).then(async val=>{
                console.log(rule_name_wireguard,val)
                if(val){ 
                    await this.status_change_rule_firewall(rule_name_wireguard,'True');
                }
                else{
                    await this.set_create_firewall_rule_change(rule_name_wireguard,'program',wireguard_app);
                }
            });
            console.log('NEXT COMMAND3')
            await this.check_rule_firewall(rule_name_vpn).then(async val=>{
                console.log(rule_name_vpn,val)
                if(val){ 
                    await this.status_change_rule_firewall(rule_name_vpn,'True');
                }
                else{
                    await this.set_create_firewall_rule_change(rule_name_vpn,'program',openVpn_app);
                }
            });            
        } 
       

      }); 
    }

    public async disabled(): Promise<void>  {
        
        let rule_name_vpn='killswitch_o';
        let rule_name_wireguard='killswitch_w';
        let rule_name_ikev2='killswitch_i';
        let vpn_ipaddress='103.17.108.20, 103.17.108.22';
        let wireguard_app='';
        let openVpn_app='';
  
        await this.get_internet_network_info().then(async (a)=>{
          console.log(a)
          let index:number = a[0];
          if(index>0){
              await this.get_set_internet_network_private(index,'Public');
              await this.set_firewall_change('Allow');  
              await this.check_rule_firewall(rule_name_ikev2).then(async val=>{
                  console.log(val)
                  if(val){ 
                      await this.status_change_rule_firewall(rule_name_ikev2,'False');
                  }
                  else{
                      await this.set_create_firewall_rule_change(rule_name_ikev2,'ip',vpn_ipaddress);
                  }
              });
              await this.check_rule_firewall(rule_name_wireguard).then(async val=>{
                  if(val){ 
                      await this.status_change_rule_firewall(rule_name_wireguard,'False');
                  }
                  else{
                      await this.set_create_firewall_rule_change(rule_name_wireguard,'program',wireguard_app);
                  }
              });
              await this.check_rule_firewall(rule_name_vpn).then(async val=>{
                  if(val){ 
                      await this.status_change_rule_firewall(rule_name_vpn,'False');
                  }
                  else{
                      await this.set_create_firewall_rule_change(rule_name_vpn,'program',openVpn_app);
                  }
              });            
          } 
         
  
        }); 

      }
  
    private anotherMethod(): void {
      // Function logic
    }
  }
  
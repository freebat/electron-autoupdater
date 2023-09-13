import { app, BrowserWindow, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import child_process from "child_process";
import * as util from "util";
import sudoer from "sudo-prompt";
import Registry from "winreg";
const log = require("electron-log");

const { autoUpdater, AppUpdater } = require("electron-updater");

const promiseExec = util.promisify(child_process.exec);
const promisespawn = util.promisify(child_process.spawn);
const isProd = process.env.NODE_ENV === "production";

let updateInterval = null;
let updateCheck = false;
let updateFound = false;
let updateNotAvailable = false;
let willQuitApp = false;
let win;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}
 

    app.whenReady().then(async () => {
    const mainWindow = createWindow("main", {
      width: 1000,
      height: 600,
    });

    if (isProd) {
      await mainWindow.loadURL("app://./home.html");
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/home`);
      mainWindow.webContents.openDevTools();
    }

    
    
    updateInterval =  setInterval(() => {
      autoUpdater.checkForUpdates().then(info=>{
        console.log(info);
      }).catch(error=>console.log(error));

      mainWindow.webContents.send(
        "message",
        `Update ... version: ${app.getVersion()}`
      );

    }, 5000) ;

    autoUpdater.on('download-progress', (progressObj) => {
      // let log_message = "Download speed: " + progressObj.bytesPerSecond
      // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
      // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
      // dispatch(log_message)
    
      mainWindow.webContents.send('message', progressObj.percent)
    
    })
    
    
autoUpdater.on('error', (error) => {
  mainWindow.webContents.send(
    "message",
    error
  );
});

  
  app.on("ready", function() {
    autoUpdater.checkForUpdatesAndNotify();
   });
 

  
   
  autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
   
    const dialogOpts = {
      type: 'info',
      buttons: ['Ok'],
      title: `${autoUpdater.channel} Update Available`,
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: `A new ${autoUpdater.channel} version download started.`
  };
  autoUpdater.downloadUpdate();

  mainWindow.webContents.send(
    "message",
    `Update available ... version: ${app.getVersion()}`
  );


  if (!updateCheck) {

 
      updateInterval = null;
      dialog.showMessageBox(dialogOpts);
      updateCheck = true;
  }

  });



autoUpdater.on("update-downloaded", (_event) => {

mainWindow.webContents.send(
  "message",
  `Update downloaded ... version: ${app.getVersion()}`
);


  if (!updateFound) {
      updateInterval = null;
      updateFound = true;

   
      setTimeout(() => {
          autoUpdater.quitAndInstall();
      }, 3500);
  }
});

autoUpdater.on("update-not-available", (_event) => {
const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: `Update Not available for ${autoUpdater.channel}`,
    message: "A message!",
    detail: `Update Not available for ${autoUpdater.channel}`
};
mainWindow.webContents.send(
  "message",
  `Update not-available ... version: ${app.getVersion()}`
);

if (!updateNotAvailable) {
    updateNotAvailable = true;
   

    dialog.showMessageBox(dialogOpts);
}
});


  });

  
app.on("window-all-closed", () => {
  app.quit();
});

  
 

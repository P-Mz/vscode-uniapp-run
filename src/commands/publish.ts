import { CommandFactory } from ".";
import * as vscode from 'vscode';
import { publishCommand } from "../core/uniapp/command";
import { getUniappConfig } from "../context";
import { UnappRunConfig, UniappRuntimeArgs, runtimeArgs } from "../core/uniapp";

export const publish:CommandFactory = (ctx:vscode.ExtensionContext,logger:vscode.LogOutputChannel)=>{
    return async ()=>{
        const folders= vscode.workspace.workspaceFolders;
        if(!folders){
            vscode.window.showErrorMessage("获取工作目录失败")
            return
        }
        if(folders.length>1){
            vscode.window.showErrorMessage("查找到多个工作目录")
            return
        }
        const currentWorkspace=folders[0]
        // 获取 launch.json 配置
        const config = vscode.workspace.getConfiguration(
            'launch',
            currentWorkspace.uri
          );
        const  configurations:Array<any>= config.get("configurations")??[];
        //过滤type=uniapp-run
        const uniappRunConfigurations = configurations.filter((item: any) => item.type === "uniapp-run")||[];
        let defaultConfig=configurations[0];
        // 如果有多个配置，让用户选择
        if(uniappRunConfigurations.length>1){
         const res= await vscode.window.showQuickPick(
                uniappRunConfigurations.map((item:any)=>item.name),
                {
                    placeHolder:"请选择要编译运行的配置",
                
                }
            );
            defaultConfig=uniappRunConfigurations.find((item:any)=>item.name===res);
        }

        if(!defaultConfig){
            vscode.window.showErrorMessage("没有找到配置")
            return;
        }
        const conf:UnappRunConfig=getUniappConfig();
        if(!conf){
            vscode.window.showErrorMessage("请配置HBuilderX路径")
            return;
        }
        const args:runtimeArgs={
            workPath: defaultConfig.src||currentWorkspace.uri.path,
            name: currentWorkspace.name,
            platform: defaultConfig.platform,
            compress: defaultConfig.compress,
            openDevTools: defaultConfig.openDevTools,
            production: true,
            uniVueVersion: defaultConfig.vueVersion,
        }
        publishCommand(new UniappRuntimeArgs(args,conf),logger)
    }
}
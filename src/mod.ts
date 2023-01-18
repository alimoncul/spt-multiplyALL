import { DependencyContainer } from "tsyringe";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { SaveServer } from "@spt-aki/servers/SaveServer";
import config from "../config.json";
import http from "http";
import GetActions from "./get";
import PostActions from "./post";

class DebugTools implements IPostAkiLoadMod 
{
    public port = config.port || 8080;
    public postAkiLoad(container: DependencyContainer): void 
    {
        const saveServer: SaveServer = container.resolve<SaveServer>("SaveServer");
        this.initializeHttpServer(container);
    } 
    initializeHttpServer(container: DependencyContainer) 
    { 
        const logger = container.resolve<ILogger>("WinstonLogger");
        http.createServer(function (req, res) 
        {
            logger.info(`[DebugTools]15 [${req.method}] ${req.url}`);
            if (req.method === "POST") 
            {
                if (req.url === "/add-money") 
                {
                    return PostActions.addMoney(res);
                }
                else 
                {
                    return PostActions.returnNotFound(res);
                }
            }
            else 
            {
                if (req.url === "/debugtools") 
                {
                    return GetActions.returnDashboard(res);
                }
                else if (req.url.indexOf(".js") !== -1) 
                {
                    return GetActions.returnJavascript(req, res);
                }
                else if (req.url.indexOf(".ico") !== -1) 
                {
                    return GetActions.returnIcon(req, res);
                }
                else 
                {
                    return GetActions.returnNotFound(res);
                }
            }
            // saveServer.addBeforeSaveCallback("debugTools", (profile) => 
            // {
            //     // do stuff with profile 
            //     // return
            //     return profile;
            // })
        }).listen(this.port);
    }
}

module.exports = { mod: new DebugTools() }
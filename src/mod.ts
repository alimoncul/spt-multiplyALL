import { DependencyContainer } from "tsyringe";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { SaveServer } from "@spt-aki/servers/SaveServer";
import config from "../config.json";
import http from "http";

class DebugTools implements IPostAkiLoadMod
{
    public port = config.port || 8080; 
    public postAkiLoad(container: DependencyContainer): void 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const saveServer: SaveServer = container.resolve<SaveServer>("SaveServer");
        http.createServer(function (req, res) 
        {
            saveServer.addBeforeSaveCallback("debugTools", (profile) => 
            {
                // do stuff with profile
                // return
                return profile;
            })
            res.write("<html>Hello world</html>"); 
            res.end(); 
        }).listen(this.port); 

        // logger.info(`hello from the mod: ${saveServer.getProfiles()}`);
    }
}

module.exports = { mod: new DebugTools() }
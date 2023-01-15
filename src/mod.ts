import { DependencyContainer } from "tsyringe";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { SaveServer } from "@spt-aki/servers/SaveServer";
import config from "../config.json";
import http from "http";
import fs from "fs";

class DebugTools implements IPostAkiLoadMod 
{
    public port = config.port || 8080;
    public postAkiLoad(container: DependencyContainer): void 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const saveServer: SaveServer = container.resolve<SaveServer>("SaveServer");
        http.createServer(function (req, res) 
        {
            console.log(req.url);
            if (req.url === "/debugtools") 
            {
                res.writeHead(200, { "Content-type": "text/html" });
                const html = fs.readFileSync(__dirname + "/html/index.html");
                res.write(html);
                res.end();
            }
            else if (req.url.indexOf(".js") !== -1) 
            {
                res.writeHead(200, { "Content-Type": "text/javascript" });
                const js = fs.readFileSync(__dirname + "/html/" + req.url);
                res.write(js);
                res.end();
            }
            else 
            {
                res.statusCode = 404;
                res.setHeader("Content-type", "text/html");
                const html = fs.readFileSync(__dirname + "/html/notfound.html");
                res.write(html);
                res.end();
            }
            // saveServer.addBeforeSaveCallback("debugTools", (profile) => 
            // {
            //     // do stuff with profile 
            //     // return
            //     return profile;
            // })
        }).listen(this.port);

        // logger.info(`hello from the mod: ${saveServer.getProfiles()}`);
    }
}

module.exports = { mod: new DebugTools() }
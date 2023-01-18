
import http from "http";
import fs from "fs";

function returnDashboard(res: http.ServerResponse<http.IncomingMessage>): void 
{
    res.writeHead(200, { "Content-type": "text/html" });
    const html = fs.readFileSync(__dirname + "/html/index.html");
    res.write(html);
    res.end();
}

function returnJavascript(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): void 
{
    res.writeHead(200, { "Content-Type": "text/javascript" });
    const js = fs.readFileSync(__dirname + "/html/" + req.url);
    res.write(js);
    res.end();
}

function returnIcon(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>): void 
{
    res.writeHead(200, { "Content-type": "image/x-icon" });
    const icon = fs.readFileSync(__dirname + "/html/" + req.url);
    res.write(icon);
    res.end();
}

function returnNotFound(res: http.ServerResponse<http.IncomingMessage>): void 
{
    res.writeHead(404, { "Content-type": "text/html" });
    const html = fs.readFileSync(__dirname + "/html/notfound.html");
    res.write(html);
    res.end();
}

export default {
    returnDashboard,
    returnJavascript,
    returnIcon,
    returnNotFound
}
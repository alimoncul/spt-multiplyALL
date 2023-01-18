import http from "http";

function returnNotFound(res: http.ServerResponse<http.IncomingMessage>): void 
{
    res.writeHead(404, {"Content-type": "application/json"});
    res.write(JSON.stringify({ error: true }));
    res.end();
}

function addMoney(res: http.ServerResponse<http.IncomingMessage>): void
{
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ success: false }));
    res.end();
}

function error(res: http.ServerResponse<http.IncomingMessage>, error: string): void
{
    res.writeHead(500, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ success: false, error }));
    res.end();
}

export default {
    returnNotFound,
    addMoney,
    error
}
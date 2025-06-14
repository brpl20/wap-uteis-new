app.get('/getStatus', async function (req, res) {
    var estado = await client.getState();
    res.statusCode = 200;
    res.end('{"Sucesso":"true","estado": ' + JSON.stringify(estado) + '}');
});
var cc          = require('config-multipaas'),
    restify     = require('restify'),
    fs          = require('fs')

var config      = cc(),
    app         = restify.createServer()

app.use(restify.plugins.queryParser());
//app.use(restify.CORS({origins:'http://localhost/', credentials: false, headers: ['Accept']}));
app.use(restify.plugins.fullResponse());

// Routes
app.get('/status', function (req, res, next)
{
  res.send("{status: 'ok'}");
});

app.get('/', function (req, res, next)
{
  var data = fs.readFileSync(__dirname + '/index.html');
  res.status(200);
  res.header('Content-Type', 'text/html');
  res.end(data.toString().replace(/host:port/g, req.header('Host')));
});

app.get(/\/(css|js|img)\/?.*/, restify.plugins.serveStatic({directory: './static/'}));

app.listen(config.get('PORT'), config.get('IP'), function () {
  console.log( "Listening on " + config.get('IP') + ", port " + config.get('PORT') )
});

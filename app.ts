import { json, urlencoded } from 'body-parser';
import * as express from 'express';
import * as morgan from 'morgan';
import * as Sentry from '@sentry/node';

// Sentry.init({ dsn: 'sentryUrl', environment: process.env.envType, enabled: !!process.env.envType });

const addRequestId = require('express-request-id')();

const port = process.env.PORT || 3053;

//  **** Express default Configuration **** //
const app: express.Application = express();

app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);

app.use(json({ limit: '500mb' }));
app.use(urlencoded({ limit: '500mb', extended: true }));
app.use(addRequestId);


// **** Morgan Tokens ***** //

morgan.token('id', function getId(req: any) {
    return req.id;
});

morgan.token('serviceName', function getServiceName(req: any) {
    let serviceName = req.headers['service-name'] || 'unknown-service';
    return serviceName.toUpperCase();
});

const loggerFormat = ':serviceName :id :method :url :status :res[content-length] - :response-time ms';

app.use(morgan(loggerFormat));


// ****** API Routes ***** //
import { EmailRoute } from './routes/emailRoute';
import { GreetingRoute } from './routes/greetingRoute';


app.use('/api/v1/email', EmailRoute);
app.use('/api/v1/greeting', GreetingRoute);

// ****** message Routes ***** //
require('./routes/messageRoute');


// ****** Health Check ***** //

app.get('/', function (req, res) {
    res.send('Notifications API Health check');
})


// ****** Error Handling ***** //
app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

app.use((err: any, req: express.Request, res: any, next: express.NextFunction) => {

    if (res.headersSent) return;

    if (!err.statusCode) {
        res.status(err.status || 500);
    }

    res.json({ message: err.message, sentryId: res.sentry });
});


// ***** Server Execution **** //
app.listen(port);
console.log('Magic happens on port ' + port);
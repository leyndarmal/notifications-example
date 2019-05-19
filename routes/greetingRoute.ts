import { Router, Request, Response, NextFunction } from 'express';
import { GreetingService } from '../services/greetingService';

const GreetingRoute: Router = Router();

GreetingRoute.post('/greet', async (req: Request, res: Response, next: NextFunction) => {

    const options = req.body;
    const promises = [];

    try {
        
        promises.push(GreetingService.sendWelcomeEmail(options));
        if (options.phoneNumber) {
            promises.push(GreetingService.sendWelcomeSMS(options))
        }
        const answer = await Promise.all(promises);

        res.json(answer);

    } catch (err) {
        next(err);
    }
});

export { GreetingRoute };

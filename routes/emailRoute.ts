import { Router, Request, Response, NextFunction } from 'express';
import { EmailService } from '../services/emailService';

const EmailRoute: Router = Router();


EmailRoute.post('/sendEmail', async (req: Request, res: Response, next: NextFunction) => {

    let { templateName, userId, options } = req.body;

    try {

        let answer = await EmailService.sendEmail(templateName, userId, options);
        res.json(answer);

    } catch (err) {

        next(err);
    }
});

export { EmailRoute };

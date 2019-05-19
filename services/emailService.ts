import { models } from 'database/database';
import { SubstitutionUtil } from '../utils/substitutionUtil';
import { TemplateDeciderUtil } from '../utils/templateDeciderUtil';
import * as mailgun from 'mailgun-js';
import * as RandomService from 'infra/services/randomService';
import { Configurator } from '../config/configurator';

export module EmailService {

    const DEFAULT_EMAIL_SENDER = 'default@email.sender';
    const DEFAULT_NAME_EMAIL_SENDER = 'DEFAULT NAME';
    const configurator = new Configurator();
    const mailgunClient = mailgun(configurator.getMailgunConfig());


    export const sendToMailGun = async (email) => {
        return mailgunClient.messages().send(email)
    }

    export const loadEmailReceiverAndSenderDefault = (email) => {

        const isDefault = true;
        const emailReceiver = email;
        const emailSender = DEFAULT_EMAIL_SENDER;
        const nameEmailSender = DEFAULT_NAME_EMAIL_SENDER;

        return { isDefault, emailReceiver, emailSender, nameEmailSender }

    }

    export const saveEmailSendingLog = async (templateName, emailDetails, providerId, userId) => {
        let companyId;
        let user = await models.User.findOne({ _id: userId })
            .select({ userOrg: 1 })
            .lean()
            .exec();

        if (user) {
            companyId = user.userOrg
        }

        return new models.EmailSendingLog({

            to: [emailDetails.to],
            cc: emailDetails.cc ? [emailDetails.cc] : undefined,
            bcc: emailDetails.bcc,
            fromEmail: emailDetails.from,
            templateName: templateName,
            html: emailDetails.html,
            subject: emailDetails.subject,
            providerId: providerId,
            userId: userId,
            companyId: companyId

        }).saveIncremented()
    }

    export const getUserIds = async (userId, searchId, templateName, options) => {

        let userIds = [];

        if (!userId && !searchId) {
            throw new Error('');
        }

        if (!userId) {
            return RandomService.getSomething();
        }

        if (Array.isArray(userId)) {

            userIds = userId;

        } else {
            userIds.push(userId);
        }

        return userIds;
    }

    export const sendingEmailByUserId = async (templateName, userId, options) => {

        options.userId = userId;

        templateName = await TemplateDeciderUtil.getCorrectTemplate(templateName, options)

        let isEmailBlocked = await EmailService.checkIfEmailBlocked(userId, templateName);

        if (isEmailBlocked) {
            return { succeeded: true, sent: false, message: 'Email Blocked, skipping', userId };
        }

        let emailConfig = await EmailService.getEmailConfig(templateName);
        let substitutions = await EmailService.loadSubstitutionsAndTemplateId(emailConfig, templateName, options);
        let emailReceiverAndSender = await EmailService.loadEmailReceiverAndSender(userId, options);
        let email = EmailService.buildEmail(emailConfig, substitutions, emailReceiverAndSender);
        let sendEmailRes = await EmailService.sendToMailGun(email);
        await EmailService.saveEmailSendingLog(templateName, email, sendEmailRes.id, userId);
        return { succeeded: true, sent: true, message: '', userId };
    }


    export const sendEmail = async (templateName, userId, options: any = {}) => {

        let errors = [];
        let reports = [];

        let promises = [];

        let userIds = await EmailService.getUserIds(userId, options.searchId, templateName, options);

        userIds.forEach(async (currentUserId) => {

            promises.push(new Promise(async (resolve, reject) => {

                try {
                    let cloneOptions = JSON.parse(JSON.stringify(options))
                    let report = await EmailService.sendingEmailByUserId(templateName, currentUserId, cloneOptions);
                    reports.push(report);

                } catch (err) {
                    errors.push(err.message);
                }

                resolve();
            }))
        })

        await Promise.all(promises);

        return { reports, errors };
    }

    export const checkIfEmailBlocked = async (userId, templateName) => {

        //checking logic 
        return false;
    }

    export const getEmailConfig = async (templateName) => {
        return await models.EmailTypes.findOne({ type: templateName })
            .lean()
            .exec();
    }

    export const buildEmail = (emailConfig, substitutions, emailReceiverAndSender): any => {
        let subject = emailConfig.subject || '';

        Object.keys(substitutions).forEach(key => {
            subject = subject.replace(new RegExp(`%${key}%`, 'g'), substitutions[key]);
            emailConfig.html = emailConfig.html.replace(new RegExp(`%${key}%`, 'g'), substitutions[key]);
        });

        return {
            to: emailReceiverAndSender.emailReceiver,
            from: `${emailReceiverAndSender.nameEmailSender} <${emailReceiverAndSender.emailSender}>`,
            subject: subject,
            bcc: [],
            html: emailConfig.html
        }
    }

    export const loadEmailReceiverAndSender = async (userId, options) => {

        let emailSender = DEFAULT_EMAIL_SENDER;
        let nameEmailSender = DEFAULT_NAME_EMAIL_SENDER;
        let isDefault = true;
        let emailReceiver;

        if (options.sendTo) {

            emailReceiver = options.sendTo;
            return { emailSender, nameEmailSender, isDefault, emailReceiver };
        }

        let { email, userOrg } = await models.Users.findOne({ _id: userId })
            .select('email')
            .exec();

        emailReceiver = email;
        return { emailSender, nameEmailSender, isDefault, emailReceiver };
    }

    export const loadSubstitutionsAndTemplateId = async (emailConfig, templateName, options) => {

        let substitutionsHash = {};
        let promises = [];

        emailConfig.params.forEach(param => {

            promises.push(SubstitutionUtil.loadSubstitutionByConfig(param, templateName, options)
                .then(substitutions => {
                    substitutionsHash[substitutions.templateKey] = substitutions.templateValue
                }))
        })

        await Promise.all(promises)
        return substitutionsHash
    }
}
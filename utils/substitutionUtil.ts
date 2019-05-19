import { models } from 'database/database';
import * as objectPath from 'object-path';
import { Configurator } from '../config/configurator';
import * as moment from 'moment';


var titleCase = require('title-case');
const configurator = new Configurator();

export module SubstitutionUtil {


    const NOTIFICATION = 'Notification';
 
    const getDate = (startDate, endDate) => {

        if (!startDate && !endDate) {
            return ' ';
        } else if (startDate && !endDate) {
            let startDateToShow = new Date(startDate);
            return moment(startDateToShow).format('MMMM YYYY');
        } else if (!startDate && endDate) {
            let endDateToShow = new Date(endDate);
            return moment(endDateToShow).format('MMMM YYYY');
        } else {
            let startDateToShow = new Date(startDate);
            let endDateToShow = new Date(endDate);
            if (moment(startDateToShow).format('MMMM YYYY') === moment(endDateToShow).format('MMMM YYYY')) {
                return moment(startDateToShow).format('MMMM YYYY');
            }
            return moment(startDateToShow).format('MMMM YYYY') + ' - ' + moment(endDateToShow).format('MMMM YYYY');
        }
    }

    const buildCaseOneString = async (config, options) => {
        return 'caseOneComplexStrin';
    }


    const getMonth = () => {
        return new Date().toLocaleString('en-us', { month: 'long' });
    }

    const getYear = () => {
        return new Date().getFullYear();
    }


    const buildCaseOneSubString = (dataElement) => {
        let newsTemplate = configurator.getEmailTemplates();
        let keysToReplace = {
            '%url%': 'url',
            '%name%': 'name',
            '%author%': 'author'
        }

        for (let templateKey in keysToReplace) {
            newsTemplate = newsTemplate.replace(templateKey, dataElement[keysToReplace[templateKey]] || '');
        }
        return newsTemplate;

    }

    const buildEntityName = async (options) => {

        let entityNameStr = '';

        let { entity, entityType } = await models.entity.findOne({ _id: options.entityId })
            .select('entityType')
            .lean()
            .exec();

        if (entity.name.prefix) {
            entityNameStr += `${entity.name.prefix} `;
        }

        if (entity.name.suffix) {
            entityNameStr += ` ${entity.name.suffix}`;
        }

        return entityNameStr;
    }

    export const loadSubstitutionByConfig = async (config, templateName, options) => {

        let val;

        switch (config.enum) {

            case 'CASE_ONE': {
                val = await buildCaseOneString(config, options);
                break;
            }


            case 'MONTH': {
                val = getMonth();
                break;
            }

            case 'YEAR': {
                val = getYear();
                break;
            }

            default:
                break;
        }

        return { templateKey: config.templateKey, templateValue: val }
    }
}
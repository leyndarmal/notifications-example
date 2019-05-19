import { models } from 'database/database';
import { SubstitutionUtil } from '../utils/substitutionUtil';
import { EmailsTypeEnum } from 'database/enums/enums';

export module TemplateDeciderUtil {

    const getSummaryTemplate = async (options) => {

        let case1 = {};
        let case2= {};

        if (case1 === 0 && case2 === 0) {
            return EmailsTypeEnum.CASE_ONE;
        }

        return EmailsTypeEnum.CASE_TWO;
    }

    export const getCorrectTemplate = async (templateName, options) => {

        if (templateName) return templateName;

        if (!options.templateGroup) {
            throw new Error('');
        }

        let templateToBeUsed;

        switch (options.templateGroup) {
            
            case 'SUMMARY': {
                templateToBeUsed = await getSummaryTemplate(options)
                break;
            }

            default: {
                break;
            }
        }
        return templateToBeUsed
    }


}
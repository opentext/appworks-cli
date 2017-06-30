import {AWCliAction} from './index';

export class AWCliArgumentParser {

    static parse(args): AWCliAction {
        return AWCliAction.Help;
    }

}
import {Body, Controller, Get, Post} from '@nestjs/common';
import {FirebaseAdmin, InjectFirebaseAdmin} from "nestjs-firebase";

@Controller('monitor')
export class MonitorController {
    constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) {
    }

    @Post()
    create(@Body() body): Promise<any> {
        // The message is a unicode string encoded in base64.
        const message = JSON.parse(Buffer.from(body.message.data, 'base64').toString(
            'utf-8'
        ));
        if (message.type === 'inscription') {
            return this.firebase.firestore.collection('intances').doc(message.instance).set({...message, timestampRegister: new Date(), time: new Date(message.time),status: 'active'});
        } else if (message.type === 'shutdown') {
            const instance = this.firebase.firestore.collection('intances').doc(message.instance);
            return instance.update({status: 'down'});
        } else {
            return this.firebase.firestore.collection('monitor').add({...message, timestampRegister: new Date(), time: new Date(message.time)});
        }
    }

}

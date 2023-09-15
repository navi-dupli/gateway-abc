import {Body, Controller, Get, Post} from '@nestjs/common';
import {FirebaseAdmin, InjectFirebaseAdmin} from "nestjs-firebase";

@Controller('monitor')
export class MonitorController {
    constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) {
    }

    @Post()
    create(@Body() data): Promise<any> {
        return this.firebase.firestore.collection('monitor').add({...data, timestamp: Date.now()});
    }

}

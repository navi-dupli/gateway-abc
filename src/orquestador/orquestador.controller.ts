import {Body, Controller, Get, Post} from '@nestjs/common';
import {FirebaseAdmin, InjectFirebaseAdmin} from "nestjs-firebase";

@Controller('orquestador')
export class OrquestadorController {
    constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) {
    }

    @Get('evaluate-service')
    async create() {
        const serviceRef = this.firebase.firestore.collection('services');
        const snapshot = await serviceRef.orderBy('timestampRegister', 'desc').get();
        const data = snapshot.docs.map((doc) => doc.data());
        let response = {
            status: ''
        }
        if (data[0].availability >  0.9) {
            response.status = 'Servicio en funcionamiento'
        } else if (data[0].availability > 0.7) {
            response.status = 'El servicio esta presentando intermitencia'
        } else {
            response.status = 'El servicio se encuentra indisponible, por favor intente mas tarde'
        }

        return response;
    }

}

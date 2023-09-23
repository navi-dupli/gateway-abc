import {Injectable} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {FirebaseAdmin, InjectFirebaseAdmin} from "nestjs-firebase";

@Injectable()
export class MonitorTask {
    constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) {
    }
    @Cron('*/30 * * * * *')
    async handleCron() {
        const instancesRef = this.firebase.firestore.collection('intances');
        const serviceRef = this.firebase.firestore.collection('services');
        const snapshot = await instancesRef.where('status', "==", 'active').orderBy('timestampRegister', 'desc').limit(10).get();
        const docs = snapshot.docs.map(async (doc) => {
            const instanceData = doc.data();
            const health = await this.getStatusInstance(instanceData.instance);
            await instancesRef.doc(doc.id).update({
                health: health.disponibility, instance: instanceData.instance, timestampRegister: new Date()
            });
            return health;
        });
        const results = await Promise.all(docs);
        const disponibility = results.reduce((a, b) => a + b.disponibility, 0) / results.length;
        if (disponibility) {
            const service = await serviceRef.add({service: 'micro-evaluaciones', disponibility, timestampRegister: Date.now()});
        } else {
            const service = await serviceRef.orderBy('timestampRegister', 'desc').limit(1).get();
            if (!service.empty) {
                const serviceData = service.docs[0].data();
                if (serviceData.disponibility > -1) {
                    await serviceRef.add({service: 'micro-evaluaciones', disponibility: -1, timestampRegister: new Date()});
                }
            }
        }
    }
    async getStatusInstance(instance: any) {
        const healthRef = this.firebase.firestore.collection('monitor');
        const snapshot = await healthRef.where('instance', "==", instance).orderBy('timestampRegister', 'desc').limit(10).where('health', '==', 'down').get();
        const data = snapshot.docs.map((doc) => doc.data());
        const instanceDisponibility = 10 - (snapshot.size / 10);
        if (instanceDisponibility > 0.9) {
            return { disponibility: 1, data};
        } else if (instanceDisponibility > 0.7) {
            return { disponibility: 0, data};
        } else {
            return { disponibility: -1, data};
        }
    }

}
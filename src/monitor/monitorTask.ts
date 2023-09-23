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
        const snapshot = await instancesRef.where('status', "==", 'active').get();
        if (snapshot.size) {
            const docs = snapshot.docs.map(async (doc) => {
                const instanceData = doc.data();
                const health = await this.getStatusInstance(instanceData.instance);
                await instancesRef.doc(doc.id).update({
                    health: health.availability, instance: instanceData.instance, timestampRegister: new Date()
                });
                return health;
            });
            const results = await Promise.all(docs);
            let availability = results.reduce((a, b) => a + b.availability, 0);
            console.log('eval==========>',availability, results.length)
            if (availability == 0) {
                await serviceRef.add({service: 'micro-evaluaciones', availability: 0, timestampRegister: new Date(), healthData: results});
            } else if (availability < 0) {
                await serviceRef.add({service: 'micro-evaluaciones', availability: -1, timestampRegister: new Date(), healthData: results});
            } else{
                availability = availability/ results.length;
                if (availability > 0.9) {
                    await serviceRef.add({service: 'micro-evaluaciones', availability: 1, timestampRegister: new Date(), healthData: results});
                } else if (availability > 0.7) {
                    await serviceRef.add({service: 'micro-evaluaciones', availability: 0, timestampRegister: new Date(), healthData: results});
                } else {
                    await serviceRef.add({service: 'micro-evaluaciones', availability: -1, timestampRegister: new Date(), healthData: results});
                }
            }
        }
    }
    async getStatusInstance(instance: any) {
        const healthRef = this.firebase.firestore.collection('monitor');
        const snapshot = await healthRef.where('instance', "==", instance).orderBy('timestampRegister', 'desc').limit(10).where('health', '==', 'down').get();
        const data = snapshot.docs.map((doc) => doc.data());
        const instanceAvailability = 1 - (snapshot.size / 10);
        if (instanceAvailability > 0.9) {
            return { availability: 1, data};
        } else if (instanceAvailability > 0.7) {
            return { availability: 0, data};
        } else {
            return { availability: -1, data};
        }
    }

}
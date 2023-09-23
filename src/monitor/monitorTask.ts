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
            const initDate = new Date(Date.now() - 100000);
            const endDate = new Date();
            const docs = snapshot.docs.map(async (doc) => {
                const instanceData = doc.data();
                const health = await this.getStatusInstance(instanceData.instance, initDate, endDate);
                await instancesRef.doc(doc.id).update({
                    health: health.availability
                });
                return health;
            });
            const results = await Promise.all(docs);
            let availability = results.reduce((a, b) => a + b.availability, 0);
            console.log('eval==========>',availability, results.length)
            if (availability == 0) {
                await serviceRef.add({service: 'micro-evaluaciones', availability: 0, timestampRegister: new Date(), healthData: results, initDate, endDate});
            } else if (availability < 0) {
                await serviceRef.add({service: 'micro-evaluaciones', availability: -1, timestampRegister: new Date(), healthData: results, initDate, endDate});
            } else{
                availability = availability/ results.length;
                if (availability > 0.9) {
                    await serviceRef.add({service: 'micro-evaluaciones', availability: 1, timestampRegister: new Date(), healthData: results, initDate, endDate});
                } else if (availability > 0.7) {
                    await serviceRef.add({service: 'micro-evaluaciones', availability: 0, timestampRegister: new Date(), healthData: results, initDate, endDate});
                } else {
                    await serviceRef.add({service: 'micro-evaluaciones', availability: -1, timestampRegister: new Date(), healthData: results, initDate, endDate});
                }
            }
        }
    }
    async getStatusInstance(instance: any, initDate, endDate) {
        const healthRef = this.firebase.firestore.collection('monitor');
        const snapshot = await healthRef.where('instance', "==", instance).orderBy('timestampRegister', 'desc').where('timestampRegister', '>', initDate).where('timestampRegister', '<', endDate).get();
        const data = snapshot.docs.map((doc) => doc.data());
        const errorHealth = data.filter((item) => item.type === 'error');
        const instanceAvailability = 1 - (errorHealth.length / data.length);
        if (instanceAvailability > 0.9) {
            return { availability: 1, data};
        } else if (instanceAvailability > 0.7) {
            return { availability: 0, data};
        } else {
            return { availability: -1, data};
        }
    }

}
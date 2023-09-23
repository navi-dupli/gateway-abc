import {Injectable} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {FirebaseAdmin, InjectFirebaseAdmin} from "nestjs-firebase";

@Injectable()
export class MonitorTask {
    constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) {
    }
    @Cron('*/15 * * * * *')
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
            let availability = results.reduce((a, b) => a + b.availability, 0)/results.length;

            await serviceRef.add({service: 'micro-evaluaciones', availability, timestampRegister: new Date(), healthData: results, initDate, endDate});
        }
    }
    async getStatusInstance(instance: any, initDate, endDate) {
        const healthRef = this.firebase.firestore.collection('monitor');
        const snapshot = await healthRef.where('instance', "==", instance).where('time', '>', initDate).where('time', '<', endDate).get();
        const data = snapshot.docs.map((doc) => doc.data());
        console.log(data, initDate, endDate, instance)
        const errorHealth = data.filter((item) => item.health === 'down');
        console.log(data.length, errorHealth.length)
        const instanceAvailability = (data.length - errorHealth.length) / data.length;
        return { availability: instanceAvailability, data};
    }

}
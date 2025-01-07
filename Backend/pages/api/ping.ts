import '@/utils/firebase';
import { deploymentUrl } from '@/utils/deploy_url';
import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const db = getFirestore();
const backendsRef = db.collection("backends");
const backendData = {
  url: deploymentUrl,
  lastDeploy: Timestamp.fromDate(new Date()),
  online: deploymentUrl.includes("localhost") ? false : true
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const Online = [];
    try {
        // Fetch all backends from Firestore
        const snapshot = await backendsRef.get();
    
        if (!(snapshot.size == 0)) {
          for (const doc of snapshot.docs) {
    
            const backend = doc.data();
            let url = backend.url;
            if (url === deploymentUrl) continue; //skip current server
            else if (!(url.includes("http"))){
                url = "https://" + url;
            }
    
            try {
              // Call the backend's `/api/online` endpoint
              const response = await fetch(`${url}/api/online`);
    
              if (response.status === 200) {
                console.log(`Online: ${url}`);
                Online.push(url);
              } else {
                console.log(`Backend not responding with 200: ${url}`);
                await backendsRef.doc(doc.id).update({ online: false }); // update status of that x backend to offline
              }
            } catch (err) {
              console.log(`Error connecting to backend: ${url}`, err);
              await backendsRef.doc(doc.id).update({ online: false });
            }
          }
        }
    
        await backendsRef.doc(encodeURIComponent(deploymentUrl)).set(backendData); //add current server in online list
        Online.push(deploymentUrl);
      } catch (err) {
        console.error("Error fetching backends from Firestore:", err);
      }

    return res.status(200).json({ ok: true, url: deploymentUrl, other: Online });
}

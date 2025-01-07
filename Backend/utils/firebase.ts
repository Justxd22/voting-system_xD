import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// set deployment url
export const deploymentUrl =
  process.env.VOTEBE_URL ||       // set this for custom url
  process.env.VERCEL_URL ||       // Vercel
  process.env.URL ||              // Netlify (main domain)
  "http://localhost:3000";        // Local development fallback

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  const db = getFirestore();
  const backendsRef = db.collection("backends");

  const backendData = {
    url: deploymentUrl,
    lastDeploy: Timestamp.fromDate(new Date()),
    online: deploymentUrl.includes("localhost") ? false : true
  };

  async function validateBackends() {
    try {
      // Fetch all backends from Firestore
      const snapshot = await backendsRef.get();

      if (!(snapshot.size == 0)) {
        for (const doc of snapshot.docs) {

          const backend = doc.data();
          const url = backend.url;
          if (url === deploymentUrl) continue; //skip current server

          try {
            // Call the backend's `/api/online` endpoint
            const response = await fetch(`${url}/api/online`);

            if (response.status === 200) {
              console.log(`Online: ${url}`);
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

    } catch (err) {
      console.error("Error fetching backends from Firestore:", err);
    }
  }

  validateBackends();

}


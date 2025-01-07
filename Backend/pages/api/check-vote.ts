import '../../utils/firebase';
import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

const sessionsRef = db.collection("sessions");
const cooldownDate = 3 * 24 * 60 * 60 * 1000;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.voteToken;
  
  if (!token) {
    return res.status(200).json({ hasVoted: false });
  }

  try {

    const existingSessionRef = sessionsRef.doc(token);
    const recentVoteDocSession = await existingSessionRef.get();

    if (recentVoteDocSession.exists) {
      const recentVote = recentVoteDocSession.data();

      if (!(Date.now() - recentVote?.votedAt.toDate().getTime() > cooldownDate)){
        return res.status(200).json({ hasVoted: true });
      }
    }
    return res.status(200).json({ hasVoted: false });
  } catch (err) {
    console.error("Error checking vote session:", err);
    return res.status(500).json({ message: "Error checking vote session" });
  }
}

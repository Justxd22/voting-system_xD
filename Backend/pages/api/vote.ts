import '../../utils/firebase';
import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { generateToken } from "../../utils/token";
import { hashIP } from "../../utils/ip";

// Initialize Firestore
const db = getFirestore();

// Define collection references
const sessionsRef = db.collection("sessions");
const votesRef = db.collection("votes");
const resultsRef = db.collection("results");
const cooldownDate = 3 * 24 * 60 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.cookies.voteToken;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const ipHash = hashIP(ip as string);

  // Debug IP information
  console.log('Debug - IP Hash:', ipHash);
  console.log('Debug - Original IP:', ip);

  try {
    let sessionToken: string;
    let isNewSession = false;
    
    console.log('Debug - Checking Cookie Vote');
    // Check if cookie is voted
    if (token) {

      const existingSessionRef = sessionsRef.doc(token);
      const recentVoteDocSession = await existingSessionRef.get();

      if (recentVoteDocSession.exists) {
        const recentVote = recentVoteDocSession.data();

        if (!(Date.now() - recentVote?.votedAt.toDate().getTime() > cooldownDate)){
          const cooldownRemaining = Math.ceil(
            (recentVote?.votedAt.toDate().getTime() + 3 * 24 * 60 * 60 * 1000 - Date.now()) / (60 * 1000)
          );
          return res.status(400).json({
            message: "A vote has already been cast from this browser recently. Please try again later.",
            cooldownRemaining,
          });
        }
      }
      sessionToken = token;
    } else {
      sessionToken = generateToken();
      isNewSession = true;
      setTokenCookie(res, sessionToken);
    }



    console.log('Debug - Checking IP cooldown');

    const recentVoteRef = votesRef.doc(ipHash);
    const recentVoteDoc = await recentVoteRef.get();
    
    if (recentVoteDoc.exists) {
      const recentVote = recentVoteDoc.data();
      
      // Check if the vote was within the cooldown period
      if (!(Date.now() - recentVote?.votedAt.toDate().getTime() > cooldownDate)) {
        const cooldownRemaining = Math.ceil(
          (recentVote?.votedAt.toDate().getTime() + 3 * 24 * 60 * 60 * 1000 - Date.now()) / (60 * 1000)
        );
        return res.status(400).json({
          message: "A vote has already been cast from this location recently. Please try again later.",
          cooldownRemaining,
        });
      }
    }



    const { option } = req.body;

    // Validate option
    if (!option || typeof option !== 'string') { // TO:DO and check if that is indeed a votable option
      return res.status(400).json({ message: "Invalid option provided" });
    }

    try {
      // Step 1: Record the vote
      const voteData = {
        sessionToken,
        ipHash,
        option,
        votedAt: Timestamp.fromDate(new Date())
      };

      await votesRef.doc(ipHash).set(voteData, { merge: true });
      await sessionsRef.doc(sessionToken).set(voteData, { merge: true });

      // Step 2: Update the results counter
      const resultRef = resultsRef.doc(option);

      // Get the current document for this option
      const resultDoc = await resultRef.get();

      if (resultDoc.exists) {
        const currentData = resultDoc.data();
        await resultRef.update({
          count: (currentData?.count || 0) + 1
        });
      } else {
        await resultRef.set({
          option,
          count: 1
        });
      }

      console.log('Vote recorded successfully');

      return res.status(200).json({
        message: "Vote recorded successfully",
        isNewSession,
      });
    } catch (innerError) {
      console.error('Inner operation error:', innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Voting error:", error);
    return res.status(500).json({
      message: "Error recording vote",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

function setTokenCookie(res: NextApiResponse, token: string) {
  res.setHeader(
    "Set-Cookie",
    `voteToken=${token}; Path=/; HttpOnly; Max-Age=${3 * 24 * 60 * 60}; SameSite=Strict`
  );
}

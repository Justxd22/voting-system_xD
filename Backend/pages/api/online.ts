import '@/utils/firebase';
import { deploymentUrl } from '@/utils/deploy_url';
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return res.status(200).json({ ok: true, url: deploymentUrl });
}

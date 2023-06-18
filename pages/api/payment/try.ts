import { NextApiRequest, NextApiResponse } from 'next';

import { SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY } from '@/utils/app/const';

import { createClient } from '@supabase/supabase-js';

const SUPABASE = createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_SERVICE_KEY,
);

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  let uid = req.body;

  if (!uid) {
    res.status(500);
    return res.send('Error');
  }

  let { data, error } = await SUPABASE.from('user').select('*').eq('id', uid);

  console.log((data || [{}])[0]['has_tried']);

  if ((data || [{}])[0]['has_tried']) {
    res.status(500);
    return res.send('Error');
  }

  await SUPABASE.from('user').update({ has_tried: true }).eq('id', uid);
  await SUPABASE.from('billing').delete().eq('user_id', uid);

  await SUPABASE.from('billing').insert({
    user_id: uid,
    type: 1,
  });

  res.status(500);
  return res.send('Success');
};

export default handler;

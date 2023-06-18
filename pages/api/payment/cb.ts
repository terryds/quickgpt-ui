import { NextApiRequest, NextApiResponse } from 'next';

import { SUPABASE_PROJECT_URL, SUPABASE_CLIENT_KEY } from '@/utils/app/const';

import { createClient } from '@supabase/supabase-js';

const SUPABASE = createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_CLIENT_KEY,
);

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  console.log(req.method);

  let type = req.body['type'];
  let metadata = req.body['data']['object']['metadata'];

  let user_id = metadata['user_id'];
  let price_key = metadata['price_key'];

  if (type === 'checkout.session.completed') {
    let { data, error } = await SUPABASE.from('subscription')
      .select()
      .eq('price_key', price_key);

    let subscription = (data || [])[0];

    console.log('New payment completed');
    await SUPABASE.from('billing').delete().eq('user_id', user_id);
    await SUPABASE.from('billing').insert({
      user_id,
      type: subscription['id'],
    });

    res.status(200);
    return res.send('Success');
  }

  res.status(500);
  return res.send('Error');
};

export default handler;

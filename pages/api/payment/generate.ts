import { STRIPE_KEY } from "@/utils/app/const";
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  let body = JSON.parse(req.body);
  let price = body['price'];
  let user_id = body['uid'];
  let callback_url = body['cb'];

  console.log(body);
  console.log({ user_id, price });
  console.log(!user_id);

  if (!price || !user_id || !callback_url) {
    return res.send('Error');
  }

  let urlencoded = new URLSearchParams();
  urlencoded.append('line_items[0][price]', price);
  urlencoded.append('line_items[0][quantity]', '1');
  urlencoded.append('after_completion[type]', "redirect");
  urlencoded.append('after_completion[redirect][url]', callback_url);
  urlencoded.append('metadata[user_id]', user_id);
  urlencoded.append('metadata[price_key]', price);

  let result = await (
    await fetch('https://api.stripe.com/v1/payment_links', {
      headers: {
        Authorization:
          'Bearer ' + STRIPE_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: urlencoded,
    })
  ).json();

  console.log(result);

  let url = result['url'];

  if (!url) {
    res.status(500);
    return res.send('Error');
  }

  res.status(200);
  return res.send(url.replace('https://buy.stripe.com/', ''));
};

export default handler;

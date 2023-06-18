import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  let callback = req.query['cb'];
  console.log(callback);
  
  if (!('access_token' in req.query)) {
    res.writeHead(302, { 'Content-Type': 'text/html' });
    res.write(`
    <script>
        const queryString = window.location.hash.replace('#', '')
        window.location.href = "${callback}?" + queryString;
    </script>
`);
    res.end();
    return;
  }

  console.log(req.query);
  res.status(500);
  res.send('Error');
};

export default handler;

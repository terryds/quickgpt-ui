import { FC, useEffect, useState } from 'react';

import Payment from './Payment';
import { Subscriptions } from './Payment.state';
import Plan from './Plan';

import { SUPABASE } from '@/pages';

export interface Props {
  changingPlan?: boolean;
}

const Subscribe: FC<Props> = ({ changingPlan }) => {
  window.eval(`window.__TAURI__.event.emit("DOMContentLoaded", "login")`);

  window.addEventListener('updateCallbackAddress', (e: any) => {
    (window as any)['callbackURL'] = `http://${e['detail']['url']}/`;
  });

  let [fetchCompleted, setFetchCompleted] = useState(false);
  let [paymentState, setPaymentState] = useState(0);
  let [selectedPlan, setSelectedPlan] = useState(
    {} as unknown as Subscriptions,
  );
  let [subscriptions, setSubscriptions] = useState([
    {} as unknown as Subscriptions,
  ]);

  const fetchSubscription = async () => {
    let { data, error } = await SUPABASE.from('subscription').select();

    setSubscriptions(
      (data as unknown as Subscriptions[]) ||
        ([{}] as unknown as Subscriptions),
    );

    setFetchCompleted(true);
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: '#343541',
        }}
        className="flex flex-col justify-center items-center w-full h-screen"
      >
        {
          {
            0: (
              <>
                <Plan
                  setPaymentState={setPaymentState}
                  setSelectedPlan={setSelectedPlan}
                  subscriptions={subscriptions}
                  changingPlan={changingPlan}
                />
              </>
            ),
            1: (
              <Payment
                setPaymentState={setPaymentState}
                selectedPlan={selectedPlan}
                subscriptions={subscriptions}
              />
            ),
          }[paymentState]
        }
      </div>
    </>
  );
};

export default Subscribe;

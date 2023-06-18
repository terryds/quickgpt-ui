import { FC, useEffect, useState } from 'react';

import Loading from '../Spinner/Loading';
import { Subscriptions } from './Payment.state';

import { SUPABASE } from '@/pages';

interface Props {
  setPaymentState: (state: number) => void;
  setSelectedPlan: (sub: Subscriptions) => void;
  subscriptions: Subscriptions[];
  changingPlan?: boolean;
}

const Plan: FC<Props> = ({
  setPaymentState,
  setSelectedPlan,
  subscriptions,
  changingPlan,
}) => {
  let [renderTrial, setRenderTrial] = useState(false);
  let [requestingTrial, setRequestingTrial] = useState(false);

  useEffect(() => {
    SUPABASE.from('user')
      .select('*')
      .then((r) => {
        setRenderTrial(!(r.data || [{}])[0]['has_tried']);
      });
  }, []);

  const RenderSub = () => {
    return subscriptions
      .sort((a: Subscriptions, b: Subscriptions) => a.price - b.price)
      .map((sub: Subscriptions, index: number) => {
        if (sub.trial) {
          if (!renderTrial) {
            return <></>;
          }

          return (
            <>
              <div className="p-10 w-72 py-6 border-2 border-white rounded-md flex flex-col items-center">
                <h2 className="text-xl font-bold mb-1">{sub.name}</h2>
                <span className="mb-5 flex flex-col items-center h-20">
                  <span className="text-4xl font-bold">Free Trial</span>
                  <span>{sub.duration} Days</span>
                  <small>*No Credit Card Required</small>
                </span>
                {requestingTrial ? (
                  <>
                    <button
                      disabled
                      className="bg-black flex justify-center items-center gap-3 bg-opacity-50 outline-black/50 outline-2 p-3 rounded-md"
                    >
                      Requesting trial
                      <svg
                        id="loading"
                        style={{
                          display: 'block',
                        }}
                        className=""
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
                          opacity=".5"
                        />
                        <path
                          fill="currentColor"
                          d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
                        >
                          <animateTransform
                            attributeName="transform"
                            dur="1s"
                            from="0 12 12"
                            repeatCount="indefinite"
                            to="360 12 12"
                            type="rotate"
                          />
                        </path>
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        setRequestingTrial(true);
                        fetch('/api/payment/try', {
                          method: 'POST',
                          body: (await SUPABASE.auth.getUser()).data.user?.id,
                        }).then(() => {
                          window.eval(
                            `window.__TAURI__.event.emit("refreshPopup")`,
                          );
                          location.reload();
                        });
                      }}
                      className="bg-black bg-opacity-50 outline-black/50 outline-2 p-3 rounded-md hover:bg-opacity-40 active:outline"
                    >
                      Choose this plan
                    </button>
                  </>
                )}
              </div>
            </>
          );
        } else {
          return (
            <>
              <div className="p-10 w-72 py-6 border-2 border-white rounded-md flex flex-col items-center">
                <h2 className="text-xl font-bold mb-1">{sub.name}</h2>
                <span className="mb-5 flex flex-col items-center h-20">
                  <span className="text-4xl font-bold">${sub.price}</span>
                  <span>{sub.duration} Days</span>
                </span>
                <button
                  onClick={() => {
                    setSelectedPlan(sub);
                    setPaymentState(1);
                  }}
                  className="bg-black bg-opacity-50 outline-black/50 outline-2 p-3 rounded-md hover:bg-opacity-40 active:outline"
                >
                  Choose this plan
                </button>
              </div>
            </>
          );
        }
      });
  };

  return (
    <>
      <h1 className="text-5xl font-black mb-3">QuickGPT</h1>
      <div className="text-xl font-bold h-10">Select Your Plan</div>
      <small className="mb-20 flex flex-col text-center">
        {changingPlan || false ? (
          <>
            <span>
              Your existing plan will be overwritten and you will get no refund
            </span>
            <span>
              even when there is still available time in your current plan
            </span>
          </>
        ) : (
          <>
            <span>Restart this app if you have made a payment before</span>
          </>
        )}
      </small>
      <div className="flex gap-5">{RenderSub()}</div>
      <div>
        <button
          onClick={async () => {
            if (changingPlan) {
              window.dispatchEvent(
                new CustomEvent('openPlan', { detail: false }),
              );
            } else {
              await SUPABASE.auth.signOut();
              location.reload();
            }
          }}
          className="bg-black bg-opacity-50 outline-black/50 outline-2 p-3 rounded-md hover:bg-opacity-40 active:outline mt-4"
        >
          {changingPlan || false ? <>Go back</> : <>Logout</>}
        </button>
      </div>
    </>
  );
};

export default Plan;

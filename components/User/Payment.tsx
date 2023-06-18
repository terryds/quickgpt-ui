import { IconBuildingBank, IconCreditCard } from '@tabler/icons-react';
import { FC, useState } from 'react';

import { ENABLE_STRIPE } from '@/utils/app/const';

import { Subscriptions } from './Payment.state';

import { SUPABASE } from '@/pages';

interface Props {
  setPaymentState: (temperature: number) => void;
  selectedPlan: Subscriptions;
  subscriptions: Subscriptions[];
}

const Payment: FC<Props> = ({
  setPaymentState,
  selectedPlan,
  subscriptions,
}) => {
  let [waitingPayment, setWaitingPayment] = useState(false);
  let [loadingState, setLoadingState] = useState(0);

  return (
    <>
      <h1 className="text-5xl font-black mb-3">QuickGPT</h1>
      <div className="text-xl font-bold h-10">Select Payment Method</div>
      <small className="mb-20 flex flex-col items-center">
        <span>
          Don&apos;t make any payment again if you have made a payment before
        </span>
        <span>Instead, restart this app</span>
      </small>
      <div className="mb-5 text-lg h-8">
        <span>
          Purchase{' '}
          <strong>
            {selectedPlan.name} ${selectedPlan.price}
          </strong>
        </span>
      </div>
      <div className="flex gap-5">
        {waitingPayment ? (
          <>
            <div className="flex flex-col items-center h-32">
              {
                {
                  0: (
                    <>
                      <span className="font-bold">Please wait</span>
                      <span>Generating payment link</span>
                    </>
                  ),
                  1: (
                    <>
                      <span className="font-bold">
                        Please check your browser
                      </span>
                      <span>Waiting for user to make a payment</span>
                    </>
                  ),
                }[loadingState]
              }
              <svg
                id="loading"
                style={{
                  display: 'block',
                }}
                className="mt-3"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
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
              {
                {
                  0: <></>,
                  1: (
                    <>
                      <button
                        onClick={() => {
                          window.eval(
                            `window.__TAURI__.event.emit("openStripe", "${
                              (window as any)['stripeLink']
                            }")`,
                          );
                        }}
                        className="mt-3 underline"
                      >
                        Reopen payment link
                      </button>
                    </>
                  ),
                }[loadingState]
              }
            </div>
          </>
        ) : (
          <>
            {ENABLE_STRIPE ? (
              <>
                <button
                  onClick={async () => {
                    setWaitingPayment(true);

                    window.eval(
                      `window.__TAURI__.event.emit("requestPayment")`,
                    );

                    setTimeout(async () => {
                      let uid = (await SUPABASE.auth.getUser()).data.user?.id;

                      let url = await (
                        await fetch('/api/payment/generate', {
                          method: 'POST',
                          body: JSON.stringify({
                            price: selectedPlan.price_key,
                            uid,
                            cb: (window as any)['callbackURL'],
                          }),
                        })
                      ).text();

                      console.log(url);

                      (window as any)['stripeLink'] = url;

                      window.eval(
                        `window.__TAURI__.event.emit("openStripe", "${url}")`,
                      );

                      setLoadingState(1);
                    }, 1000);
                  }}
                  className="hover:bg-black hover:bg-opacity-30 cursor-pointer h-20 w-48 border-2 rounded-md gap-2 flex justify-center items-center"
                >
                  <span className="font-bold">Credit / Debit Card</span>
                  <IconCreditCard width={32} height={32} />
                </button>
              </>
            ) : (
              <></>
            )}
            <button
              onClick={() => {
                window.eval(`window.__TAURI__.event.emit("openBank")`);
              }}
              className="hover:bg-black hover:bg-opacity-30 cursor-pointer h-20 w-48 border-2 rounded-md gap-2 flex justify-center items-center"
            >
              <span className="font-bold">Payment Instruction</span>
              <IconBuildingBank width={32} height={32} />
            </button>
          </>
        )}
      </div>
      {!waitingPayment ? (
        <>
          <button
            onClick={() => {
              setPaymentState(0);
            }}
            className="mt-4 bg-black bg-opacity-50 outline-black/50 outline-2 p-3 rounded-md hover:bg-opacity-40 active:outline"
          >
            Go back
          </button>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Payment;

import { useState } from 'react';

import { SUPABASE } from '@/pages';

const Login = () => {
  const [isWaitingSignIn, setWaitingSignIn] = useState(false);

  window.eval(`window.__TAURI__.event.emit("DOMContentLoaded", "login")`);

  window.addEventListener('updateCallbackAddress', (e: any) => {
    (window as any)['callbackURL'] = `http://${e['detail']['url']}/`;
  });

  window.addEventListener('doneSignIn', (e: any) => {
    let access_token = e.detail['access_token'];
    let refresh_token = e.detail['refresh_token'];
    SUPABASE.auth
      .setSession({
        access_token,
        refresh_token,
      })
      .then(() => {
        location.reload();
      });
  });

  window.addEventListener('listenerTimeout', (e: any) => {
    setWaitingSignIn(false);
  });

  return (
    <>
      <div
        style={{
          backgroundColor: '#343541',
        }}
        className="flex flex-col justify-center items-center w-full h-screen"
      >
        <h1 className="text-5xl font-black mb-3">QuickGPT</h1>
        <div className="text-xl font-bold mb-20">Sign in or register</div>
        <div className="flex flex-col items-center mt-2 h-28">
          {isWaitingSignIn ? (
            <>
              <span className="font-bold">Please check your browser</span>
              <span>Waiting for user to sign in</span>
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
            </>
          ) : (
            <>
              <button
                onClick={async () => {
                  window.eval(`window.__TAURI__.event.emit("requestSignIn")`);

                  setTimeout(async () => {
                    let signin = await SUPABASE.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/api/signin?cb=${
                          (window as any)['callbackURL']
                        }`,
                        skipBrowserRedirect: true,
                      },
                    });

                    setWaitingSignIn(true);

                    window.eval(
                      `window.__TAURI__.event.emit("signIn", "${signin.data.url}")`,
                    );
                  }, 1000);
                }}
                className="p-4 border-white transition-all hover:bg-white hover:bg-opacity-20 border-solid border-[1px] rounded-md flex items-center gap-3"
              >
                <span
                  className="block"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 48 48'%3E%3Cdefs%3E%3Cpath id='a' d='M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z'/%3E%3C/defs%3E%3CclipPath id='b'%3E%3Cuse xlink:href='%23a' overflow='visible'/%3E%3C/clipPath%3E%3Cpath clip-path='url(%23b)' fill='%23FBBC05' d='M0 37V11l17 13z'/%3E%3Cpath clip-path='url(%23b)' fill='%23EA4335' d='M0 11l17 13 7-6.1L48 14V0H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%2334A853' d='M0 37l30-23 7.9 1L48 0v48H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%234285F4' d='M48 48L17 24l-4-3 35-10z'/%3E%3C/svg%3E")`,
                    width: '24px',
                    height: '24px',
                  }}
                ></span>
                <span>Continue with Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;

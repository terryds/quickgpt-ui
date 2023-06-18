import { useEffect, useState } from 'react';

import { SUPABASE } from '@/pages';

const CompleteInformation = () => {
  window.eval(`window.__TAURI__.event.emit("DOMContentLoaded", "login")`);

  let [infoState, setInfoState] = useState(0);

  const completeUserInformation = async (
    first_name: string,
    last_name: string,
    occupation: string,
  ) => {
    let id = (await SUPABASE.auth.getUser()).data.user?.id;
    let result = await SUPABASE.from('user').insert({
      id,
      first_name,
      last_name,
      occupation,
    });

    console.log(result);

    return result;
  };

  let [firstName, setFirstName] = useState('');
  let [lastName, setLastName] = useState('');
  let [occupation, setOccupation] = useState('');

  useEffect(() => {
    SUPABASE.auth.getUser().then((value) => {
      let identity = (value.data.user?.identities || [])[0];
      let identity_data = identity.identity_data || {};
      console.log(identity_data);
      let [first, last] = identity_data['full_name'].split(' ');

      setFirstName(first);
      setLastName(last);
    });
  }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: '#343541',
        }}
        className="flex flex-col justify-center items-center w-full h-screen"
      >
        <h1 className="text-5xl font-black mb-3">QuickGPT</h1>
        <div className="text-xl font-bold mb-20 h-10">
          Complete Your Information
        </div>
        {
          {
            0: (
              <>
                <div className="font-bold mb-2 h-4">Fill in your name</div>
                <form
                  onSubmit={(e) => {
                    setInfoState(infoState + 1);
                    e.preventDefault();
                  }}
                >
                  <div className="flex flex-col gap-3 min-w-[50vw]">
                    <div className="flex gap-3">
                      <input
                        className="p-3 w-1/2 rounded-md text-black"
                        placeholder="First Name"
                        type="text"
                        name="first"
                        id="first_name"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                        }}
                        required
                      />
                      <input
                        className="p-3 w-1/2 rounded-md text-black"
                        placeholder="Last Name"
                        type="text"
                        name="last"
                        id="last_name"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                        }}
                        required
                      />
                    </div>
                    <button className="bg-black bg-opacity-50 outline-black/50 outline-2 p-3 rounded-md hover:bg-opacity-40 active:outline">
                      Confirm
                    </button>
                  </div>
                </form>
              </>
            ),
            1: (
              <>
                <div className="font-bold mb-2 h-4">
                  Fill in your occupation
                </div>
                <form
                  onSubmit={(e) => {
                    completeUserInformation(
                      firstName,
                      lastName,
                      occupation,
                    ).then(() => {
                      location.reload();
                    });
                    e.preventDefault();
                  }}
                >
                  <div className="flex flex-col gap-3 min-w-[50vw]">
                    <div className="flex gap-3">
                      <select
                        placeholder="Select your occupation"
                        className="p-3 w-full value={occupation} rounded-md text-black"
                        name="occupation"
                        id="occupation"
                        value={occupation}
                        onChange={(e) => {
                          setOccupation(e.target.value);
                        }}
                        required
                      >
                        <option value="enterpreneur">Enterpreneur</option>
                        <option value="marketer">Marketer</option>
                        <option value="student">Student</option>
                        <option value="other">Other</option>
                      </select>
                      {/* <input
                        className="p-3 w-full rounded-md text-black"
                        placeholder="Occupation"
                        type="text"
                        name="occupation"
                        id="occupation"
                        value={occupation}
                        onChange={(e) => {
                          setOccupation(e.target.value);
                        }}
                        required
                      /> */}
                    </div>
                    <button className="bg-black bg-opacity-50 outline-black/50 outline-2 p-3 rounded-md hover:bg-opacity-40 active:outline">
                      Confirm
                    </button>
                  </div>
                </form>
              </>
            ),
          }[infoState]
        }
      </div>
    </>
  );
};

export default CompleteInformation;

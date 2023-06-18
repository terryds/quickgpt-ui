import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import {
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
  SUPABASE_CLIENT_KEY,
  SUPABASE_PROJECT_URL,
} from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { savePrompts } from '@/utils/app/prompts';
import { getSettings } from '@/utils/app/settings';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import Login from '@/components/Auth/Login';
import { Chat } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import Promptbar from '@/components/Promptbar';
import Loading from '@/components/Spinner/Loading';
import CompleteInformation from '@/components/User/CompleteInformation';
import Payment from '@/components/User/Payment';
import Plan from '@/components/User/Plan';
import Subscribe from '@/components/User/Subscribe';

import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
}: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = useApiService();
  const { getModelsError } = useErrorService();
  const [initialRender, setInitialRender] = useState<boolean>(true);

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      lightMode,
      folders,
      conversations,
      selectedConversation,
      prompts,
      temperature,
      loggedIn,
      completedInformation,
      subscribed,
      firstName,
      lastName,
    },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);
  let [informationFetchCompleted, setInformationFetchCompleted] =
    useState(false);
  let [loggedInFetchCompleted, setLoggedInFetchCompleted] = useState(false);

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  const handleLoggedIn = () => {
    SUPABASE.auth.getSession().then((d) => {
      if (d.data.session === null) {
        dispatch({ field: 'loggedIn', value: false });
      } else {
        dispatch({ field: 'loggedIn', value: true });
      }
      setLoggedInFetchCompleted(true);
    });
  };

  const handleCompleteInformation = async () => {
    let user = await getUserInformation();
    SUPABASE.auth.getUser().then((value) => {
      let identity = (value.data.user?.identities || [
        { identity_data: { avatar_url: '' } },
      ])[0];
      let identity_data = identity.identity_data || {};
      dispatch({ field: 'avatar', value: identity_data['avatar_url'] });
    });

    dispatch({
      field: 'firstName',
      value: (user || { first_name: '' })['first_name'],
    });
    dispatch({
      field: 'lastName',
      value: (user || { last_name: '' })['last_name'],
    });

    let completedInformation = await hasCompletedInformation();
    dispatch({ field: 'completedInformation', value: completedInformation });

    let subscribed = await hasSubscription();
    dispatch({ field: 'subscribed', value: subscribed });

    setInformationFetchCompleted(true);
  };

  const getUserInformation = async () => {
    let { data, error } = await SUPABASE.from('user').select();
    let user = (data || [])[0];

    return user;
  };

  const getUserSubscription = async () => {
    let { data, error } = await SUPABASE.from('billing').select();
    let billing = (data || [])[0];

    return billing;
  };

  const hasCompletedInformation = async () => {
    return typeof (await getUserInformation()) !== 'undefined';
  };

  const hasSubscription = async () => {
    let sub = await getUserSubscription();
    if (typeof sub === 'undefined') {
      return false;
    }
    let now_date = new Date().getTime();
    let creation_date = new Date(sub['created_at']).getTime();

    let diff = now_date - creation_date;

    let { data } = await SUPABASE.from('subscription')
      .select('*')
      .eq('id', sub['type']);
    let duration = (data || [])[0]['duration'];

    let lim = duration * 86400000;

    if (diff >= lim) {
      return false;
    }

    console.log({ diff, lim, creation_date, duration });
    return typeof sub !== 'undefined';
  };

  let [changingPlan, setChangingPlan] = useState(false);
  let [eventAdded, setEventAdded] = useState(false);

  useEffect(() => {
    handleCompleteInformation();
    console.log(hasSubscription());
    console.log({ completedInformation });
  }, [completedInformation]);

  useEffect(() => {
    window.addEventListener('contextmenu', (event) => event.preventDefault());
    window.addEventListener('openPlan', ({ detail }: any) => {
      dispatch({ field: 'subscribed', value: !detail });
      console.log(subscribed);
      setChangingPlan(true);
    });
  }, []);

  useEffect(() => {
    handleLoggedIn();
    console.log(loggedIn);
  }, [loggedIn]);

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    dispatch({ field: 'conversations', value: updatedConversations });
    saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({ field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    dispatch({ field: 'folders', value: updatedFolders });

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: 'selectedConversation', value: newConversation });
    dispatch({ field: 'conversations', value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ field: 'loading', value: false });
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [selectedConversation]);

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId });
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      });
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    // if (serverSideApiKeyIsSet) {
    //   dispatch({ field: 'apiKey', value: '' });

    //   localStorage.removeItem('apiKey');
    // } else if (apiKey) {
    //   dispatch({ field: 'apiKey', value: apiKey });
    // }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      dispatch({ field: 'pluginKeys', value: [] });
      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      dispatch({ field: 'pluginKeys', value: pluginKeys });
    }

    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
      dispatch({ field: 'showPromptbar', value: false });
    }

    // const showChatbar = localStorage.getItem('showChatbar');
    // if (showChatbar) {
    //   dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    // }

    // const showPromptbar = localStorage.getItem('showPromptbar');
    // if (showPromptbar) {
    //   dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    // }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({ field: 'folders', value: JSON.parse(folders) });
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) });
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      dispatch({ field: 'conversations', value: cleanedConversationHistory });
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );

      dispatch({
        field: 'selectedConversation',
        value: cleanedSelectedConversation,
      });
    } else {
      const lastConversation = conversations[conversations.length - 1];
      dispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation,
      }}
    >
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation ? (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          {informationFetchCompleted && loggedInFetchCompleted ? (
            <>
              {loggedIn ? (
                <>
                  {completedInformation ? (
                    subscribed ? (
                      <>
                        <div className="fixed top-0 w-full sm:hidden">
                          <Navbar
                            selectedConversation={selectedConversation}
                            onNewConversation={handleNewConversation}
                          />
                        </div>
                        <div className="flex h-full w-full pt-[48px] sm:pt-0">
                          <Chatbar />

                          <div className="flex flex-1">
                            <Chat stopConversationRef={stopConversationRef} />
                          </div>

                          <Promptbar />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* <Plan /> */}
                        {/* <Payment /> */}
                        <Subscribe changingPlan={changingPlan} />
                      </>
                    )
                  ) : (
                    <>
                      <CompleteInformation />
                    </>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <Login />
                  </div>
                </>
              )}
            </>
          ) : (
            <Loading />
          )}
        </main>
      ) : (
        <Loading />
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const SUPABASE = createClient(SUPABASE_PROJECT_URL, SUPABASE_CLIENT_KEY);

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};

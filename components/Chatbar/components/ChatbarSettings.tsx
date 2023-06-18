import { IconFileExport, IconLogout, IconSettings } from '@tabler/icons-react';
import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { SettingDialog } from '@/components/Settings/SettingDialog';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';

import { SUPABASE } from '@/pages';
import { SidebarField } from "@/components/Sidebar/SidebarField";
import Image from "next/image";

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);

  const {
    state: { lightMode, serverSidePluginKeysSet, conversations, firstName, avatar },
    dispatch: homeDispatch
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
  } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      {navigator.userAgent === 'POPUP' ? (
        <></>
      ) : (
        <>
          <Import onImport={handleImportConversations} />

          <SidebarButton
            text={t('Export data')}
            icon={<IconFileExport size={18} />}
            onClick={() => handleExportData()}
          />

          <SidebarButton
            text={t('Settings')}
            icon={<IconSettings size={18} />}
            onClick={() => setIsSettingDialog(true)}
          />
          <SidebarButton
            text={t('Log out')}
            icon={<IconLogout size={18} />}
            onClick={() => {
              SUPABASE.auth.signOut().then(() => {
                window.eval(`window.__TAURI__.event.emit("signOut")`);
                location.reload();
              });
            }}
          />
          <SidebarField
            text={`Hello ${firstName}!`}
            icon={<>
              <Image src={avatar} width={24} height={24} className="rounded-md" alt="avatar"/>
            </>}
          />
          <SettingDialog
            open={isSettingDialogOpen}
            onClose={() => {
              setIsSettingDialog(false);
            }}
          />
        </>
      )}

      {/* {!serverSideApiKeyIsSet ? (
        <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
      ) : null} */}

      {/* {!serverSidePluginKeysSet ? <PluginKeys /> : null} */}
    </div>
  );
};

import { FC } from 'react';

interface Props {
  text: string;
  icon: JSX.Element;
}

export const SidebarField: FC<Props> = ({ text, icon }) => {
  return (
    <div
      className="flex w-full select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white"
    >
      <div>{icon}</div>
      <span>{text}</span>
    </div>
  );
};

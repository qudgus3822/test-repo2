interface LastSyncInfoProps {
  syncDate: string;
}

export const LastSyncInfo = ({ syncDate }: LastSyncInfoProps) => {
  return (
    <p className="text-sm text-gray-500 mt-1 gap-1 flex items-center">
      <span>마지막 동기화</span>
      <span>{syncDate}</span>
      <span>(LDAP AD기준)</span>
    </p>
  );
};

export default LastSyncInfo;

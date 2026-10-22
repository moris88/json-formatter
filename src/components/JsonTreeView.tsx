import { JsonNode } from "./JsonNode";

export const JsonTreeView = ({ data }: { data: unknown }) => {
  if (data === null || data === undefined) return null;
  return (
    <div className="p-4 font-mono text-sm overflow-auto h-full min-h-0 grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner text-left">
      <JsonNode value={data} isLast={true} />
    </div>
  );
};

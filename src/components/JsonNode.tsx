import { useState } from "react";

/**
 * Componente per renderizzare un singolo valore JSON in modo ricorsivo e collassabile
 */
export const JsonNode = ({
  value,
  label,
  isLast = true,
}: {
  value: unknown;
  label?: string;
  isLast?: boolean;
  depth?: number;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);

  const toggle = () => setIsCollapsed(!isCollapsed);

  // Colori coerenti con il precedente syntax highlighting
  const colors = {
    key: "text-blue-600 dark:text-blue-400 font-medium",
    string: "text-green-600 dark:text-green-400",
    number: "text-orange-600 dark:text-orange-400",
    boolean: "text-purple-600 dark:text-purple-400 font-bold",
    null: "text-red-500 dark:text-red-400 italic",
    bracket: "text-slate-500",
  };

  const renderLabel = () =>
    label ? <span className={colors.key}>"{label}": </span> : null;

  if (!isObject) {
    let displayValue: string | number | boolean | null = value as
      | string
      | number
      | boolean
      | null;
    let cls = colors.string;

    if (typeof value === "string") {
      displayValue = `"${value}"`;
    } else if (typeof value === "number") {
      cls = colors.number;
    } else if (typeof value === "boolean") {
      cls = colors.boolean;
      displayValue = String(value);
    } else if (value === null) {
      cls = colors.null;
      displayValue = "null";
    }

    return (
      <div className="ml-4 whitespace-nowrap">
        {renderLabel()}
        <span className={cls}>{displayValue}</span>
        {!isLast && <span className={colors.bracket}>,</span>}
      </div>
    );
  }

  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const keys = Object.keys(value as object);
  const valAsObj = value as Record<string, unknown>;

  return (
    <div className="ml-4">
      <button
        type="button"
        className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-1 -ml-1 w-full text-left outline-none focus:ring-1 focus:ring-blue-200"
        onClick={toggle}
      >
        <span
          className="text-[10px] text-slate-400 w-3 inline-block transition-transform duration-200"
          style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
        {renderLabel()}
        <span className={colors.bracket}>{openBracket}</span>
        {isCollapsed && (
          <>
            <span className="text-slate-400 text-xs mx-1">
              {isArray ? ` ... ${valAsObj.length} items ` : " ... "}
            </span>
            <span className={colors.bracket}>{closeBracket}</span>
            {!isLast && <span className={colors.bracket}>,</span>}
          </>
        )}
      </button>

      {!isCollapsed && (
        <>
          <div className="border-l border-slate-200 dark:border-slate-700 ml-1.5 pl-1">
            {keys.map((key, index) => (
              <JsonNode
                key={key}
                label={isArray ? undefined : key}
                value={valAsObj[key]}
                isLast={index === keys.length - 1}
              />
            ))}
          </div>
          <div className="ml-0">
            <span className={colors.bracket}>{closeBracket}</span>
            {!isLast && <span className={colors.bracket}>,</span>}
          </div>
        </>
      )}
    </div>
  );
};

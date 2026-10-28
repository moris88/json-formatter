import { memo, useState } from "react";

// Colori coerenti con il precedente syntax highlighting
const colors = {
  key: "text-blue-600 dark:text-blue-400 font-medium",
  string: "text-green-600 dark:text-green-400",
  number: "text-orange-600 dark:text-orange-400",
  boolean: "text-purple-600 dark:text-purple-400 font-bold",
  null: "text-red-500 dark:text-red-400 italic",
  bracket: "text-slate-500",
};

// Oltre questa profondità i nodi partono collassati (rendering lazy)
const AUTO_EXPAND_DEPTH = 2;
// Numero di figli renderizzati per volta nei nodi molto grandi
const PAGE_SIZE = 100;

/**
 * Componente per renderizzare un singolo valore JSON in modo ricorsivo e collassabile
 */
export const JsonNode = memo(function JsonNode({
  value,
  label,
  isLast = true,
  depth = 0,
}: {
  value: unknown;
  label?: string;
  isLast?: boolean;
  depth?: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(depth >= AUTO_EXPAND_DEPTH);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);

  const toggle = () => setIsCollapsed(!isCollapsed);

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
  const valAsObj = value as Record<string, unknown>;
  const size = isArray
    ? (value as unknown[]).length
    : Object.keys(valAsObj).length;

  return (
    <div className="ml-4">
      <button
        type="button"
        className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-1 -ml-1 w-full text-left outline-none focus:ring-1 focus:ring-blue-200"
        onClick={toggle}
      >
        <span
          className="text-[10px] leading-none text-slate-400 w-3 h-3 shrink-0 inline-flex items-center justify-center transition-transform duration-200"
          style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
        {renderLabel()}
        <span className={colors.bracket}>{openBracket}</span>
        {isCollapsed && (
          <>
            <span className="text-slate-400 text-xs mx-1">
              {isArray ? ` ... ${size} items ` : ` ... ${size} keys `}
            </span>
            <span className={colors.bracket}>{closeBracket}</span>
            {!isLast && <span className={colors.bracket}>,</span>}
          </>
        )}
      </button>

      {!isCollapsed && (
        <ExpandedChildren
          valAsObj={valAsObj}
          isArray={isArray}
          depth={depth}
          visibleCount={visibleCount}
          onShowMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
          closeBracket={closeBracket}
          isLast={isLast}
        />
      )}
    </div>
  );
});

const ExpandedChildren = ({
  valAsObj,
  isArray,
  depth,
  visibleCount,
  onShowMore,
  closeBracket,
  isLast,
}: {
  valAsObj: Record<string, unknown>;
  isArray: boolean;
  depth: number;
  visibleCount: number;
  onShowMore: () => void;
  closeBracket: string;
  isLast: boolean;
}) => {
  const keys = Object.keys(valAsObj);
  const remaining = keys.length - visibleCount;

  return (
    <>
      <div className="border-l border-slate-200 dark:border-slate-700 ml-1.5 pl-1">
        {keys.slice(0, visibleCount).map((key, index) => (
          <JsonNode
            key={key}
            label={isArray ? undefined : key}
            value={valAsObj[key]}
            isLast={index === keys.length - 1}
            depth={depth + 1}
          />
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={onShowMore}
            className="ml-4 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            … mostra altri {Math.min(PAGE_SIZE, remaining)} (ne restano{" "}
            {remaining})
          </button>
        )}
      </div>
      <div className="ml-0">
        <span className={colors.bracket}>{closeBracket}</span>
        {!isLast && <span className={colors.bracket}>,</span>}
      </div>
    </>
  );
};

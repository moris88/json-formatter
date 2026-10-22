/**
 * Mini motore di query in stile SQL per interrogare oggetti JSON.
 *
 * Sintassi supportata:
 *   SELECT campo [AS alias], AGG(campo) [AS alias], *
 *   [FROM percorso]            -- es. users, data.items, $ (radice)
 *   [WHERE condizione]         -- =, !=, <>, <, <=, >, >=, LIKE, IN (...), IS [NOT] NULL, AND, OR, NOT
 *   [GROUP BY campo, ...]
 *   [ORDER BY campo [ASC|DESC], ...]
 *   [LIMIT n [OFFSET m]]
 *
 * Aggregati: COUNT, SUM, AVG, MIN, MAX.
 * I percorsi supportano la notazione puntata e gli indici: a.b[0].c
 */

type TokenType = "ident" | "string" | "number" | "op" | "punct" | "eof";
interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "NOT",
  "LIKE",
  "IN",
  "IS",
  "NULL",
  "TRUE",
  "FALSE",
  "AS",
  "ORDER",
  "BY",
  "ASC",
  "DESC",
  "LIMIT",
  "OFFSET",
  "GROUP",
]);
const AGGREGATES = new Set(["COUNT", "SUM", "AVG", "MIN", "MAX"]);

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      let j = i + 1;
      let str = "";
      while (j < src.length && src[j] !== ch) {
        if (src[j] === "\\" && j + 1 < src.length) j++;
        str += src[j++];
      }
      if (j >= src.length) throw new Error("Stringa non terminata");
      tokens.push({ type: "string", value: str });
      i = j + 1;
      continue;
    }
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end < 0) throw new Error("Identificatore non terminato");
      tokens.push({ type: "ident", value: src.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    const num = /^-?\d+(\.\d+)?/.exec(src.slice(i));
    if (
      num &&
      (ch !== "-" ||
        tokens.length === 0 ||
        ["op", "punct"].includes(tokens[tokens.length - 1].type))
    ) {
      tokens.push({ type: "number", value: num[0] });
      i += num[0].length;
      continue;
    }
    const ident = /^[A-Za-z_$][\w$]*(\.[\w$]+|\[\d+\])*/.exec(src.slice(i));
    if (ident) {
      tokens.push({ type: "ident", value: ident[0] });
      i += ident[0].length;
      continue;
    }
    const op = /^(<=|>=|<>|!=|=|<|>)/.exec(src.slice(i));
    if (op) {
      tokens.push({ type: "op", value: op[0] });
      i += op[0].length;
      continue;
    }
    if ("(),*;".includes(ch)) {
      if (ch !== ";") tokens.push({ type: "punct", value: ch });
      i++;
      continue;
    }
    throw new Error(`Carattere inatteso '${ch}' in posizione ${i}`);
  }
  tokens.push({ type: "eof", value: "" });
  return tokens;
}

// --- AST ---
type Expr =
  | { kind: "lit"; value: unknown }
  | { kind: "path"; path: string }
  | { kind: "bin"; op: string; left: Expr; right: Expr }
  | { kind: "not"; expr: Expr }
  | { kind: "in"; expr: Expr; list: Expr[]; negate: boolean }
  | { kind: "isnull"; expr: Expr; negate: boolean }
  | { kind: "like"; expr: Expr; pattern: Expr; negate: boolean };

type SelectItem =
  | { kind: "star" }
  | { kind: "field"; path: string; alias?: string }
  | { kind: "agg"; fn: string; path: string | null; alias?: string };

interface Query {
  select: SelectItem[];
  from: string | null;
  where: Expr | null;
  groupBy: string[];
  orderBy: { key: string; desc: boolean }[];
  limit: number | null;
  offset: number;
}

class Parser {
  private pos = 0;
  private tokens: Token[];
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }
  private next(): Token {
    return this.tokens[this.pos++];
  }
  private isKw(kw: string): boolean {
    const t = this.peek();
    return t.type === "ident" && t.value.toUpperCase() === kw;
  }
  private acceptKw(kw: string): boolean {
    if (this.isKw(kw)) {
      this.pos++;
      return true;
    }
    return false;
  }
  private expectKw(kw: string) {
    if (!this.acceptKw(kw))
      throw new Error(`Atteso ${kw}, trovato '${this.peek().value || "fine"}'`);
  }
  private isPunct(p: string): boolean {
    const t = this.peek();
    return t.type === "punct" && t.value === p;
  }
  private expectPunct(p: string) {
    if (!this.isPunct(p))
      throw new Error(
        `Atteso '${p}', trovato '${this.peek().value || "fine"}'`,
      );
    this.pos++;
  }
  private ident(): string {
    const t = this.next();
    if (t.type !== "ident" || KEYWORDS.has(t.value.toUpperCase()))
      throw new Error(`Atteso un campo, trovato '${t.value || "fine"}'`);
    return t.value;
  }

  parse(): Query {
    this.expectKw("SELECT");
    const select: SelectItem[] = [];
    do {
      select.push(this.selectItem());
    } while (this.isPunct(",") && this.next());

    let from: string | null = null;
    if (this.acceptKw("FROM")) {
      const t = this.next();
      if (t.type !== "ident") throw new Error("Atteso un percorso dopo FROM");
      from = t.value === "$" ? null : t.value.replace(/^\$\.?/, "");
    }

    const where = this.acceptKw("WHERE") ? this.orExpr() : null;

    const groupBy: string[] = [];
    if (this.acceptKw("GROUP")) {
      this.expectKw("BY");
      do {
        groupBy.push(this.ident());
      } while (this.isPunct(",") && this.next());
    }

    const orderBy: Query["orderBy"] = [];
    if (this.acceptKw("ORDER")) {
      this.expectKw("BY");
      do {
        const key = this.ident();
        let desc = false;
        if (this.acceptKw("DESC")) desc = true;
        else this.acceptKw("ASC");
        orderBy.push({ key, desc });
      } while (this.isPunct(",") && this.next());
    }

    let limit: number | null = null;
    let offset = 0;
    if (this.acceptKw("LIMIT")) {
      limit = this.integer();
      if (this.acceptKw("OFFSET")) offset = this.integer();
    }

    if (this.peek().type !== "eof")
      throw new Error(`Token inatteso '${this.peek().value}'`);
    return { select, from, where, groupBy, orderBy, limit, offset };
  }

  private integer(): number {
    const t = this.next();
    if (t.type !== "number") throw new Error("Atteso un numero");
    return Number.parseInt(t.value, 10);
  }

  private alias(): string | undefined {
    if (this.acceptKw("AS")) return this.ident();
    const t = this.peek();
    if (t.type === "ident" && !KEYWORDS.has(t.value.toUpperCase())) {
      this.pos++;
      return t.value;
    }
    return undefined;
  }

  private selectItem(): SelectItem {
    if (this.isPunct("*")) {
      this.pos++;
      return { kind: "star" };
    }
    const t = this.peek();
    const upper = t.value.toUpperCase();
    if (
      t.type === "ident" &&
      AGGREGATES.has(upper) &&
      this.tokens[this.pos + 1]?.value === "("
    ) {
      this.pos += 2;
      let path: string | null = null;
      if (this.isPunct("*")) this.pos++;
      else path = this.ident();
      this.expectPunct(")");
      return { kind: "agg", fn: upper, path, alias: this.alias() };
    }
    return { kind: "field", path: this.ident(), alias: this.alias() };
  }

  private orExpr(): Expr {
    let left = this.andExpr();
    while (this.acceptKw("OR"))
      left = { kind: "bin", op: "OR", left, right: this.andExpr() };
    return left;
  }

  private andExpr(): Expr {
    let left = this.notExpr();
    while (this.acceptKw("AND"))
      left = { kind: "bin", op: "AND", left, right: this.notExpr() };
    return left;
  }

  private notExpr(): Expr {
    if (this.acceptKw("NOT")) return { kind: "not", expr: this.notExpr() };
    if (this.isPunct("(")) {
      this.pos++;
      const e = this.orExpr();
      this.expectPunct(")");
      return e;
    }
    return this.comparison();
  }

  private comparison(): Expr {
    const left = this.operand();
    const t = this.peek();
    if (t.type === "op") {
      this.pos++;
      return { kind: "bin", op: t.value, left, right: this.operand() };
    }
    if (this.acceptKw("IS")) {
      const negate = this.acceptKw("NOT");
      this.expectKw("NULL");
      return { kind: "isnull", expr: left, negate };
    }
    const negate = this.acceptKw("NOT");
    if (this.acceptKw("LIKE"))
      return { kind: "like", expr: left, pattern: this.operand(), negate };
    if (this.acceptKw("IN")) {
      this.expectPunct("(");
      const list: Expr[] = [];
      do {
        list.push(this.operand());
      } while (this.isPunct(",") && this.next());
      this.expectPunct(")");
      return { kind: "in", expr: left, list, negate };
    }
    if (negate) throw new Error("Atteso LIKE o IN dopo NOT");
    return left;
  }

  private operand(): Expr {
    const t = this.next();
    if (t.type === "string") return { kind: "lit", value: t.value };
    if (t.type === "number") return { kind: "lit", value: Number(t.value) };
    if (t.type === "ident") {
      const upper = t.value.toUpperCase();
      if (upper === "NULL") return { kind: "lit", value: null };
      if (upper === "TRUE") return { kind: "lit", value: true };
      if (upper === "FALSE") return { kind: "lit", value: false };
      if (KEYWORDS.has(upper))
        throw new Error(`Parola chiave inattesa '${t.value}'`);
      return { kind: "path", path: t.value };
    }
    throw new Error(`Valore inatteso '${t.value || "fine"}'`);
  }
}

// --- Valutazione ---

export function getPath(obj: unknown, path: string): unknown {
  if (path === "" || path === "$") return obj;
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function evaluate(e: Expr, row: unknown): unknown {
  switch (e.kind) {
    case "lit":
      return e.value;
    case "path":
      return getPath(row, e.path);
    case "not":
      return !evaluate(e.expr, row);
    case "isnull": {
      const v = evaluate(e.expr, row);
      const isNull = v === null || v === undefined;
      return e.negate ? !isNull : isNull;
    }
    case "in": {
      const v = evaluate(e.expr, row);
      const found = e.list.some((x) => evaluate(x, row) === v);
      return e.negate ? !found : found;
    }
    case "like": {
      const v = evaluate(e.expr, row);
      const pattern = String(evaluate(e.pattern, row));
      const re = new RegExp(
        `^${pattern
          .replace(/[.+^${}()|[\]\\?*]/g, "\\$&")
          .replace(/%/g, ".*")
          .replace(/_/g, ".")}$`,
        "i",
      );
      const match = v !== null && v !== undefined && re.test(String(v));
      return e.negate ? !match : match;
    }
    case "bin": {
      if (e.op === "AND")
        return evaluate(e.left, row) && evaluate(e.right, row);
      if (e.op === "OR") return evaluate(e.left, row) || evaluate(e.right, row);
      const l = evaluate(e.left, row) as number | string;
      const r = evaluate(e.right, row) as number | string;
      switch (e.op) {
        case "=":
          return l === r;
        case "!=":
        case "<>":
          return l !== r;
        case "<":
          return l < r;
        case "<=":
          return l <= r;
        case ">":
          return l > r;
        case ">=":
          return l >= r;
      }
    }
  }
  return undefined;
}

function aggregate(fn: string, path: string | null, rows: unknown[]): unknown {
  if (fn === "COUNT") {
    if (!path) return rows.length;
    return rows.filter((r) => {
      const v = getPath(r, path);
      return v !== null && v !== undefined;
    }).length;
  }
  const values = rows
    .map((r) => (path ? getPath(r, path) : r))
    .filter((v) => v !== null && v !== undefined);
  if (values.length === 0) return null;
  const nums = values.map(Number).filter((n) => !Number.isNaN(n));
  switch (fn) {
    case "SUM":
      return nums.reduce((a, b) => a + b, 0);
    case "AVG":
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    case "MIN":
      return values.reduce((a, b) => ((b as number) < (a as number) ? b : a));
    case "MAX":
      return values.reduce((a, b) => ((b as number) > (a as number) ? b : a));
  }
  return null;
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function itemName(item: SelectItem): string {
  if (item.kind === "field") return item.alias ?? item.path;
  if (item.kind === "agg")
    return item.alias ?? `${item.fn}(${item.path ?? "*"})`;
  return "*";
}

export function runQuery(sql: string, data: unknown): unknown[] {
  const q = new Parser(tokenize(sql)).parse();

  const source = q.from ? getPath(data, q.from) : data;
  if (source === undefined)
    throw new Error(`Percorso FROM '${q.from}' non trovato`);
  let rows: unknown[] = Array.isArray(source) ? source : [source];

  if (q.where) {
    const where = q.where;
    rows = rows.filter((r) => Boolean(evaluate(where, r)));
  }

  const hasAgg = q.select.some((s) => s.kind === "agg");
  let pairs: { row: unknown; out: Record<string, unknown> | unknown }[];

  const project = (row: unknown, group: unknown[]) => {
    if (q.select.length === 1 && q.select[0].kind === "star") return row;
    const out: Record<string, unknown> = {};
    for (const item of q.select) {
      if (item.kind === "star") {
        if (row && typeof row === "object" && !Array.isArray(row))
          Object.assign(out, row);
      } else if (item.kind === "field") {
        out[itemName(item)] = getPath(row, item.path);
      } else {
        out[itemName(item)] = aggregate(item.fn, item.path, group);
      }
    }
    return out;
  };

  if (hasAgg || q.groupBy.length > 0) {
    const groups = new Map<string, unknown[]>();
    for (const r of rows) {
      const key = JSON.stringify(q.groupBy.map((g) => getPath(r, g)));
      const g = groups.get(key);
      if (g) g.push(r);
      else groups.set(key, [r]);
    }
    if (groups.size === 0 && q.groupBy.length === 0) groups.set("[]", []);
    pairs = [...groups.values()].map((g) => ({
      row: g[0],
      out: project(g[0], g),
    }));
  } else {
    pairs = rows.map((r) => ({ row: r, out: project(r, [r]) }));
  }

  if (q.orderBy.length > 0) {
    const keyOf = (p: (typeof pairs)[number], key: string) =>
      p.out && typeof p.out === "object" && key in (p.out as object)
        ? (p.out as Record<string, unknown>)[key]
        : getPath(p.row, key);
    pairs.sort((a, b) => {
      for (const { key, desc } of q.orderBy) {
        const c = compareValues(keyOf(a, key), keyOf(b, key));
        if (c !== 0) return desc ? -c : c;
      }
      return 0;
    });
  }

  let result = pairs.map((p) => p.out);
  if (q.offset) result = result.slice(q.offset);
  if (q.limit !== null) result = result.slice(0, q.limit);
  return result;
}

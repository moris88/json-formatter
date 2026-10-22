/**
 * Generatore di interfacce TypeScript a partire da un valore JSON.
 * Gli elementi degli array vengono uniti in un'unica forma: i campi assenti
 * in alcuni oggetti diventano opzionali, i tipi diversi diventano unioni.
 */

type Prim = "string" | "number" | "boolean" | "null";

interface TypeNode {
  prims: Set<Prim>;
  obj?: ObjShape;
  arr?: TypeNode;
  hasArr: boolean;
}

interface ObjShape {
  count: number;
  fields: Map<string, { node: TypeNode; count: number }>;
}

const emptyNode = (): TypeNode => ({ prims: new Set(), hasArr: false });

const addValue = (node: TypeNode, value: unknown) => {
  if (value === null) {
    node.prims.add("null");
  } else if (Array.isArray(value)) {
    node.hasArr = true;
    for (const item of value) {
      node.arr ??= emptyNode();
      addValue(node.arr, item);
    }
  } else if (typeof value === "object") {
    node.obj ??= { count: 0, fields: new Map() };
    node.obj.count++;
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      let field = node.obj.fields.get(key);
      if (!field) {
        field = { node: emptyNode(), count: 0 };
        node.obj.fields.set(key, field);
      }
      field.count++;
      addValue(field.node, v);
    }
  } else {
    node.prims.add(typeof value as Prim);
  }
};

const toPascalCase = (s: string) => {
  const name = s
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string | undefined) =>
      c ? c.toUpperCase() : "",
    )
    .replace(/^./, (c) => c.toUpperCase());
  if (!name) return "Item";
  return /^[0-9]/.test(name) ? `T${name}` : name;
};

const singularize = (s: string) => {
  if (/ies$/i.test(s)) return `${s.slice(0, -3)}y`;
  if (/(ss|us)$/i.test(s)) return s;
  if (/s$/i.test(s) && s.length > 1) return s.slice(0, -1);
  return `${s}Item`;
};

const formatKey = (key: string) =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);

export interface TypeGenOptions {
  rootName?: string;
  useType?: boolean;
  exportTypes?: boolean;
}

export const generateTypes = (
  data: unknown,
  {
    rootName = "Root",
    useType = false,
    exportTypes = true,
  }: TypeGenOptions = {},
): string => {
  const root = emptyNode();
  addValue(root, data);

  const declarations: string[] = [];
  const usedNames = new Set<string>();
  // corpo dell'interfaccia -> nome già assegnato (evita duplicati identici)
  const bodyToName = new Map<string, string>();
  const prefix = exportTypes ? "export " : "";

  const uniqueName = (base: string) => {
    let name = base;
    for (let i = 2; usedNames.has(name); i++) name = `${base}${i}`;
    usedNames.add(name);
    return name;
  };

  const emitObject = (obj: ObjShape, nameHint: string): string => {
    const lines = [...obj.fields].map(([key, field]) => {
      const optional = field.count < obj.count ? "?" : "";
      const type = emitNode(field.node, toPascalCase(key));
      return `  ${formatKey(key)}${optional}: ${type};`;
    });
    const body = lines.length ? `{\n${lines.join("\n")}\n}` : "{}";
    const existing = bodyToName.get(body);
    if (existing) return existing;

    const name = uniqueName(nameHint);
    bodyToName.set(body, name);
    declarations.push(
      useType
        ? `${prefix}type ${name} = ${body};`
        : lines.length
          ? `${prefix}interface ${name} ${body}`
          : `${prefix}type ${name} = Record<string, unknown>;`,
    );
    return name;
  };

  const emitNode = (node: TypeNode, nameHint: string): string => {
    const parts: string[] = [];
    if (node.obj) parts.push(emitObject(node.obj, nameHint));
    if (node.hasArr) {
      const inner = node.arr
        ? emitNode(node.arr, singularize(nameHint))
        : "unknown";
      parts.push(inner.includes(" | ") ? `(${inner})[]` : `${inner}[]`);
    }
    for (const p of ["string", "number", "boolean"] as const) {
      if (node.prims.has(p)) parts.push(p);
    }
    if (node.prims.has("null")) parts.push("null");
    return parts.length ? parts.join(" | ") : "unknown";
  };

  const rootType = emitNode(root, toPascalCase(rootName));
  if (!usedNames.has(rootType)) {
    // radice non oggetto (array o primitivo): alias esplicito
    declarations.push(
      `${prefix}type ${uniqueName(toPascalCase(rootName))} = ${rootType};`,
    );
  }

  // le dichiarazioni annidate vengono emesse prima: la radice va in cima
  return declarations.reverse().join("\n\n");
};

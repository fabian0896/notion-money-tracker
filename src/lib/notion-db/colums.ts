import { Column } from "./db-types";

export function id(): Column<string> {
  return {
    type: "id",
    notionName: "",
    serialize: (value: string) => {
      return { id: value };
    },
    deserialize: (_notion: any, page) => {
      return page.id;
    },
  };
}

export function emoji(): Column<string> {
  return {
    type: "id",
    notionName: "_emoji",
    serialize: (value: string) => {
      return { id: value };
    },
    deserialize: (_notion: any, page) => {
      const icon = page.icon;
      if (icon?.type !== 'emoji') return '';
      return icon.emoji;
    },
  };
}

export function string(notionName: string): Column<string> {
  return {
    type: "rich_text",
    notionName,
    serialize: (value: string) => ({
      rich_text: [{ text: { content: value } }],
    }),
    deserialize: (notion: any) => {
      const texts = notion.rich_text || [];
      return texts.map((t: any) => t.plain_text).join("");
    },
  };
}

export function title(notionName: string): Column<string> {
  return {
    type: "title",
    notionName,
    serialize: (value: string) => ({
      title: [{ text: { content: value } }],
    }),
    deserialize: (notion: any) => {
      const texts = notion.title || [];
      return texts.map((t: any) => t.plain_text).join("");
    },
  };
}

export function select<T extends readonly string[]>(
  notionName: string,
  options: T
): Column<T[number] | null> {
  return {
    type: "select",
    notionName,
    options,
    serialize: (value: T[number] | null) => ({
      select: value ? { name: value } : null,
    }),
    deserialize: (notion: any) => {
      return notion.select?.name || null;
    },
  };
}

export function multiSelect<T extends readonly string[]>(
  notionName: string,
  options: T
): Column<T[number][]> {
  return {
    type: "multi_select",
    notionName,
    options,
    serialize: (value: T[number][]) => ({
      multi_select: value.map((v) => ({ name: v })),
    }),
    deserialize: (notion: any) => {
      return (notion.multi_select || []).map((s: any) => s.name);
    },
  };
}

export function checkbox(notionName: string): Column<boolean> {
  return {
    type: "checkbox",
    notionName,
    serialize: (value: boolean) => ({ checkbox: value }),
    deserialize: (notion: any) => notion.checkbox || false,
  };
}

export function number(notionName: string): Column<number | null> {
  return {
    type: "number",
    notionName,
    serialize: (value: number | null) => ({ number: value }),
    deserialize: (notion: any) => notion.number ?? null,
  };
}

export function date(notionName: string): Column<string | null> {
  return {
    type: "date",
    notionName,
    serialize: (value: string | null) => ({
      date: value ? { start: value } : null,
    }),
    deserialize: (notion: any) => notion.date?.start || null,
  };
}

export function richText(notionName: string): Column<string> {
  return string(notionName);
}

export function relation(notionName: string): Column<string | undefined> {
  return {
    type: "relation",
    notionName,
    serialize: (value: string | undefined) => ({
      relation: value ? [{ id: value }] : [],
    }),
    deserialize: (notion: any) => notion.relation?.[0]?.id || undefined,
  };
}
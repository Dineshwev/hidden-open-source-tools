export async function fetchAllSupabaseRows<T>(
  createQuery: () => any,
  pageSize = 500
): Promise<T[]> {
  const rows: T[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await createQuery().range(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);

    const page = (data || []) as T[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

Migrate database using Supabase MCP server

Steps:

1. Use `mcp_supabase_list_projects` to find the project
2. Use `mcp_supabase_list_tables` to see current schema
3. Apply migrations using `mcp_supabase_apply_migration`
4. Verify with `mcp_supabase_list_tables`
5. Check for security advisors: `mcp_supabase_get_advisors`

Important: Always implement RLS policies for new tables
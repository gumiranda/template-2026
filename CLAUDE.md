## Navigation

Never use `<Button onClick={() => router.push("/path")}>` for navigation links.
Always use `next/link` `<Link>` component instead. When you need a Button that navigates, use the `asChild` pattern:

```tsx
<Button asChild variant="outline">
  <Link href="/path">
    <Icon className="mr-2 h-4 w-4" />
    Label
  </Link>
</Button>
```

This ensures proper prefetching, accessibility (renders as `<a>`), and follows Next.js best practices.
Reserve `router.push()` only for programmatic navigation after async operations (e.g., after form submission, after mutation completes).

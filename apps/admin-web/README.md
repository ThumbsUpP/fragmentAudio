# FragmentAudio Admin Web

Small static admin frontend for the v2 API.

## Run

Start the API first:

```bash
pnpm --filter api build
pnpm --filter api start
```

Then serve this folder:

```bash
pnpm --filter admin-web start
```

Open:

```text
http://localhost:5173
```

The frontend defaults to `http://localhost:4000`. You can change the API URL from the top bar.

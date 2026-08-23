# Screenshots

Drop real product screenshots here as PNG (recommended 1200x840 or larger,
16:9-ish). The hero previews already point at these paths and fall back to
`placeholder.svg` until each file exists.

| File | Used on | What it shows |
| --- | --- | --- |
| `bukubiz-agents.png` | home + Bukubiz | Bukubiz agent dashboard (departments) |
| `mybuku-dashboard.png` | myBuku | myBuku dashboard |
| `dentalos-clinic.png` | DentalOS | DentalOS clinic dashboard |

Once a real file exists at the path, it replaces the placeholder automatically
(no code change). After all three are added, remove the `onerror` fallback from
the `<img>` tags in the pages.

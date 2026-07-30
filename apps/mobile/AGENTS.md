# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# UI

Read `docs/UI_DESIGN_STANDARD.md` before touching any screen or component.

Rule one from that document: **no hex colours, loose sizes, or loose spacing in
screen files** — everything comes from `src/theme/tokens.ts`. If a value is not
there, either it is not in the design (ask) or it is genuinely new (add the token
first, then use it).

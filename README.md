# Fiona Pepe website source

A self-contained HTML/CSS/JavaScript implementation of the approved Fiona Pepe desktop mockup, with interactive overlays and a separately adapted mobile layout. The project needs no framework or build step.

## Run locally

1. Unzip this folder.
2. Open `index.html` for a basic local preview. For the most reliable clipboard and canvas behavior, serve it on `localhost` instead:

   ```sh
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000/` in your browser. Any static web host can serve the same files; upload the **contents** of this folder with `index.html` at its root.

## Add the real token information

Open `config.js` and enter the confirmed values between the quotes:

```js
window.FIONAPE_CONFIG = {
  contractAddress: 'YOUR_CONFIRMED_CONTRACT_ADDRESS',
  xUrl: 'https://x.com/YOUR_ACCOUNT',
  telegramUrl: 'https://t.me/YOUR_GROUP'
};
```

Leave an item as an empty string if it is not ready. The CA copy button and social links remain disabled until their respective values are entered. Never paste a private key or wallet seed phrase into the site.

## Accuracy and animation

The six `assets/sections/*.png` files are exact, unaltered horizontal strips of the approved 1024 × 1536 mockup. At their native resolution they assemble into the reference without changing a pixel, preserving original type, curved boundaries, artwork and small decorations. The contract/social bar is added above the mockup as requested.

The desktop artwork stretches edge to edge with the viewport. The original scenery, lettering and Fiona are still baked into the supplied images, so these parts are not independently animated. Separate foreground lilies, petals, foliage and sunlight move above the art. A feathered canvas overlay continuously refracts selected areas of the original water; expanding ripples appear automatically and when a visitor clicks the water or activates the ripple control. The animation is a layered 2-D effect, not a 3-D water simulation, and the visible result changes the original pixels during motion. Mobile uses an adapted layout with swaying foliage, animated water highlights, floating lilies, and a tap-to-ripple button. Browser reduced-motion preferences disable decorative animation.

The mobile layout reuses the project's separate artwork and readable HTML/CSS text. It is an adaptation because no original mobile mockup was supplied; it is not an exact reproduction of the desktop mockup.

## Site navigation and accessibility

The mockup's desktop navigation and button artwork are real, keyboard-focusable hotspots. An accessible equivalent of the text is provided for assistive technology, since the exact desktop lettering is part of images. The top bar contains live HTML controls, and the mobile version uses HTML text. Mobile wordmarks are displayed as image masks with accessible labels. The included fonts are used on mobile; license information is in `assets/fonts/FONT_LICENSE.txt`.

`config.js` is public, as it must be for a static site; include only public addresses and URLs. No wallet connection, transaction, server, tracking, contract deployment, or links to third-party code are included.

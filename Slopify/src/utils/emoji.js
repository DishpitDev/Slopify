const emojis = {
  ayaya: "/public/emojis/ayaya.png",
  clueless: "/public/emojis/clueless.png",
  dopepe: "/public/emojis/dopepe.png",
  dread: "/public/emojis/dread.png",
  endme: "/public/emojis/endMe.png",
  feelsbadman: "/public/emojis/feelsBadMan.png",
  kekw: "/public/emojis/kekw.png",
  laughingpepe: "/public/emojis/laughingPepe.png",
  lfg: "/public/emojis/lfg.png",
  minipog: "/public/emojis/minipog.png",
  monkagiga: "/public/emojis/monkaGiga.png",
  monkas: "/public/emojis/monkaS.png",
  monkasnake: "/public/emojis/monkaSnake.png",
  pogu: "/public/emojis/pogU.png",
  pooga: "/public/emojis/pooga.png",
  superkek: "/public/emojis/superkek.png",
  thonk: "/public/emojis/thonk.png",
  weirdga: "/public/emojis/weirdga.png",
};

await fetch("https://api.github.com/emojis")
  .then((response) => response.json())
  .catch(() => ({}))
  .then((data) => {
    for (let emoji in data) {
      emojis[emoji] = data[emoji];
    }
  });

export function createEmojiElement(emoji) {
  return (
    emoji in emojis &&
    `<img class="emoji" src="${emojis[emoji]}" alt="${emoji}" width="20" height="20">`
  );
}

export const EMOJI_REGEX = /:[a-z0-9_]+:/g;

export default emojis;

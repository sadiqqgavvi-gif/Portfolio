// Only the brand icons the site uses, imported by name so the bundle does not carry all of simple-icons.
import {
  siClaude,
  siCss,
  siDocker,
  siExpress,
  siGit,
  siGithub,
  siGithubactions,
  siGoogle,
  siGooglegemini,
  siGreensock,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siMongodb,
  siMongoose,
  siMysql,
  siNetlify,
  siNodedotjs,
  siReact,
  siSocketdotio,
  siTailwindcss,
  siThreedotjs,
  siVercel,
  siVite,
  siWebrtc
} from 'simple-icons';

export const icons = {
  siClaude,
  siCss,
  siDocker,
  siExpress,
  siGit,
  siGithub,
  siGithubactions,
  siGoogle,
  siGooglegemini,
  siGreensock,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siMongodb,
  siMongoose,
  siMysql,
  siNetlify,
  siNodedotjs,
  siReact,
  siSocketdotio,
  siTailwindcss,
  siThreedotjs,
  siVercel,
  siVite,
  siWebrtc
};

// Brand colours that are near-black are invisible on the dark page; show those in white instead.
export function brandColor(icon) {
  if (!icon) return '#ededee';
  const n = parseInt(icon.hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 70 ? '#ededee' : `#${icon.hex}`;
}

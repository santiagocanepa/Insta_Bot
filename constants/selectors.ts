import { join } from 'node:path'
import { config } from 'dotenv'

config()

export const selectors = {
  loginSelectors: {
    usernameInput: 'input[aria-label="Phone number, username, or email"]',
    passwordInput: 'input[aria-label="Password"',
    isLoginSelector: 'span.xuxw1ft'
  },
  actionsSelectors: {

    //Datos
    username: 'div.x9f619 a._a6hd span._ap3a',
    descriptionSpan: 'div.x9f619 span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft',

    //Follow
    followButton: 'div.x9f619 button._acan',
    //unFollow    UnfollowProfileButton: 'div._ap3a._aaco._aacw._aad6._aade[dir="auto"]:contains("Following")', // Selector para "Following"

    UnfollowProfileButton: 'div._ap3a._aaco._aacw._aad6._aade[dir="auto"]', // Selector para "Following"
    confirmUnfollowProfileButton: 'span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft', // Selector para "Unfollowing"
    unfollowListButton: 'div.xsz8vos[role="button"]',
    confirmUnfollowListButton: 'button._a9-_',
    usernameSelector : 'div[role="dialog"] div.x1dm5mii.x16mil14.xiojian.x1yutycm.x1lliihq.x193iq5w.xh8yej3 a._a6hd span._ap3a',
   
    //followSelector: 'button._ap30[type="button"]',

    //Follow List Button
    followersButton: 'a[href*="/followers/"]',
    followingButton: 'a[href*="/following/"]',
    photoButton: 'a span:contains("personas más"), a span:contains("others"), a span:contains("likes")', // Añadido


    //Follow Modals
    outerModalSelector: 'div[role="dialog"]',
    innerModalSelectorF: 'div.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6',
    innerModalSelectorPhoto: 'div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.xeuugli div[style*="overflow: hidden auto"]',

        //Interaction
    ButtonLikes: 'svg[aria-label="Like"]',
    NotificationsModal: "//button[contains(text(), 'Not Now')]" // Añadir el selector XPath
    
  }
}


export const credentials = {
  username: process.env.USERNAME ?? 'unknown',
  password: process.env.PASSWORD ?? 'unknown',
  userTofollow: process.env.USER_TO_FOLLOW ?? 'unknown',
  followersOrFollowing: process.env.FOLLOWERS_OR_FOLLOWING ?? 'unknown',
  photo: process.env.PHOTO ?? 'unknown',
  UserCheck: process.env.USERCHECK ?? 'unknown',
  probInteractions: parseFloat(process.env.PROB_INTERACTIONS ?? '0.15'),
  probFeedOrStory: parseFloat(process.env.PROB_FEED_OR_STORIES ?? '0.15')
}


export const paths = {
  cookiesPath: join(process.cwd(), 'cookies', 'cookies.json')
}



const paginasAdicionales: string[] = [
  'https://www.google.com',
  'https://www.linkedin.com',
  'https://drive.google.com',
  'https://mail.google.com',
  'https://www.tradingview.com',
  'https://www.github.com',
  'https://www.youtube.com',
  'https://www.twitter.com',
  'https://www.reddit.com',
  'https://www.amazon.com',
];

// Función para obtener una página aleatoria
function obtenerPaginaAleatoria(): string {
  const indiceAleatorio = Math.floor(Math.random() * paginasAdicionales.length);
  return paginasAdicionales[indiceAleatorio];
}

export const url = {
  mainUrl: `https://www.instagram.com/`,
  photoUrl: `https://www.instagram.com/${credentials.photo}`,
  followUrl: `https://www.instagram.com/${credentials.userTofollow}`,
  unfollowUrl: `https://www.instagram.com/${credentials.username}/following/`,
  userUrl:`https://www.instagram.com/${credentials.username}/`,
  urlRandom: obtenerPaginaAleatoria()

}
export const DEMO_VIEWER = {
  id: "demo-viewer",
  email: "demo@overture.app",
  name: "Demo Listener",
  avatarUrl: null,
};

const dawnChime =
  "data:audio/wav;base64,UklGRoQJAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YWAJAAAAAAsAKwBgAKYA+QBXAboBHQJ6AswCDwM7A08DRQMbA9ACYgLTASUBWgB3/4H+gP15/HT7e/qU+cn4Ifij91b3Pvdh97/3Wvgx+UL6iPv9/Jn+UwAiAvkDzQWRBzkJuAoDDBAN1A1IDmUOKA6PDZkMSwuqCbwHjAUmA5cA7/09+5P4Avab82/xje8E7t/sKuzr6yjs4uwY7sfv5fFq9Ef3bvrL/UwB2wRiCMsL/w7qEXcUlRYzGEUZwBmfGeAYgheMFQYT/Q+CDKcIgwQuAML7WvcR8wPvSev+5zblBuN94argk+A94afizOSi5xrrIe+i84H4pP3rAjYIZQ1XEuwWCBuPHmghfyPGJDAltyRcIyMhFh5GGsYVsRAiCzsFH//x+Nny/Ox/54TiLN6U2tXXAtYq1VXVhda32OHb8d/T5GvqsfBU9yz+DgXSC08SXBjWHZwijyaaKagrryymLJArcSlYJlYihR0BGOwRagujBMD96vZM8A3qUuQ/3/PahtcP1ZzTNtPe05LVR9js22zgq+WJ6+Txk/hw/1AGCg11E2oZxR5mIzAnDirtK8Eshyw/K/IorCWDIY4c7RbBEC8KYAN8/K71Hu/06FbjZd5A2gDXt9R100DTG9T/1eHYsNxV4bTmrOwZ89T5tACQBz8OlxRyGq0fKSTKJ3kqKCzLLF8s5ipqKPkkqCCSG9QVkg/yCBwCOftz9PPt4edg4pLdldmB1mjUV9NU02DUdNaD2XvdReLC59LtUfQW+/gBzwhxD7UVdRuPIOUkWijcKloszCwuLIUq2ic+JMcfjxq3FGEOtAfYAPf5O/PM7NLmcOHG3PPYC9Yi1ELTcdOu1PHWLdpO3jrj1ej97ov1WPw8AwwKnxDOFnIcayGZJeMoNiuDLMMs9CsaKkInfCPfHocZlRMsDXQGlP+3+AbyqevI5YbgAtxY2J7V5dM205fTBdV3197aJ9825O3pKvDH9pz9fwRHC8sR4xdqHT8iRSZjKYcroyyxLLArpymiJrIi8R16GG8S9QsyBVD+ePfT8IvqxOSi30Tbxdc51bDTNNPG02XVBdiY2wfgN+UK61vxBfjg/sEFgAzyEvMYXB4NI+om2ynPK7oslixkKysp+iXiIf0caBdGEbsK8AMM/Tr2pO9w6cXjxd6P2jrX3dSF0zrT/9PN1ZzYWNzt4D7mKuyP8kX5JAACB7YNFhT9GUcf0yOHJ0sqDyzILHIsDyunKEolCiEDHFEWGRB/CawCyfv/9HjuWujM4u/d4Nm41orUY9NK00DUP9Y62SDd2uFJ50/txvOG+mgBQgjpDjYVAxssIJIkGyixKkUszCxFLLEqGyiSJCwgAxs2FekOQghoAYb6xvNP7Unn2uEg3TrZP9ZA1ErTY9OK1LjW4Nnv3cziWuh47v/0yfusAn8JGRBRFgMcCiFKJacoDytyLMgsDyxLKocn0yNHH/0ZFhS2DQIHJABF+Y/yKuw+5u3gWNyc2M3V/9M604XT3dQ614/axd7F43DppO869gz98AO7CkYRaBf9HOIh+iUrKWQrliy6LM8r2ynqJg0jXB7zGPISgAzBBeD+Bfhb8QrrN+UH4JjbBdhl1cbTNNOw0znVxddE26LfxOSL6tPwePdQ/jIF9QtvEnoY8R2yIqImpymwK7EsoyyHK2MpRSY/Imod4xfLEUcLfwSc/cf2KvDt6TbkJ9/e2nfXBdWX0zbT5dOe1VjYAtyG4MjlqesG8rf4lP90BiwNlROHGd8efCNCJxoq9CvDLIMsNivjKJklayFyHM4WnxAMCjwDWPyL9f3u1eg6407eLdrx1q7UcdNC0yLUC9bz2MbccOHS5szsO/P3+dgAtAdhDrcUjxrHHz4k2ieFKi4szCxaLNwqWijlJI8gdRu1FXEPzwj4ARb7UfTS7cLnReJ73YPZdNZg1FTTV9No1IHWldmS3WDi4efz7XP0OfscAvIIkg/UFZIbqCD5JGoo5ipfLMssKCx5KsonKSStH3IalxQ/DpAHtADU+RnzrOy05lXhsNzh2P/VG9RA03XTt9QA10DaZd5W4/ToHu+u9Xz8YAMvCsEQ7RaOHIMhrCXyKD8rhyzBLO0rDiowJ2YjxR5qGXUTCg1QBnD/k/jk8Ynrq+Vs4OzbR9iS1d7TNtOc0w/Vhtfz2j/fUuQN6kzw6vbA/aMEagvsEQEYhR1WIlgmcSmQK6YsryyoK5opjyacItYdXBhPEtILDgUs/lT3sfBr6qfkid8w27XXL9Wr0zTTzNNw1RbYrdsg4FTlKet98Sn4BP/lBaIMExMQGXYeIyP8Jugp1yu8LJMsWysdKeYlyiHhHEkXJRGYCswD6PwX9oLvUemp463ee9os19TUgdM80wXU2tWt2G7cB+Fb5kvssfJp+UgAJgfYDTYUGxphH+kjlydWKhUsySxtLAUrmCg2JfIg5hsyFvcPXAmIAqX73PRW7jzoseLY3c7ZqtaB1GDTTNNI1EzWTNk33fThaOdw7ejzqvqMAWUICw9WFR8bRSCnJCsovCpKLMwsPyymKgsofSQTIOYaFhXHDh4IRAFj+qPzLu0r57/hCt0o2TLWONRI02bTk9TG1vPZB97o4nnome4i9e370AKjCTsQcRYfHCIhXiW3KBkrdizHLAgsPyp2J70jLR/gGfYTkw3eBgAAIvlt8grsIObT4EPcitjB1fjTOdOK0+fUSdei2t7e4eOP6cXvXfYw/RME3gpnEYcXGB35IQ0mOiltK5osuCzIK84p2Cb2IkEe1RjSEl0MnQW+/vz3gPFx6/HlIeEb3fbZwNeF1kjWCNe92Fnbyd714sLnEe2+8qj4qP6aBFsKxw/BFCoZ6hzuHyUihiMKJLMjhiKNINcdeRqIFh8SWw1bCD0DIv4o+W30DPAf7Lzo9OXW423ivOHF4YXi9OMF5qnozetc7z7zWfeU+9T//wP8B7QLEQ8BEnQUXha2F3cYnxgyGDUXsRWzE0kRhg58Cz8I5QSCASz++Pr39zv10/LL8C/vA+5N7Q/tRO3r7fruaPAq8jL0cvbZ+Ff73f1aAL8C/QQIB9YIXAqUC3kMCQ1DDSkNvwwLDBUL5QmGCAIHZQW7Aw8CbADd/mr9HPz6+gj6S/nF+Hb4XPh2+L/4MvnJ+X36R/sg/AD93/23/oL/OgDaAGAByQETAkACUQJHAiYC8QGuAWEBEAG/AHMAMwA=";

const copperPulse =
  "data:audio/wav;base64,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";

const silverHiss =
  "data:audio/wav;base64,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";

export const mockArtists = [
  { id: "artist-aurora-echo", name: "Aurora Echo", imageUrl: null },
  { id: "artist-golden-static", name: "Golden Static", imageUrl: null },
  { id: "artist-silt-and-signal", name: "Silt & Signal", imageUrl: null },
];

export const mockAlbums = [
  {
    id: "album-midnight-bloom",
    title: "Midnight Bloom",
    artistId: "artist-aurora-echo",
    coverUrl: null,
    releaseYear: 2025,
  },
  {
    id: "album-sunline-motel",
    title: "Sunline Motel",
    artistId: "artist-golden-static",
    coverUrl: null,
    releaseYear: 2024,
  },
  {
    id: "album-rust-and-rain",
    title: "Rust & Rain",
    artistId: "artist-silt-and-signal",
    coverUrl: null,
    releaseYear: 2026,
  },
];

export const mockTracks = [
  {
    id: "track-nightglass",
    title: "Nightglass",
    albumId: "album-midnight-bloom",
    duration: 187,
    audioUrl: dawnChime,
  },
  {
    id: "track-blue-lattice",
    title: "Blue Lattice",
    albumId: "album-midnight-bloom",
    duration: 201,
    audioUrl: silverHiss,
  },
  {
    id: "track-late-bus-home",
    title: "Late Bus Home",
    albumId: "album-sunline-motel",
    duration: 214,
    audioUrl: copperPulse,
  },
  {
    id: "track-neon-turnpike",
    title: "Neon Turnpike",
    albumId: "album-sunline-motel",
    duration: 194,
    audioUrl: dawnChime,
  },
  {
    id: "track-dry-river-radio",
    title: "Dry River Radio",
    albumId: "album-rust-and-rain",
    duration: 226,
    audioUrl: copperPulse,
  },
  {
    id: "track-red-clay-repeat",
    title: "Red Clay Repeat",
    albumId: "album-rust-and-rain",
    duration: 205,
    audioUrl: silverHiss,
  },
];

export const mockPlaylists = [
  {
    id: "playlist-open-road",
    name: "Open Road",
    description: "A road-trip queue that shows how playlists, playback, and search work together.",
    coverUrl: null,
    userId: DEMO_VIEWER.id,
    isPublic: true,
    trackIds: [
      "track-nightglass",
      "track-late-bus-home",
      "track-dry-river-radio",
    ],
  },
  {
    id: "playlist-slow-signal",
    name: "Slow Signal",
    description: "A slower-paced mix for checking queue switching and the bottom player.",
    coverUrl: null,
    userId: DEMO_VIEWER.id,
    isPublic: true,
    trackIds: [
      "track-blue-lattice",
      "track-neon-turnpike",
      "track-red-clay-repeat",
    ],
  },
];
